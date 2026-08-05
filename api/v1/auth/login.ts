import { createClient } from '@supabase/supabase-js';

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    for (const key of ['message', 'error_description', 'details', 'hint']) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) return value;
    }
  }
  return 'Unable to sign in. Please check your email and password.';
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST for login.',
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({
      success: false,
      error: 'Supabase environment variables are missing on Vercel.',
    });
  }

  const email = asString(req.body?.email).trim().toLowerCase();
  const password = asString(req.body?.password);

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required.',
    });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user || !data.session) {
      return res.status(401).json({
        success: false,
        error: getErrorMessage(error),
      });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    const metadata = data.user.user_metadata || {};
    const fullName =
      profile?.full_name ||
      profile?.fullName ||
      metadata.full_name ||
      metadata.fullName ||
      data.user.email?.split('@')[0] ||
      'Community Member';

    const username =
      profile?.username ||
      metadata.username ||
      String(fullName).trim().toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 30) ||
      `member${data.user.id.slice(0, 6)}`;

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          fullName,
          username,
          email: data.user.email || email,
          phone: profile?.phone || data.user.phone || '',
          avatarUrl: profile?.avatar_url || profile?.avatarUrl || metadata.avatar_url || '',
          coverUrl: profile?.cover_url || profile?.coverUrl || '',
          bio: profile?.bio || '',
          location: profile?.location || 'Uganda',
          role: profile?.role || metadata.role || 'user',
          stats: {
            campaignsCount: Number(profile?.campaigns_count || 0),
            groupsCount: Number(profile?.groups_count || 0),
            eventsCount: Number(profile?.events_count || 0),
            followersCount: Number(profile?.followers_count || 0),
          },
          verified: Boolean(profile?.verified ?? data.user.email_confirmed_at),
          createdAt: profile?.created_at || data.user.created_at,
        },
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      },
    });
  } catch (error) {
    console.error('CommunityConnect login error:', error);
    return res.status(500).json({
      success: false,
      error: getErrorMessage(error),
    });
  }
}
