-- Create activity feed table for dashboard recent activity
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_name VARCHAR(255),
  actor_email VARCHAR(255),
  actor_avatar_url TEXT,
  action_type VARCHAR(50) NOT NULL, -- 'user_registered', 'run_completed', 'zone_captured', etc.
  action_description TEXT NOT NULL,
  entity_type VARCHAR(50), -- 'user', 'run', 'zone', etc.
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON activity_feed(user_id);

-- Enable RLS
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admins can view activity feed"
  ON activity_feed FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin', 'support'));

-- Create function to auto-log user registration
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
$$ LANGUAGE plpgsql;

-- Create trigger for user registration
DROP TRIGGER IF EXISTS on_user_registered_activity ON users;
CREATE TRIGGER on_user_registered_activity
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_user_registration();

-- Insert sample activity for existing users (last 5)
INSERT INTO activity_feed (user_id, actor_name, actor_email, action_type, action_description, entity_type, entity_id, metadata, created_at)
SELECT 
  id,
  name,
  email,
  'user_registered',
  'New user registered',
  'user',
  id,
  jsonb_build_object('role', role, 'level', level),
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

COMMENT ON TABLE activity_feed IS 'Activity feed for dashboard recent activity';
