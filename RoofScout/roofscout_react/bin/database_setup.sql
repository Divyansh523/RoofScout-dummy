-- Create missing tables for RoofScout PropertyFinder
-- Run these commands in your Supabase SQL Editor

-- 1. Create tour_requests table (this table is missing)
CREATE TABLE IF NOT EXISTS public.tour_requests (
    id SERIAL PRIMARY KEY,
    request_type VARCHAR(50),
    requested_date DATE,
    requested_time TIME,
    status VARCHAR(20) DEFAULT 'pending',
    requester_name VARCHAR(100),
    requester_message TEXT,
    property_id VARCHAR(50),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Enable Row Level Security for tour_requests
ALTER TABLE public.tour_requests ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for tour_requests
CREATE POLICY "Users can view own tour requests" ON public.tour_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert tour requests" ON public.tour_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tour requests" ON public.tour_requests
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. Check what columns exist in properties table
-- Run this to see current structure:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'properties';

-- 5. Add missing columns to properties table if they don't exist
-- (You can run these one by one to see which ones are missing)

ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS desc TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS beds VARCHAR(10);
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS baths VARCHAR(10);
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS garages VARCHAR(10);
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS owner VARCHAR(100) DEFAULT 'Owner';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS details TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS description TEXT;

-- 6. Ensure properties table has proper RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- 7. Create policies for properties (allow everyone to view, only owners to modify)
DROP POLICY IF EXISTS "Anyone can view properties" ON public.properties;
DROP POLICY IF EXISTS "Users can insert own properties" ON public.properties;

CREATE POLICY "Anyone can view properties" ON public.properties
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own properties" ON public.properties
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own properties" ON public.properties
    FOR UPDATE USING (auth.uid() = owner_id);

-- 8. Create username table if it doesn't exist (referenced in auth.js)
CREATE TABLE IF NOT EXISTS public.username (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.username ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all usernames" ON public.username
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own username" ON public.username
    FOR INSERT WITH CHECK (auth.uid() = user_id);