-- INVADE Complete Database Schema
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- USERS & PROFILES
-- ============================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    phone TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    premium_plan TEXT CHECK (premium_plan IN ('monthly', 'yearly', 'lifetime')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES profiles(id),
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    total_distance DECIMAL(10,2) DEFAULT 0,
    total_runs INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0, -- in seconds
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    streak_updated_at DATE,
    settings JSONB DEFAULT '{}'::jsonb
);

-- User preferences/settings
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'en',
    units TEXT DEFAULT 'metric' CHECK (units IN ('metric', 'imperial')),
    auto_pause BOOLEAN DEFAULT TRUE,
    audio_cues BOOLEAN DEFAULT TRUE,
    voice_guidance BOOLEAN DEFAULT TRUE,
    share_activities BOOLEAN DEFAULT TRUE,
    profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
    activity_visibility TEXT DEFAULT 'public' CHECK (activity_visibility IN ('public', 'friends', 'private')),
    map_visibility TEXT DEFAULT 'public' CHECK (map_visibility IN ('public', 'friends', 'private')),
    notify_friend_activities BOOLEAN DEFAULT TRUE,
    notify_club_activities BOOLEAN DEFAULT TRUE,
    notify_challenges BOOLEAN DEFAULT TRUE,
    notify_events BOOLEAN DEFAULT TRUE,
    notify_kudos BOOLEAN DEFAULT TRUE,
    notify_comments BOOLEAN DEFAULT TRUE,
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- SAFETY FEATURES
-- ============================================

CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relationship TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE safety_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('sos', 'live_share_start', 'live_share_end', 'inactivity_alert', 'night_mode_start')),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    battery_level INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES profiles(id)
);

CREATE TABLE live_location_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_id UUID,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    share_token TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE live_location_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    share_id UUID REFERENCES live_location_shares(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES emergency_contacts(id),
    phone TEXT NOT NULL,
    notified_at TIMESTAMP WITH TIME ZONE,
    last_viewed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- ACTIVITIES & RUNS
-- ============================================

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'run' CHECK (type IN ('run', 'walk', 'hike', 'trail_run', 'treadmill')),
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'paused', 'completed', 'cancelled')),
    
    -- Basic Stats
    distance DECIMAL(10, 2) DEFAULT 0, -- in meters
    duration INTEGER DEFAULT 0, -- in seconds
    pace DECIMAL(5, 2), -- min/km
    calories INTEGER,
    
    -- Elevation
    elevation_gain DECIMAL(8, 2) DEFAULT 0,
    elevation_loss DECIMAL(8, 2) DEFAULT 0,
    max_elevation DECIMAL(8, 2),
    min_elevation DECIMAL(8, 2),
    
    -- Heart Rate
    avg_heart_rate INTEGER,
    max_heart_rate INTEGER,
    min_heart_rate INTEGER,
    
    -- Location
    start_latitude DECIMAL(10, 8),
    start_longitude DECIMAL(11, 8),
    end_latitude DECIMAL(10, 8),
    end_longitude DECIMAL(11, 8),
    
    -- Route info
    route_id UUID,
    route_name TEXT,
    
    -- Weather
    weather_condition TEXT,
    temperature DECIMAL(4, 1),
    humidity INTEGER,
    
    -- Social
    title TEXT,
    notes TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    kudos_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    
    -- Gamification
    xp_earned INTEGER DEFAULT 0,
    zones_captured INTEGER DEFAULT 0,
    badges_earned UUID[],
    
    -- Sync
    synced_at TIMESTAMP WITH TIME ZONE,
    is_synced BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Activity locations (GPS points)
CREATE TABLE activity_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    altitude DECIMAL(8, 2),
    accuracy DECIMAL(6, 2),
    speed DECIMAL(6, 2),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity splits (per km/mile)
CREATE TABLE activity_splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    split_number INTEGER NOT NULL,
    distance DECIMAL(10, 2) NOT NULL,
    duration INTEGER NOT NULL,
    pace DECIMAL(5, 2),
    elevation_gain DECIMAL(8, 2),
    elevation_loss DECIMAL(8, 2),
    avg_heart_rate INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TERRITORY/ZONES
