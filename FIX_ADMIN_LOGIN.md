# Fix "User profile not found" Error

## Problem
The login fails with "User profile not found" because:
1. The backend expects a different database schema than what's currently in Supabase
2. The admin user exists in Supabase Auth but doesn't have a profile in the `users` table

## Solution

### Step 1: Fix the Database Schema

Run the schema migration in Supabase:

```bash
# Using Supabase CLI
supabase db push

# Or run this SQL file manually in Supabase Dashboard SQL Editor:
# supabase/migrations/20260215143000_fix_users_schema.sql
```

### Step 2: Create Admin User in Supabase Auth

1. Go to your Supabase Dashboard
2. Navigate to **Authentication > Users**
3. Click **"Add User"** or **"Invite User"**
4. Create a user with:
   - Email: `admin@gmail.com`
   - Password: `your_secure_password`
5. Copy the **User ID** (UUID) - you'll need it for the next step

### Step 3: Create Admin Profile in Database

Run this SQL in Supabase SQL Editor (replace `YOUR_USER_ID` with the actual UUID):

```sql
INSERT INTO users (
    id, email, name, username, total_distance, total_runs, 
    total_duration, streak_days, level, coins, is_verified, 
    role, status, created_at, updated_at
) VALUES (
    'YOUR_USER_ID', 
    'admin@gmail.com',
    'Admin User',
    'admin',
    0, 0, 0, 0, 1, 0, true, 'admin', 'active', NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    status = 'active';
```

Or use the provided seed file:
```bash
# Edit supabase/seed_admin.sql first to add the user ID
# Then run in Supabase SQL Editor
```

### Step 4: Verify the Fix

1. Go to your admin panel: `https://intvl-invade.onrender.com`
2. Try logging in with `admin@gmail.com` and the password you set
3. The login should now work successfully

## Alternative: Quick Fix via Supabase Dashboard

If you need a quick fix without running migrations:

1. Go to Supabase Dashboard > Table Editor
2. Find the `users` table
3. Click "Insert Row"
4. Manually create a row with:
   - `id`: The UUID from Auth > Users for admin@gmail.com
   - `email`: admin@gmail.com
   - `name`: Admin User
   - `username`: admin
   - `role`: admin
   - `status`: active
   - Other fields can be left as default

## Schema Differences

The backend expects these fields in the `users` table:
- `id`, `email`, `name`, `username`, `avatar_url`
- `total_distance`, `total_runs`, `total_duration`, `streak_days`
- `level`, `coins`, `is_verified`, `role`, `status`
- `created_at`, `updated_at`, `last_seen_at`

The mobile app uses a different schema with fields like `display_name`, `total_distance_meters`, etc. The migration script fixes this mismatch.
