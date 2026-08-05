-- Schema Definition
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  cover_url TEXT NOT NULL,
  goal_type TEXT NOT NULL,
  goal_value INTEGER NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  unit_label TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  organizer_avatar TEXT NOT NULL,
  organizer_verified BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updates JSONB NOT NULL DEFAULT '[]'::jsonb,
  endorsements INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public',
  member_count INTEGER NOT NULL DEFAULT 1,
  active_discussions INTEGER NOT NULL DEFAULT 0,
  cover_url TEXT NOT NULL,
  created_at TEXT NOT NULL,
  is_joined BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  campaign_id TEXT,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  venue TEXT NOT NULL,
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 100,
  attendee_count INTEGER NOT NULL DEFAULT 1,
  cover_url TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  is_registered BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  author_role TEXT NOT NULL,
  body TEXT NOT NULL,
  media_url TEXT,
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  is_liked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Initial Seed Data
INSERT INTO campaigns (id, title, category, summary, description, location, is_online, cover_url, goal_type, goal_value, current_value, unit_label, organizer_name, organizer_avatar, organizer_verified, status, created_at, updates, endorsements)
VALUES 
(
  'cmp_001',
  'Wetland Drainage & Anti-Flooding Restoration',
  'Environment',
  'Urgent community initiative to unblock drainage channels and restore critical urban wetland buffers.',
  'Kampala urban flooding severely impacts local schools and businesses during monsoon heavy rains. This community action mobilizes volunteers, local engineers, and municipal stakeholders to clear clogged drainage mains, plant flood-absorbing flora, and install sustainable trash gates.',
  'Nakawa Division, Kampala',
  FALSE,
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000',
  'signatures',
  1000,
  642,
  'signatures',
  'Sarah Namubiru',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  TRUE,
  'active',
  '2026-07-28T09:00:00Z',
  '[{"id":"upd_101","campaignId":"cmp_001","title":"Channel Inspection Complete","content":"Engineering team surveyed 4km of drainage corridor near Nakawa market. Cleared key blockages.","createdAt":"2026-08-01T14:30:00Z","authorName":"Sarah Namubiru"}]'::jsonb,
  328
),
(
  'cmp_002',
  'Solar Streetlights for Night Market Safety',
  'Infrastructure',
  'Installing 50 eco-friendly solar lamps to empower local female vendors and secure night commerce.',
  'Night trading feeds hundreds of local households, but pitch-black walkways create security vulnerabilities and hurt trade. Installing commercial-grade solar posts ensures continuous illumination, deters criminal activity, and keeps public marketplaces open safely until midnight.',
  'Kawempe Division, Kampala',
  FALSE,
  'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=1000',
  'funds',
  5000,
  3850,
  'USD',
  'Kampala Business Guild',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  TRUE,
  'active',
  '2026-07-25T11:20:00Z',
  '[]'::jsonb,
  194
),
(
  'cmp_003',
  'Youth Digital Skills & Coding Hub',
  'Education',
  'Equipping school dropouts and unemployed youth with actionable software development skills.',
  'Providing free weekend workshops, refurbished laptops, and mentorship in web engineering and digital business literacy for young adults in low-income urban settlements.',
  'Makindye, Kampala',
  TRUE,
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1000',
  'volunteers',
  50,
  34,
  'mentors',
  'Grace Nakato',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
  FALSE,
  'active',
  '2026-07-30T16:00:00Z',
  '[]'::jsonb,
  112
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO groups (id, name, category, description, location, visibility, member_count, active_discussions, cover_url, created_at, is_joined)
VALUES
(
  'grp_001',
  'Kampala Eco Guardians',
  'Environment',
  'A grass-root community collective dedicated to urban greening, waste reduction, and wetland protection across Kampala.',
  'Kampala, Uganda',
  'public',
  142,
  18,
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000',
  '2026-06-15T10:00:00Z',
  TRUE
),
(
  'grp_002',
  'Civic Tech & Open Data Innovators',
  'Technology',
  'Engineers, designers, and civic advocates building open-source public tools, budget trackers, and civic mapping applications.',
  'Greater Kampala Area',
  'public',
  98,
  12,
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1000',
  '2026-07-01T12:00:00Z',
  FALSE
),
(
  'grp_003',
  'Kawempe Traders Safety Council',
  'Community Action',
  'Market vendors and small business owners uniting for night lighting, emergency response, and fair local market policies.',
  'Kawempe, Kampala',
  'private',
  64,
  8,
  'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=1000',
  '2026-07-10T15:30:00Z',
  FALSE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, title, campaign_id, category, description, venue, is_online, start_time, end_time, capacity, attendee_count, cover_url, organizer_name, is_registered)
VALUES
(
  'evt_001',
  'Nakawa Drainage Clean-Up Weekend',
  'cmp_001',
  'Environment',
  'Hands-on community volunteering event to unclog drainage channels along the Nakawa market perimeter. Protective boots and gloves provided.',
  'Nakawa Market Community Center',
  FALSE,
  '2026-08-15T08:00:00Z',
  '2026-08-15T12:00:00Z',
  150,
  88,
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000',
  'Sarah Namubiru',
  TRUE
),
(
  'evt_002',
  'Civic Tech Open Source Hackathon',
  NULL,
  'Technology',
  'Collaborative 1-day hackathon building open data dashboards for local public transportation routes and municipal budgets.',
  'Innovation Village, Ntinda',
  FALSE,
  '2026-08-22T09:00:00Z',
  '2026-08-22T17:00:00Z',
  60,
  42,
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1000',
  'Civic Tech Network',
  FALSE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO posts (id, group_id, author_id, author_name, author_avatar, author_role, body, media_url, like_count, comment_count, is_liked, created_at)
VALUES
(
  'pst_001',
  'grp_001',
  'usr_002',
  'David Musoke',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'Community Leader',
  'Hello members! We have scheduled our bi-weekly drainage inspection for this Saturday at 9:00 AM. Please bring gloves if available.',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
  24,
  2,
  FALSE,
  '2 hours ago'
),
(
  'pst_002',
  'grp_002',
  'usr_001',
  'Sarah Namubiru',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'Organizer',
  'Welcome everyone to the Civic Tech & Community Innovators group! Let us know what open-data tools you are currently working on.',
  NULL,
  15,
  1,
  TRUE,
  '1 day ago'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO comments (id, post_id, author_name, author_avatar, body, created_at)
VALUES
(
  'c_01',
  'pst_001',
  'Grace Nakato',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'I will bring 5 extra pairs of heavy-duty gloves!',
  '1 hour ago'
),
(
  'c_02',
  'pst_001',
  'Moses Kato',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'Will city council representatives attend as well?',
  '30 mins ago'
)
ON CONFLICT (id) DO NOTHING;