-- ============================================

CREATE TABLE zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    h3_index TEXT UNIQUE NOT NULL,
    boundary GEOGRAPHY(POLYGON, 4326),
    center_latitude DECIMAL(10, 8) NOT NULL,
    center_longitude DECIMAL(11, 8) NOT NULL,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE zone_ownership (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID REFERENCES zones(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    captured_by_activity_id UUID REFERENCES activities(id),
    is_loop_bonus BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(zone_id, user_id)
);

CREATE TABLE zone_capture_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID REFERENCES zones(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id),
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    lost_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- ROUTES & TRAILS
-- ============================================

CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    distance DECIMAL(10, 2) NOT NULL, -- in meters
    duration INTEGER, -- estimated minutes
    difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'hard', 'expert')),
    elevation_gain DECIMAL(8, 2),
    elevation_loss DECIMAL(8, 2),
    surface TEXT CHECK (surface IN ('road', 'trail', 'mixed', 'track')),
    
    -- Location
    start_latitude DECIMAL(10, 8) NOT NULL,
    start_longitude DECIMAL(11, 8) NOT NULL,
    end_latitude DECIMAL(10, 8) NOT NULL,
    end_longitude DECIMAL(11, 8) NOT NULL,
    city TEXT,
    state TEXT,
    
    -- Metadata
    best_time_to_run TEXT, -- 'morning', 'afternoon', 'evening', 'night'
    tags TEXT[],
    safety_rating TEXT CHECK (safety_rating IN ('high', 'medium', 'low')),
    water_points BOOLEAN DEFAULT FALSE,
    parking_available BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    
    -- Stats
    rating DECIMAL(2, 1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    run_count INTEGER DEFAULT 0,
    
    -- Media
    images TEXT[],
    gpx_file_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE route_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    sequence INTEGER NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    elevation DECIMAL(8, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(route_id, sequence)
);

CREATE TABLE route_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    images TEXT[],
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(route_id, user_id)
);

-- Trails (for hiking/mountain trails)
CREATE TABLE trails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    region TEXT, -- 'Western Ghats', 'Himalayas', etc.
    distance DECIMAL(10, 2) NOT NULL,
    duration TEXT, -- '6-7 hours'
    difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'hard', 'expert')),
    elevation_gain DECIMAL(8, 2),
    max_height DECIMAL(8, 2),
    trail_type TEXT CHECK (trail_type IN ('forest', 'mountain', 'coastal', 'desert')),
    best_season TEXT[],
    mobile_signal TEXT CHECK (mobile_signal IN ('none', 'poor', 'moderate', 'good')),
    water_sources BOOLEAN DEFAULT FALSE,
    nearest_town TEXT,
    emergency_contacts TEXT[],
    gear TEXT[],
    permit_required BOOLEAN DEFAULT FALSE,
    permit_info TEXT,
    safety_notes TEXT[],
    rating DECIMAL(2, 1) DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    images TEXT[],
    gpx_file_url TEXT,
    created_by UUID REFERENCES profiles(id),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CLUBS
-- ============================================

CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    logo_url TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    type TEXT DEFAULT 'running' CHECK (type IN ('running', 'hiking', 'cycling', 'multi_sport')),
    is_private BOOLEAN DEFAULT FALSE,
    is_women_only BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    
    -- Created by
    created_by UUID REFERENCES profiles(id),
    
    -- Stats
    member_count INTEGER DEFAULT 0,
    active_member_count INTEGER DEFAULT 0, -- ran in last 7 days
    total_distance DECIMAL(12, 2) DEFAULT 0,
    total_runs INTEGER DEFAULT 0,
    total_events INTEGER DEFAULT 0,
    
    -- Social links
    instagram_url TEXT,
    facebook_url TEXT,
    whatsapp_link TEXT,
    website_url TEXT,
    
    -- Settings
    rules TEXT[],
    weekly_schedule JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE club_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(club_id, user_id)
);

CREATE TABLE club_join_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by UUID REFERENCES profiles(id),
    UNIQUE(club_id, user_id)
);

