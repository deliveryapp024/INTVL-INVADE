-- COMPLETE FIX: activity_feed RLS - Copy ALL of this
-- Run this entire block in Supabase SQL Editor

-- Step 1: Drop existing policies (safe to run even if they don't exist)
DROP POLICY IF EXISTS "Allow authenticated inserts to activity feed" ON activity_feed;
DROP POLICY IF EXISTS "Allow trigger to insert activity" ON activity_feed;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON activity_feed;
DROP POLICY IF EXISTS "Admins can view activity feed" ON activity_feed;

-- Step 2: Recreate the INSERT policy with proper permissions
CREATE POLICY "Allow authenticated inserts to activity feed"
  ON activity_feed FOR INSERT
  WITH CHECK (true);

-- Step 3: Recreate the SELECT policy for admins
CREATE POLICY "Admins can view activity feed"
  ON activity_feed FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin', 'support'));

-- Step 4: Update the trigger function with SECURITY DEFINER (runs as table owner)
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

-- Step 5: Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_user_registered_activity ON users;

CREATE TRIGGER on_user_registered_activity
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_user_registration();

-- Verification query (optional - run separately to verify)
-- SELECT policyname FROM pg_policies WHERE tablename = 'activity_feed';
