-- Fix Users Table Schema for Backend Compatibility
-- This migration updates the users table to match the backend's expected schema

-- First, check if we need to migrate existing data
DO $$
BEGIN
    -- Check if the old schema exists (display_name column)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'display_name'
    ) THEN
        -- Rename columns to match backend expectations
        ALTER TABLE users 
            RENAME COLUMN display_name TO name;
        
        ALTER TABLE users 
            RENAME COLUMN total_distance_meters TO total_distance;
        
        ALTER TABLE users 
            RENAME COLUMN total_zones_captured TO coins;
        
        ALTER TABLE users 
            RENAME COLUMN current_streak TO streak_days;
        
        ALTER TABLE users 
            RENAME COLUMN xp TO total_duration;
        
        -- Drop columns that don't exist in backend schema
        ALTER TABLE users 
            DROP COLUMN IF EXISTS password_hash,
            DROP COLUMN IF EXISTS best_streak,
            DROP COLUMN IF EXISTS last_run_at;
    END IF;
END $$;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add total_runs if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'total_runs'
    ) THEN
        ALTER TABLE users ADD COLUMN total_runs INTEGER DEFAULT 0;
    END IF;

    -- Add level if missing  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'level'
    ) THEN
        ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;
    END IF;

    -- Add is_verified if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;

    -- Add role if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
    END IF;

    -- Add status if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'status'
    ) THEN
        ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';
    END IF;

    -- Add pii_anonymized_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'pii_anonymized_at'
    ) THEN
        ALTER TABLE users ADD COLUMN pii_anonymized_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add deleted_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add last_seen_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_seen_at'
    ) THEN
        ALTER TABLE users ADD COLUMN last_seen_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add updated_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Update existing users to have default values for new columns
UPDATE users SET 
    total_runs = COALESCE(total_runs, 0),
    level = COALESCE(level, 1),
    is_verified = COALESCE(is_verified, false),
    role = COALESCE(role, 'user'),
    status = COALESCE(status, 'active'),
    updated_at = NOW()
WHERE total_runs IS NULL 
   OR level IS NULL 
   OR is_verified IS NULL 
   OR role IS NULL 
   OR status IS NULL;

-- Create admin user if it doesn't exist
-- Note: This assumes the user has already been created in Supabase Auth
-- You'll need to manually create admin@gmail.com in Supabase Auth dashboard first
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if admin user already exists in users table
    IF NOT EXISTS (
        SELECT 1 FROM users WHERE email = 'admin@gmail.com'
    ) THEN
        -- Try to find the admin user in auth.users (Supabase Auth)
        SELECT id INTO admin_user_id
        FROM auth.users 
        WHERE email = 'admin@gmail.com';
        
        -- If found in auth.users, insert into public.users
        IF admin_user_id IS NOT NULL THEN
            INSERT INTO users (
                id, 
                email, 
                name, 
                username, 
                avatar_url,
                total_distance,
                total_runs,
                total_duration,
                streak_days,
                level,
                coins,
                is_verified,
                role,
                status,
                created_at,
                updated_at
            ) VALUES (
                admin_user_id,
                'admin@gmail.com',
                'Admin User',
                'admin',
                NULL,
                0,
                0,
                0,
                0,
                1,
                0,
                true,
                'admin',
                'active',
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Admin user created successfully with ID: %', admin_user_id;
        ELSE
            RAISE NOTICE 'Admin user not found in auth.users. Please create admin@gmail.com in Supabase Auth dashboard first.';
        END IF;
    ELSE
        RAISE NOTICE 'Admin user already exists in users table';
    END IF;
END $$;

-- Add comment explaining the schema
COMMENT ON TABLE users IS 'User profiles matching backend expected schema';