-- ============================================
-- EVENTS
-- ============================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('race', 'group_run', 'trail_run', 'training', 'social', 'workshop')),
    
    -- Host
    host_type TEXT NOT NULL CHECK (host_type IN ('club', 'user', 'brand')),
    host_id UUID NOT NULL,
    host_name TEXT,
    
    -- Date & Time
    start_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    
    -- Location
    location_name TEXT,
    location_address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Event details
    distance DECIMAL(6, 2), -- in km
    distance_options DECIMAL(6, 2)[],
    difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'hard', 'expert')),
    elevation_gain DECIMAL(8, 2),
    route_id UUID REFERENCES routes(id),
    
    -- Capacity
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    waitlist_count INTEGER DEFAULT 0,
    
    -- Pricing
    is_free BOOLEAN DEFAULT TRUE,
    price DECIMAL(10, 2),
    currency TEXT DEFAULT 'INR',
    registration_link TEXT,
    
    -- Status
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')),
    
    -- Media
    cover_image_url TEXT,
    images TEXT[],
    
    -- Features
    tags TEXT[],
    requirements TEXT,
    whatsapp_group_link TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going', 'waitlist', 'cancelled')),
    rsvp_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_in_by UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- ============================================
-- CHALLENGES
-- ============================================

CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('individual', 'city_vs_city', 'club', 'community')),
    category TEXT NOT NULL CHECK (category IN ('distance', 'streak', 'time', 'elevation', 'zones', 'speed')),
    goal DECIMAL(10, 2) NOT NULL,
    goal_unit TEXT NOT NULL, -- 'km', 'days', 'minutes', 'meters', 'zones'
    
    -- Duration
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Visual
    cover_image_url TEXT,
    badge_id UUID,
    
    -- Rewards
    xp_reward INTEGER DEFAULT 0,
    coin_reward INTEGER DEFAULT 0,
    premium_days_reward INTEGER DEFAULT 0,
    
    -- Scope
    is_global BOOLEAN DEFAULT FALSE,
    city TEXT,
    club_id UUID REFERENCES clubs(id),
    
    -- Stats
    participant_count INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE challenge_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    progress DECIMAL(10, 2) DEFAULT 0,
    current_value DECIMAL(10, 2) DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    rank INTEGER,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

-- ============================================
-- SOCIAL FEATURES
-- ============================================

-- Kudos (likes on activities)
CREATE TABLE kudos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(activity_id, user_id)
);

-- Comments on activities
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id),
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friends/Following system
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id)
);

-- Feed items (for performance)
CREATE TABLE feed_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('activity', 'achievement', 'club_activity', 'challenge_completed', 'event_reminder')),
    source_id UUID NOT NULL, -- activity_id, badge_id, etc.
    source_user_id UUID REFERENCES profiles(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    is_seen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- GAMIFICATION
-- ============================================

CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('distance', 'streak', 'zone', 'social', 'challenge', 'special')),
    icon_url TEXT,
    color TEXT,
    requirement_type TEXT NOT NULL,
    requirement_value DECIMAL(10, 2) NOT NULL,
    xp_reward INTEGER DEFAULT 0,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activity_id UUID REFERENCES activities(id),
    is_new BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, badge_id)
);

-- Level definitions
CREATE TABLE levels (
    level INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    xp_required INTEGER NOT NULL,
    xp_to_next INTEGER NOT NULL,
    color TEXT,
    icon_url TEXT,
    perks JSONB DEFAULT '[]'::jsonb
);

-- Weekly goals
CREATE TABLE weekly_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    distance_goal DECIMAL(8, 2),
    runs_goal INTEGER,
    zones_goal INTEGER,
    time_goal INTEGER, -- in minutes
    distance_actual DECIMAL(8, 2) DEFAULT 0,
    runs_actual INTEGER DEFAULT 0,
    zones_actual INTEGER DEFAULT 0,
    time_actual INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_start)
);

