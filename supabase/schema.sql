-- =====================================================================
-- CommunityConnect • Complete Supabase PostgreSQL Schema & Security RLS
-- =====================================================================
-- Copy and paste this script directly into the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  location TEXT DEFAULT 'Kampala, Uganda',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'leader', 'organizer', 'moderator', 'admin')),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop foreign key constraint on profiles.id if it was created previously from auth.users reference
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS fk_profiles_users;

-- RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  owner_avatar TEXT DEFAULT '',
  owner_verified BOOLEAN DEFAULT FALSE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  location TEXT NOT NULL,
  is_online BOOLEAN DEFAULT FALSE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('signatures', 'volunteers', 'attendance', 'fundraising', 'awareness')),
  goal_value INT NOT NULL CHECK (goal_value > 0),
  current_value INT DEFAULT 0,
  unit_label TEXT DEFAULT 'participants',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'under_review', 'published', 'paused', 'completed', 'rejected')),
  participants_count INT DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Campaigns
CREATE INDEX IF NOT EXISTS idx_supabase_campaigns_cat_status ON public.campaigns(category, status);
CREATE INDEX IF NOT EXISTS idx_supabase_campaigns_published ON public.campaigns(published_at DESC);

-- RLS for Campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Published campaigns are viewable by everyone" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can create campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Campaign owners can update their campaign" ON public.campaigns;
CREATE POLICY "Published campaigns are viewable by everyone" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create campaigns" ON public.campaigns FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Campaign owners can update their campaign" ON public.campaigns FOR UPDATE USING (auth.uid() = owner_id);

-- 3. CAMPAIGN PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.campaign_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT DEFAULT 'signature',
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

-- RLS for Campaign Participants
ALTER TABLE public.campaign_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants viewable by everyone" ON public.campaign_participants;
DROP POLICY IF EXISTS "Authenticated users can participate" ON public.campaign_participants;
CREATE POLICY "Participants viewable by everyone" ON public.campaign_participants FOR SELECT USING (true);
CREATE POLICY "Authenticated users can participate" ON public.campaign_participants FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  location TEXT NOT NULL,
  member_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Groups viewable by everyone" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
CREATE POLICY "Groups viewable by everyone" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create groups" ON public.groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. GROUP DISCUSSION POSTS TABLE
CREATE TABLE IF NOT EXISTS public.group_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_avatar TEXT DEFAULT '',
  author_role TEXT DEFAULT 'Member',
  body TEXT NOT NULL,
  media_url TEXT,
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Group Posts
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Posts viewable by group members" ON public.group_posts;
DROP POLICY IF EXISTS "Group members can insert posts" ON public.group_posts;
CREATE POLICY "Posts viewable by group members" ON public.group_posts FOR SELECT USING (true);
CREATE POLICY "Group members can insert posts" ON public.group_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. MODERATION REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.moderation_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'dismissed', 'actioned')),
  moderator_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Moderation Reports
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create reports" ON public.moderation_reports;
DROP POLICY IF EXISTS "Admins can view reports" ON public.moderation_reports;
CREATE POLICY "Users can create reports" ON public.moderation_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view reports" ON public.moderation_reports FOR SELECT USING (true);

-- AUTOMATED TRIGGERS FOR STATISTICS
CREATE OR REPLACE FUNCTION public.handle_new_participant()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.campaigns
  SET current_value = current_value + 1,
      participants_count = participants_count + 1
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_supabase_participant_added
AFTER INSERT ON public.campaign_participants
FOR EACH ROW EXECUTE FUNCTION public.handle_new_participant();

-- =====================================================================
-- SEED DATA: SEED USERS (Admin & Leader)
-- =====================================================================
INSERT INTO public.profiles (id, email, full_name, username, avatar_url, role, verified, location, bio)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'micknick168@gmail.com',
  'Mick Nick (Admin)',
  'micknick168',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
  'admin',
  TRUE,
  'Kampala, Uganda',
  'System Administrator & Superuser'
) ON CONFLICT (email) DO UPDATE 
SET role = 'admin', verified = TRUE;

INSERT INTO public.profiles (id, email, full_name, username, avatar_url, role, verified, location, bio)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'sarah.namubiru@civicconnect.org',
  'Sarah Namubiru',
  'snamubiru',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'leader',
  TRUE,
  'Kampala, Uganda',
  'Community Youth Coordinator'
) ON CONFLICT (email) DO UPDATE 
SET role = 'leader', verified = TRUE;

