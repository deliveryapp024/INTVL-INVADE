-- Enhanced User Signup Migration
-- Adds additional fields for phone, DOB, location, and terms acceptance

-- ============================================
-- 1. ADD NEW USER FIELDS
-- ============================================

-- Add phone number field
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add date of birth field
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add location fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS location_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS location_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add terms acceptance tracking
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMP WITH TIME ZONE;

-- Add phone verification status
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Add profile photo URL (for future use)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ============================================
-- 2. USERNAME CONSTRAINTS
-- ============================================

-- Ensure username uniqueness
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS unique_username;

ALTER TABLE users 
ADD CONSTRAINT unique_username UNIQUE (username);

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create index for phone lookups (for verification)
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;

-- ============================================
-- 3. PHONE VERIFICATION CODES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS phone_verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for phone verification
CREATE INDEX IF NOT EXISTS idx_phone_verification_user 
ON phone_verification_codes(user_id);

CREATE INDEX IF NOT EXISTS idx_phone_verification_expires 
ON phone_verification_codes(expires_at);

CREATE INDEX IF NOT EXISTS idx_phone_verification_phone 
ON phone_verification_codes(phone);

-- ============================================
-- 4. TERMS ACCEPTANCE LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS terms_acceptance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    terms_version VARCHAR(20) NOT NULL,
    privacy_version VARCHAR(20) NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_terms_acceptance_user 
ON terms_acceptance_log(user_id);

-- ============================================
-- 5. UPDATE USER STATS VIEW
-- ============================================

DROP VIEW IF EXISTS user_stats;

CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    u.username,
    u.name,
    u.phone,
    u.phone_verified,
    u.date_of_birth,
    u.location_city,
    u.location_country,
    u.latitude,
    u.longitude,
    u.avatar_url,
    u.total_distance,
    u.total_runs,
    u.total_duration,
    u.streak_days,
    u.level,
    u.coins,
    u.is_verified,
    u.role,
    u.status,
    u.terms_accepted_at,
    u.privacy_accepted_at,
    u.created_at,
    u.updated_at,
    -- Calculate age if DOB exists
    CASE 
        WHEN u.date_of_birth IS NOT NULL 
        THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.date_of_birth))
        ELSE NULL 
    END as age,
    -- Location display string
    CASE 
        WHEN u.location_city IS NOT NULL AND u.location_country IS NOT NULL 
        THEN u.location_city || ', ' || u.location_country
        WHEN u.location_city IS NOT NULL 
        THEN u.location_city
        WHEN u.location_country IS NOT NULL 
        THEN u.location_country
        ELSE NULL 
    END as location_display
FROM users u;

-- ============================================
-- 6. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Users can view their own phone verification codes
ALTER TABLE phone_verification_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own verification codes" ON phone_verification_codes;
CREATE POLICY "Users can view own verification codes"
    ON phone_verification_codes
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can view their own terms acceptance
ALTER TABLE terms_acceptance_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own terms acceptance" ON terms_acceptance_log;
CREATE POLICY "Users can view own terms acceptance"
    ON terms_acceptance_log
    FOR SELECT
    USING (user_id = auth.uid());

-- ============================================
-- 7. FUNCTIONS FOR USER MANAGEMENT
-- ============================================

-- Function to check if username is available
CREATE OR REPLACE FUNCTION is_username_available(check_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM users 
        WHERE username = check_username 
        AND status != 'deleted'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if email is available
CREATE OR REPLACE FUNCTION is_email_available(check_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM users 
        WHERE email = check_email 
        AND status != 'deleted'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate phone number format
CREATE OR REPLACE FUNCTION validate_phone_format(phone_number TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Basic validation: remove non-digits and check length
    RETURN phone_number ~ '^[+]?[0-9]{10,15}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update user location
CREATE OR REPLACE FUNCTION update_user_location(
    p_user_id UUID,
    p_city VARCHAR(100),
    p_country VARCHAR(100),
    p_latitude DECIMAL(10,8),
    p_longitude DECIMAL(11,8)
)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET 
        location_city = p_city,
        location_country = p_country,
        latitude = p_latitude,
        longitude = p_longitude,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record terms acceptance
CREATE OR REPLACE FUNCTION record_terms_acceptance(
    p_user_id UUID,
    p_terms_version VARCHAR(20),
    p_privacy_version VARCHAR(20),
    p_ip_address INET,
    p_user_agent TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Update user record
    UPDATE users 
    SET 
        terms_accepted_at = NOW(),
        privacy_accepted_at = NOW(),
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Log acceptance
    INSERT INTO terms_acceptance_log (
        user_id,
        terms_version,
        privacy_version,
        ip_address,
        user_agent
    ) VALUES (
        p_user_id,
        p_terms_version,
        p_privacy_version,
        p_ip_address,
        p_user_agent
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. TRIGGERS
-- ============================================

-- Auto-cleanup old verification codes
CREATE OR REPLACE FUNCTION cleanup_old_verification_codes()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM phone_verification_codes 
    WHERE expires_at < NOW() - INTERVAL '24 hours';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cleanup_verification_codes ON phone_verification_codes;
CREATE TRIGGER trigger_cleanup_verification_codes
    AFTER INSERT ON phone_verification_codes
    EXECUTE FUNCTION cleanup_old_verification_codes();

-- ============================================
-- 9. GRANTS
-- ============================================

GRANT SELECT ON user_stats TO authenticated;
GRANT SELECT ON user_stats TO anon;

COMMENT ON TABLE users IS 'Extended user profiles with location, phone, and verification data';
COMMENT ON TABLE phone_verification_codes IS 'Temporary codes for phone number verification';
COMMENT ON TABLE terms_acceptance_log IS 'Audit log of terms and privacy policy acceptance';
