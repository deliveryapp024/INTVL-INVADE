-- Create admin user profile
-- User ID: 526170b8-2465-40f9-86d6-52cb7cbe34c9
-- Note: Password hash is a bcrypt hash for 'admin123' - change this in production!

INSERT INTO users (
    id, 
    email, 
    name, 
    username, 
    avatar_url,
    password_hash,
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
    '526170b8-2465-40f9-86d6-52cb7cbe34c9',
    'admin@gmail.com',
    'Admin User',
    'admin',
    NULL,
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/I1K', -- bcrypt hash for 'admin123'
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
