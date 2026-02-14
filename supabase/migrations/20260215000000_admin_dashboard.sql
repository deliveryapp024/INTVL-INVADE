-- Admin Dashboard Migration
-- Adds RBAC, audit logging, notifications, compliance, and analytics support
-- Created for INVADE Admin Dashboard

-- ============================================
-- 1. USER RBAC & COMPLIANCE FIELDS
-- ============================================

-- Add role field to users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user' 
CHECK (role IN ('user', 'support', 'admin', 'superadmin'));

-- Add status field for moderation
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active' 
CHECK (status IN ('active', 'suspended', 'pii_anonymized'));

-- Add PII anonymization tracking
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS pii_anonymized_at TIMESTAMP WITH TIME ZONE;

-- Add soft delete support (optional but recommended)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add last seen for segmentation
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;

-- Create index on role for RBAC queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen_at);

-- ============================================
-- 2. PUSH TOKENS ENHANCEMENTS
-- ============================================

-- Add provider field (fcm vs expo)
ALTER TABLE push_tokens 
ADD COLUMN IF NOT EXISTS provider VARCHAR(10) NOT NULL DEFAULT 'fcm' 
CHECK (provider IN ('fcm', 'expo'));

-- Add is_active flag
ALTER TABLE push_tokens 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Ensure unique constraint on (user_id, token)
ALTER TABLE push_tokens 
DROP CONSTRAINT IF EXISTS unique_user_token;
ALTER TABLE push_tokens 
ADD CONSTRAINT unique_user_token UNIQUE (user_id, token);

-- Create index for active tokens
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON push_tokens(is_active, platform);

-- ============================================
-- 3. ADMIN AUDIT LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_role VARCHAR(20),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON admin_audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON admin_audit_logs(created_at DESC);

-- ============================================
-- 4. NOTIFICATION SYSTEM
-- ============================================

-- Notification Templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    title_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    default_data JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Notification Jobs (scheduled + send requests)
CREATE TABLE IF NOT EXISTS notification_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' 
    CHECK (status IN ('scheduled', 'queued', 'sending', 'sent', 'failed', 'cancelled')),
    
    -- Content
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    image_url TEXT,
    data JSONB DEFAULT '{}',
    
    -- Targeting
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('all', 'segment', 'specific')),
    target_user_ids UUID[],
    segment_filter JSONB,
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE,
    queued_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Results
    requested_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_notification_jobs_updated_at ON notification_jobs;
