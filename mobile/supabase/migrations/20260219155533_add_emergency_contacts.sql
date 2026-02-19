-- Add emergency_contacts table for Safety feature
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relationship TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own emergency contacts"
    ON emergency_contacts FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create own emergency contacts"
    ON emergency_contacts FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own emergency contacts"
    ON emergency_contacts FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own emergency contacts"
    ON emergency_contacts FOR DELETE
    USING (user_id = auth.uid());

-- Add live_location_shares table for Safety feature
CREATE TABLE IF NOT EXISTS live_location_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shared_with UUID REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE live_location_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own location shares"
    ON live_location_shares FOR SELECT
    USING (user_id = auth.uid() OR shared_with = auth.uid());

CREATE POLICY "Users can create location shares"
    ON live_location_shares FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own location shares"
    ON live_location_shares FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own location shares"
    ON live_location_shares FOR DELETE
    USING (user_id = auth.uid());

-- Add safety_reports table
CREATE TABLE IF NOT EXISTS safety_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE safety_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own safety reports"
    ON safety_reports FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create safety reports"
    ON safety_reports FOR INSERT
    WITH CHECK (user_id = auth.uid());