-- ============================================
-- MESSAGING
-- ============================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
    title TEXT,
    avatar_url TEXT,
    club_id UUID REFERENCES clubs(id),
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_preview TEXT,
    participant_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    last_read_at TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT,
    content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'activity_share', 'route_share', 'event_invite')),
    media_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    reply_to_id UUID REFERENCES messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    image_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push tokens
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    device_info TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- ============================================
-- PREMIUM & PAYMENTS
-- ============================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe', 'revenuecat')),
    provider_subscription_id TEXT,
    plan TEXT NOT NULL CHECK (plan IN ('premium_monthly', 'premium_yearly', 'premium_plus_monthly', 'premium_plus_yearly')),
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    provider TEXT NOT NULL,
    provider_payment_id TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_is_public ON activities(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_activity_locations_activity_id ON activity_locations(activity_id);
CREATE INDEX idx_zones_h3_index ON zones(h3_index);
CREATE INDEX idx_zone_ownership_user_id ON zone_ownership(user_id);
CREATE INDEX idx_routes_city ON routes(city);
CREATE INDEX idx_clubs_city ON clubs(city);
CREATE INDEX idx_club_members_club_id ON club_members(club_id);
CREATE INDEX idx_club_members_user_id ON club_members(user_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX idx_kudos_activity_id ON kudos(activity_id);
CREATE INDEX idx_comments_activity_id ON comments(activity_id);
CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX idx_feed_items_user_id ON feed_items(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_location_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read public profiles, only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Activities: Users can see public activities and their own
CREATE POLICY "Activities are viewable if public or own" ON activities
    FOR SELECT USING (is_public = TRUE OR user_id = auth.uid());

CREATE POLICY "Users can insert own activities" ON activities
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own activities" ON activities
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own activities" ON activities
    FOR DELETE USING (user_id = auth.uid());

-- Clubs: Public clubs are viewable by everyone
CREATE POLICY "Public clubs are viewable by everyone" ON clubs
    FOR SELECT USING (is_private = FALSE);

CREATE POLICY "Club members can view private clubs" ON clubs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM club_members 
            WHERE club_id = clubs.id AND user_id = auth.uid()
        )
    );

-- Messages: Only conversation participants can view messages
CREATE POLICY "Participants can view conversation messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Participants can send messages" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

-- ============================================
-- SEED DATA
-- ============================================

-- Insert level definitions
INSERT INTO levels (level, title, xp_required, xp_to_next, color) VALUES
(1, 'Beginner Runner', 0, 100, '#9CA3AF'),
(2, 'Beginner Runner', 100, 150, '#9CA3AF'),
(3, 'Beginner Runner', 250, 200, '#9CA3AF'),
(4, 'Beginner Runner', 450, 250, '#9CA3AF'),
(5, 'Beginner Runner', 700, 300, '#9CA3AF'),
(6, 'Zone Scout', 1000, 350, '#10B981'),
(7, 'Zone Scout', 1350, 400, '#10B981'),
(8, 'Zone Scout', 1750, 450, '#10B981'),
(9, 'Zone Scout', 2200, 500, '#10B981'),
(10, 'Zone Scout', 2700, 550, '#10B981'),
(11, 'Zone Hunter', 3250, 600, '#00D1FF'),
(12, 'Zone Hunter', 3850, 650, '#00D1FF'),
(13, 'Zone Hunter', 4500, 700, '#00D1FF'),
(14, 'Zone Hunter', 5200, 750, '#00D1FF'),
(15, 'Zone Hunter', 5950, 800, '#00D1FF'),
(16, 'Territory Master', 6750, 850, '#8B5CF6'),
(17, 'Territory Master', 7600, 900, '#8B5CF6'),
(18, 'Territory Master', 8500, 950, '#8B5CF6'),
(19, 'Territory Master', 9450, 1000, '#8B5CF6'),
(20, 'Territory Master', 10450, 1100, '#8B5CF6'),
(21, 'City Conqueror', 11550, 1200, '#F59E0B'),
(22, 'City Conqueror', 12750, 1300, '#F59E0B'),
(23, 'City Conqueror', 14050, 1400, '#F59E0B'),
(24, 'City Conqueror', 15450, 1500, '#F59E0B'),
(25, 'City Conqueror', 16950, 1600, '#F59E0B'),
(26, 'Region Champion', 18550, 1700, '#EF4444'),
(27, 'Region Champion', 20250, 1800, '#EF4444'),
(28, 'Region Champion', 22050, 1900, '#EF4444'),
(29, 'Region Champion', 23950, 2000, '#EF4444'),
(30, 'Region Champion', 25950, 2200, '#EF4444'),
(31, 'State Legend', 28150, 2400, '#EC4899'),
(32, 'State Legend', 30550, 2600, '#EC4899'),
(33, 'State Legend', 33150, 2800, '#EC4899'),
(34, 'State Legend', 35950, 3000, '#EC4899'),
(35, 'State Legend', 38950, 3200, '#EC4899'),
(36, 'National Hero', 42150, 3400, '#FFD700'),
(37, 'National Hero', 45550, 3600, '#FFD700'),
(38, 'National Hero', 49150, 3800, '#FFD700'),
(39, 'National Hero', 52950, 4000, '#FFD700'),
(40, 'National Hero', 56950, 4200, '#FFD700'),
(41, 'International Star', 61150, 4400, '#FFD700'),
(42, 'International Star', 65550, 4600, '#FFD700'),
(43, 'International Star', 70150, 4800, '#FFD700'),
(44, 'International Star', 74950, 5000, '#FFD700'),
(45, 'International Star', 79950, 5200, '#FFD700'),
(46, 'World Champion', 85150, 5400, '#FFD700'),
(47, 'World Champion', 90550, 5600, '#FFD700'),
(48, 'World Champion', 96150, 5800, '#FFD700'),
(49, 'World Champion', 101950, 6000, '#FFD700'),
(50, 'World Champion', 107950, 6500, '#FFD700');

-- Insert badges
INSERT INTO badges (name, description, category, requirement_type, requirement_value, xp_reward) VALUES
-- Distance badges
('First 5K', 'Complete your first 5 kilometer run', 'distance', 'single_run_distance', 5000, 50),
('First 10K', 'Complete your first 10 kilometer run', 'distance', 'single_run_distance', 10000, 100),
('Half Marathon', 'Complete your first half marathon (21.1 km)', 'distance', 'single_run_distance', 21100, 250),
('Marathon', 'Complete your first full marathon (42.2 km)', 'distance', 'single_run_distance', 42200, 500),
('Century Club', 'Run a total of 100 kilometers', 'distance', 'total_distance', 100000, 100),
('500K Legend', 'Run a total of 500 kilometers', 'distance', 'total_distance', 500000, 250),
('1000K Master', 'Run a total of 1000 kilometers', 'distance', 'total_distance', 1000000, 500),

-- Streak badges
('7-Day Streak', 'Run 7 days in a row', 'streak', 'consecutive_days', 7, 100),
('30-Day Streak', 'Run 30 days in a row', 'streak', 'consecutive_days', 30, 250),
('100-Day Streak', 'Run 100 days in a row', 'streak', 'consecutive_days', 100, 500),
('365-Day Streak', 'Run every day for a year', 'streak', 'consecutive_days', 365, 1000),

-- Zone badges
('Zone Rookie', 'Capture your first zone', 'zone', 'zones_captured', 1, 25),
('Zone Collector', 'Capture 10 zones', 'zone', 'zones_captured', 10, 50),
('Zone Master', 'Capture 50 zones', 'zone', 'zones_captured', 50, 100),
('Zone Legend', 'Capture 100 zones', 'zone', 'zones_captured', 100, 250),

-- Social badges
('First Friend', 'Add your first friend', 'social', 'friends_count', 1, 25),
('Social Runner', 'Add 10 friends', 'social', 'friends_count', 10, 50),
('Club Member', 'Join your first club', 'social', 'clubs_joined', 1, 25),
('Event Participant', 'Attend your first event', 'social', 'events_attended', 1, 50),

-- Challenge badges
('Challenge Accepted', 'Complete your first challenge', 'challenge', 'challenges_completed', 1, 50),
('Challenge Master', 'Complete 10 challenges', 'challenge', 'challenges_completed', 10, 100),

-- Special badges
('Early Bird', 'Run before 6 AM', 'special', 'early_run', 1, 25),
('Night Owl', 'Run after 9 PM', 'special', 'night_run', 1, 25),
('Independence Runner', 'Run on Independence Day', 'special', 'independence_day_run', 1, 50),
('Republic Runner', 'Run on Republic Day', 'special', 'republic_day_run', 1, 50);