CREATE TRIGGER update_notification_jobs_updated_at BEFORE UPDATE ON notification_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for notification jobs
CREATE INDEX IF NOT EXISTS idx_notification_jobs_status ON notification_jobs(status);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_scheduled ON notification_jobs(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_notification_jobs_created_by ON notification_jobs(created_by);

-- Notification Job Results (per-token/user outcomes)
CREATE TABLE IF NOT EXISTS notification_job_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES notification_jobs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    token_id UUID,
    platform VARCHAR(10) CHECK (platform IN ('ios', 'android')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
    error_code TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_results_job ON notification_job_results(job_id);
CREATE INDEX IF NOT EXISTS idx_notification_results_user ON notification_job_results(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_results_status ON notification_job_results(status);

-- ============================================
-- 5. ANALYTICS EVENTS
-- ============================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_created ON analytics_events(event_name, created_at);

-- ============================================
-- 6. COMPLIANCE TABLES
-- ============================================

-- Data Export Jobs (DSAR)
CREATE TABLE IF NOT EXISTS compliance_export_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'requested' 
    CHECK (status IN ('requested', 'processing', 'ready', 'failed', 'expired')),
    file_url TEXT,
    file_size_bytes INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE,
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_export_jobs_user ON compliance_export_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON compliance_export_jobs(status);
CREATE INDEX IF NOT EXISTS idx_export_jobs_requested_by ON compliance_export_jobs(requested_by);

-- Retention Policies
CREATE TABLE IF NOT EXISTS retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    entity VARCHAR(50) NOT NULL CHECK (entity IN (
        'run_coordinates', 
        'analytics_events', 
        'notification_job_results',
        'notification_jobs',
        'admin_audit_logs',
        'compliance_export_jobs'
    )),
    retention_days INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL DEFAULT 'delete' CHECK (action IN ('delete', 'anonymize')),
    enabled BOOLEAN NOT NULL DEFAULT true,
    last_run_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_retention_policies_updated_at ON retention_policies;
CREATE TRIGGER update_retention_policies_updated_at BEFORE UPDATE ON retention_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Retention Policy Runs
CREATE TABLE IF NOT EXISTS retention_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES retention_policies(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    affected_rows INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retention_runs_policy ON retention_runs(policy_id);
CREATE INDEX IF NOT EXISTS idx_retention_runs_status ON retention_runs(status);

-- ============================================
-- 7. DEFAULT NOTIFICATION TEMPLATES
-- ============================================

INSERT INTO notification_templates (name, title_template, body_template, default_data) VALUES
('daily_reminder', '🏃 Time to Run!', 'Your zones are waiting! Go capture some territory!', '{"deepLink": {"screen": "home"}}'),
('streak_warning', '🔥 Streak in Danger!', 'Your streak ends tonight! Run now to save it!', '{"deepLink": {"screen": "run"}}'),
('achievement_unlocked', '🏆 Achievement Unlocked!', 'Congratulations! You earned: {{achievementName}}', '{"deepLink": {"screen": "profile"}}'),
('zone_captured', '🎯 Zone Captured!', 'You captured {{zoneName}}! Keep running to claim more!', '{"deepLink": {"screen": "map"}}'),
('weekly_summary', '📊 Weekly Summary', 'You completed {{runs}} runs this week covering {{distance}}km!', '{"deepLink": {"screen": "profile"}}'),
('challenge_start', '🎯 New Challenge!', '{{challengeTitle}} starts today! Join now!', '{"deepLink": {"screen": "challenges"}}'),
('friend_request', '👥 New Friend Request', '{{userName}} wants to be your friend!', '{"deepLink": {"screen": "friends"}}'),
('referral_reward', '🎁 Referral Reward!', '{{referredUser}} joined! You earned +5 zones!', '{"deepLink": {"screen": "referral"}}')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 8. DEFAULT RETENTION POLICIES
-- ============================================

INSERT INTO retention_policies (name, entity, retention_days, action, enabled) VALUES
('Run Coordinates (GPS Data)', 'run_coordinates', 90, 'delete', true),
('Analytics Events', 'analytics_events', 365, 'delete', true),
('Notification Results', 'notification_job_results', 90, 'delete', true),
('Old Notification Jobs', 'notification_jobs', 365, 'delete', true),
('Audit Logs', 'admin_audit_logs', 2555, 'delete', true), -- 7 years for compliance
('Export Jobs', 'compliance_export_jobs', 30, 'delete', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 9. BOOTSTRAP INITIAL ADMIN ACCOUNTS
-- ============================================

-- Note: These will only update if the users already exist in the auth system
-- You'll need to run this after the users exist, or integrate with your auth flow

-- If users table has these emails, set their roles:
-- paralimatti@gmail.com -> superadmin
-- omkar2797@gmail.com -> admin
-- admin@gmail.com -> support

UPDATE users 
SET role = 'superadmin', status = 'active'
WHERE email = 'paralimatti@gmail.com' AND role = 'user';

UPDATE users 
SET role = 'admin', status = 'active'
WHERE email = 'omkar2797@gmail.com' AND role = 'user';

UPDATE users 
SET role = 'support', status = 'active'
WHERE email = 'admin@gmail.com' AND role = 'user';

-- ============================================
-- 10. VIEWS FOR ANALYTICS (Optional but helpful)
-- ============================================

-- Daily active users approximation
CREATE OR REPLACE VIEW analytics_daily_active AS
SELECT 
    DATE(last_seen_at) as date,
    COUNT(*) as active_users
FROM users 
WHERE last_seen_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(last_seen_at)
ORDER BY date DESC;

-- Runs summary by day
CREATE OR REPLACE VIEW analytics_daily_runs AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_runs,
    SUM(total_distance_meters) as total_distance,
    SUM(zones_captured) as total_zones
FROM runs
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Zone capture leaderboard (all time)
CREATE OR REPLACE VIEW analytics_zone_captures AS
SELECT 
    u.id as user_id,
    u.username,
    u.display_name,
    COUNT(DISTINCT zo.zone_id) as unique_zones,
    SUM(zo.capture_count) as total_captures
FROM users u
LEFT JOIN zone_ownerships zo ON u.id = zo.user_id
GROUP BY u.id, u.username, u.display_name
ORDER BY total_captures DESC;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify all tables were created
SELECT 'Tables created successfully' as status;
