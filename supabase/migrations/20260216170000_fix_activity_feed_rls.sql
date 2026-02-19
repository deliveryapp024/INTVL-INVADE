-- Fix RLS policies for activity_feed table
-- The trigger function needs to insert data, but RLS was blocking it

-- Drop existing policies on activity_feed
DROP POLICY IF EXISTS "Admins can view activity feed" ON activity_feed;
DROP POLICY IF EXISTS "Allow trigger to insert activity" ON activity_feed;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON activity_feed;

-- Recreate the admin view policy
CREATE POLICY "Admins can view activity feed"
  ON activity_feed FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin', 'support'));

-- Allow inserts by authenticated users (for the trigger)
CREATE POLICY "Allow authenticated inserts to activity feed"
  ON activity_feed FOR INSERT
  WITH CHECK (true);

-- Alternative: If you want to be more restrictive, use this instead:
-- CREATE POLICY "Allow trigger to insert activity"
--   ON activity_feed FOR INSERT
--   WITH CHECK (auth.uid() IS NOT NULL);

-- Make sure the trigger function runs with proper privileges
CREATE OR REPLACE FUNCTION log_user_registration()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_feed (
    user_id,
    actor_name,
    actor_email,
    action_type,
    action_description,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    NEW.id,
    NEW.name,
    NEW.email,
    'user_registered',
    'New user registered',
    'user',
    NEW.id,
    jsonb_build_object('role', NEW.role, 'level', NEW.level)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_user_registered_activity ON users;
CREATE TRIGGER on_user_registered_activity
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_user_registration();

COMMENT ON FUNCTION log_user_registration() IS 'Logs user registration to activity feed (runs with elevated privileges)';
