-- Seed Admin User
-- Run this after creating admin@gmail.com in Supabase Auth Dashboard

-- Instructions:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" or "Invite User"
-- 3. Create user with email: admin@gmail.com and password: your_password
-- 4. Get the user ID from the dashboard
-- 5. Replace 'YOUR_ADMIN_USER_ID_HERE' below with the actual user ID
-- 6. Run this SQL in Supabase SQL Editor

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
    'YOUR_ADMIN_USER_ID_HERE',  -- Replace this with the actual UUID from Supabase Auth
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
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    status = 'active',
    updated_at = NOW();
