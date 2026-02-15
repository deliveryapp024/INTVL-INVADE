-- Create user_settings table for user preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  profile_visible BOOLEAN DEFAULT true,
  activity_visible BOOLEAN DEFAULT false,
  compact_mode BOOLEAN DEFAULT false,
  auto_refresh BOOLEAN DEFAULT true,
  login_alerts BOOLEAN DEFAULT true,
  suspicious_activity_alerts BOOLEAN DEFAULT true,
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user_notifications table for notification history
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add avatar_url to users if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(read);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own notifications"
  ON user_notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON user_notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Create function to auto-create user settings on user creation
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create settings for new users
DROP TRIGGER IF EXISTS on_user_created_settings ON users;
CREATE TRIGGER on_user_created_settings
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_settings();

-- Insert settings for existing users
INSERT INTO user_settings (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE user_settings IS 'User preferences and settings';
COMMENT ON TABLE user_notifications IS 'User notification history';
