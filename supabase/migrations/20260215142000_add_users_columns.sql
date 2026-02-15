-- Add missing columns to users table - safe version
-- This migration safely adds columns, ignoring errors if they already exist

-- Add columns one by one with individual DO blocks to prevent transaction failures
DO $$
BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS total_runs INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
EXCEPTION WHEN duplicate_column THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
EXCEPTION WHEN duplicate_column THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
EXCEPTION WHEN duplicate_column THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS pii_anonymized_at TIMESTAMP WITH TIME ZONE;
EXCEPTION WHEN duplicate_column THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
EXCEPTION WHEN duplicate_column THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;
EXCEPTION WHEN duplicate_column THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN
    NULL;
END $$;

-- Rename existing columns if using old schema
DO $$
BEGIN
    ALTER TABLE users RENAME COLUMN display_name TO name;
EXCEPTION WHEN undefined_column THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE users RENAME COLUMN total_distance_meters TO total_distance;
EXCEPTION WHEN undefined_column THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE users RENAME COLUMN total_zones_captured TO coins;
EXCEPTION WHEN undefined_column THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE users RENAME COLUMN current_streak TO streak_days;
EXCEPTION WHEN undefined_column THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE users RENAME COLUMN xp TO total_duration;
EXCEPTION WHEN undefined_column THEN
    NULL;
END $$;
