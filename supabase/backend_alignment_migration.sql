-- CommunityConnect backend alignment migration
-- Adds tables expected by API layer and aligns backend database support

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'General',
  cover_url text DEFAULT '',
  venue text DEFAULT '',
  is_online boolean DEFAULT false,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  capacity integer DEFAULT 100,
  attendee_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES public.group_posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  author_avatar text DEFAULT '',
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_start_time_idx ON public.events(start_time);
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON public.comments(post_id);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_public_read" ON public.events;
CREATE POLICY "events_public_read" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "comments_public_read" ON public.comments;
CREATE POLICY "comments_public_read" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "comments_authenticated_insert" ON public.comments;
CREATE POLICY "comments_authenticated_insert" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
