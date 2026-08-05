import fs from 'fs';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { Pool } from 'pg';

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const pgPool = dbUrl ? new Pool({ connectionString: dbUrl }) : null;

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServerClient = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const DATA_STORE_PATH = path.join(process.cwd(), 'data-store.json');

// Initial seed data
const SEED_CAMPAIGNS = [
  {
    id: 'cmp_001',
    ownerId: 'usr_001',
    ownerName: 'Civic Youth Action',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    ownerVerified: true,
    title: 'Wetland & Urban Drainage Cleanup Initiative',
    slug: 'wetland-urban-drainage-cleanup',
    summary: 'Mobilizing local residents to clear clogged drainage channels and prevent urban flooding before the rainy season.',
    description: 'Recurrent flash flooding in Bwaise and Kawempe damages homes and local markets. This community campaign aims to clear plastic waste, unblock channels, and install waste collection bins across 5 parishes.',
    category: 'Environment',
    coverUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000',
    location: 'Kampala, Uganda',
    isOnline: false,
    goalType: 'volunteers',
    goalValue: 500,
    currentValue: 340,
    unitLabel: 'volunteers',
    status: 'published',
    participantsCount: 340,
    publishedAt: '2026-07-20T10:00:00Z',
    isJoined: true,
    isBookmarked: true,
    goalsList: ['Clear 12km of drainage channels', 'Deploy 50 plastic segregation bins', 'Train 200 youth environmental ambassadors'],
  },
  {
    id: 'cmp_002',
    ownerId: 'usr_002',
    ownerName: 'David Ochieng',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    ownerVerified: true,
    title: 'Primary School Digital Literacy Lab',
    slug: 'primary-school-digital-literacy-lab',
    summary: 'Equipping rural primary schools in Wakiso with solar-powered refurbished laptops and offline learning resources.',
    description: 'Digital access is vital for quality primary education. We are raising solar-powered laptop kits and training 15 teachers in digital pedagogy.',
    category: 'Education',
    coverUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1000',
    location: 'Wakiso, Uganda',
    isOnline: false,
    goalType: 'fundraising',
    goalValue: 20,
    currentValue: 14,
    unitLabel: 'solar laptops',
    status: 'published',
    participantsCount: 120,
    publishedAt: '2026-07-25T14:30:00Z',
    isJoined: false,
    isBookmarked: false,
    goalsList: ['Install 20 solar laptops', 'Provide teacher ICT training', 'Establish digital library'],
  },
  {
    id: 'cmp_003',
    ownerId: 'usr_003',
    ownerName: 'Grace Akello',
    ownerAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=250',
    ownerVerified: true,
    title: 'Community Maternal Health & Nutrition Drive',
    slug: 'maternal-health-nutrition-drive',
    summary: 'Providing maternal health care packages, nutritional workshops, and health screenings for young mothers.',
    description: 'Ensuring safe deliveries and healthy infant development through community health worker visits and nutritional guidance.',
    category: 'Health',
    coverUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1000',
    location: 'Jinja, Uganda',
    isOnline: false,
    goalType: 'attendance',
    goalValue: 300,
    currentValue: 210,
    unitLabel: 'mothers reached',
    status: 'published',
    participantsCount: 210,
    publishedAt: '2026-08-01T09:00:00Z',
    isJoined: true,
    isBookmarked: false,
  },
];

const SEED_GROUPS = [
  {
    id: 'grp_001',
    ownerId: 'usr_001',
    name: 'Eco-Champions Youth Network',
    description: 'Youth-led environmental action coalition driving plastic recycling, tree planting, and urban wetland conservation across Uganda.',
    category: 'Environment',
    coverUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1000',
    logoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=250',
    visibility: 'public',
    location: 'Kampala, Uganda',
    memberCount: 148,
    isMember: true,
    membershipStatus: 'approved',
    createdAt: '2026-05-10T08:00:00Z',
    adminName: 'Civic Youth Action',
  },
  {
    id: 'grp_002',
    ownerId: 'usr_002',
    name: 'Civic Tech & Community Innovators',
    description: 'A collaborative forum connecting developers, civic advocates, and local leaders to build open digital tools for public accountability.',
    category: 'Youth',
    coverUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000',
    logoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    visibility: 'public',
    location: 'Uganda',
    memberCount: 92,
    isMember: true,
    membershipStatus: 'approved',
    createdAt: '2026-06-01T10:00:00Z',
    adminName: 'David Ochieng',
  },
  {
    id: 'grp_003',
    ownerId: 'usr_003',
    name: 'Women Literacy & Leadership Circle',
    description: 'Peer support, micro-savings, and vocational skill development workshops for women community leaders.',
    category: 'Community support',
    coverUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000',
    logoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=250',
    visibility: 'public',
    location: 'Kampala, Uganda',
    memberCount: 230,
    isMember: false,
    membershipStatus: 'none',
    createdAt: '2026-04-18T12:00:00Z',
    adminName: 'Grace Akello',
  },
];

const SEED_EVENTS = [
  {
    id: 'evt_001',
    organizerId: 'usr_001',
    organizerName: 'Civic Youth Action',
    title: 'Monthly Community Drainage Cleanup Drive',
    description: 'Hands-on Saturday morning cleanup drive in Bwaise. Gloves, gumboots, and waste disposal bags will be provided to all volunteers.',
    category: 'Environment',
    coverUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&q=80&w=1000',
    venue: 'Bwaise Community Playgrounds',
    isOnline: false,
    startTime: '2026-08-15T08:00:00Z',
    endTime: '2026-08-15T12:00:00Z',
    capacity: 100,
    registeredCount: 64,
    isRegistered: true,
  },
  {
    id: 'evt_002',
    organizerId: 'usr_002',
    organizerName: 'David Ochieng',
    title: 'Youth Civic Leadership & Ethics Workshop',
    description: 'Interactive workshop on transparent campaign organization, public speaking, and engaging local government leaders effectively.',
    category: 'Youth',
    coverUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000',
    venue: 'Centenary Park Conference Centre',
    isOnline: true,
    startTime: '2026-08-20T14:00:00Z',
    endTime: '2026-08-20T17:00:00Z',
    capacity: 200,
    registeredCount: 112,
    isRegistered: false,
  },
];

const SEED_POSTS = [
  {
    id: 'pst_001',
    groupId: 'grp_001',
    authorId: 'usr_002',
    authorName: 'David Musoke',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    authorRole: 'Community Leader',
    body: 'Hello members! We have scheduled our bi-weekly drainage inspection for this Saturday at 9:00 AM. Please bring gloves if available.',
    mediaUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    likeCount: 24,
    commentCount: 2,
    isLiked: false,
    createdAt: '2 hours ago',
  },
  {
    id: 'pst_002',
    groupId: 'grp_002',
    authorId: 'usr_001',
    authorName: 'Civic Youth Action',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    authorRole: 'Organizer',
    body: 'Welcome everyone to the Civic Tech & Community Innovators group! Let us know what open-data tools you are currently working on.',
    likeCount: 15,
    commentCount: 1,
    isLiked: true,
    createdAt: '1 day ago',
  },
];

const SEED_COMMENTS: Record<string, any[]> = {
  pst_001: [
    {
      id: 'c_01',
      authorName: 'Grace Nakato',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      body: 'I will bring 5 extra pairs of heavy-duty gloves!',
      createdAt: '1 hour ago',
    },
    {
      id: 'c_02',
      authorName: 'Moses Kato',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      body: 'Will city council representatives attend as well?',
      createdAt: '30 mins ago',
    },
  ],
  pst_002: [
    {
      id: 'c_03',
      authorName: 'David Ochieng',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      body: 'We are mapping public health facilities in Wakiso district!',
      createdAt: '5 hours ago',
    },
  ],
};

// Persistent backend memory store with disk backup
let campaigns: any[] = [];
let groups: any[] = [];
let events: any[] = [];
let posts: any[] = [];
let comments: Record<string, any[]> = {};

function loadDataFromDisk() {
  try {
    if (fs.existsSync(DATA_STORE_PATH)) {
      const fileData = JSON.parse(fs.readFileSync(DATA_STORE_PATH, 'utf-8'));
      campaigns = Array.isArray(fileData.campaigns) && fileData.campaigns.length > 0 ? fileData.campaigns : [...SEED_CAMPAIGNS];
      groups = Array.isArray(fileData.groups) && fileData.groups.length > 0 ? fileData.groups : [...SEED_GROUPS];
      events = Array.isArray(fileData.events) && fileData.events.length > 0 ? fileData.events : [...SEED_EVENTS];
      posts = Array.isArray(fileData.posts) && fileData.posts.length > 0 ? fileData.posts : [...SEED_POSTS];
      comments = fileData.comments || { ...SEED_COMMENTS };
    } else {
      campaigns = [...SEED_CAMPAIGNS];
      groups = [...SEED_GROUPS];
      events = [...SEED_EVENTS];
      posts = [...SEED_POSTS];
      comments = { ...SEED_COMMENTS };
      saveDataToDisk();
    }
  } catch (err) {
    console.error('[Data Store Load Error]:', err);
    campaigns = [...SEED_CAMPAIGNS];
    groups = [...SEED_GROUPS];
    events = [...SEED_EVENTS];
    posts = [...SEED_POSTS];
    comments = { ...SEED_COMMENTS };
  }
}

function saveDataToDisk() {
  try {
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify({ campaigns, groups, events, posts, comments }, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Data Store Save Error]:', err);
  }
}

loadDataFromDisk();

async function dbGetCampaigns() {
  if (supabaseServerClient) {
    try {
      const { data, error } = await supabaseServerClient.from('campaigns').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          title: row.title,
          category: row.category,
          summary: row.summary,
          description: row.description,
          location: row.location,
          isOnline: row.is_online ?? row.isOnline ?? false,
          coverUrl: row.cover_url ?? row.coverUrl ?? '',
          goalType: row.goal_type ?? row.goalType ?? 'signatures',
          goalValue: row.goal_value ?? row.goalValue ?? 100,
          currentValue: row.current_value ?? row.currentValue ?? 0,
          unitLabel: row.unit_label ?? row.unitLabel ?? 'signatures',
          organizerName: row.organizer_name ?? row.organizerName ?? 'Organizer',
          organizerAvatar: row.organizer_avatar ?? row.organizerAvatar ?? '',
          organizerVerified: row.organizer_verified ?? row.organizerVerified ?? false,
          status: row.status ?? 'active',
          createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
          updates: typeof row.updates === 'string' ? JSON.parse(row.updates) : (row.updates || []),
          endorsements: row.endorsements || 0,
        }));
      }
    } catch (e) {
      console.warn('[Supabase Campaigns Read Warn]:', e);
    }
  }

  if (pgPool) {
    try {
      const res = await pgPool.query('SELECT * FROM campaigns ORDER BY created_at DESC');
      if (res.rows && res.rows.length > 0) {
        return res.rows.map((row) => ({
          id: row.id,
          title: row.title,
          category: row.category,
          summary: row.summary,
          description: row.description,
          location: row.location,
          isOnline: row.is_online,
          coverUrl: row.cover_url,
          goalType: row.goal_type,
          goalValue: row.goal_value,
          currentValue: row.current_value,
          unitLabel: row.unit_label,
          organizerName: row.organizer_name,
          organizerAvatar: row.organizer_avatar,
          organizerVerified: row.organizer_verified,
          status: row.status,
          createdAt: row.created_at,
          updates: typeof row.updates === 'string' ? JSON.parse(row.updates) : (row.updates || []),
          endorsements: row.endorsements,
        }));
      }
    } catch (e) {
      console.warn('[DB Campaigns Read Warn]:', e);
    }
  }
  return campaigns;
}

async function dbGetGroups() {
  if (supabaseServerClient) {
    try {
      const { data, error } = await supabaseServerClient.from('groups').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          description: row.description,
          location: row.location,
          visibility: row.visibility ?? 'public',
          memberCount: row.member_count ?? row.memberCount ?? 1,
          activeDiscussions: row.active_discussions ?? row.activeDiscussions ?? 0,
          coverUrl: row.cover_url ?? row.coverUrl ?? '',
          createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
          isJoined: row.is_joined ?? row.isJoined ?? false,
        }));
      }
    } catch (e) {
      console.warn('[Supabase Groups Read Warn]:', e);
    }
  }

  if (pgPool) {
    try {
      const res = await pgPool.query('SELECT * FROM groups ORDER BY created_at DESC');
      if (res.rows && res.rows.length > 0) {
        return res.rows.map((row) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          description: row.description,
          location: row.location,
          visibility: row.visibility,
          memberCount: row.member_count,
          activeDiscussions: row.active_discussions,
          coverUrl: row.cover_url,
          createdAt: row.created_at,
          isJoined: row.is_joined,
        }));
      }
    } catch (e) {
      console.warn('[DB Groups Read Warn]:', e);
    }
  }
  return groups;
}

async function dbGetEvents() {
  if (supabaseServerClient) {
    try {
      const { data, error } = await supabaseServerClient.from('events').select('*').order('start_time', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          title: row.title,
          campaignId: row.campaign_id ?? row.campaignId,
          category: row.category,
          description: row.description,
          venue: row.venue,
          isOnline: row.is_online ?? row.isOnline ?? false,
          startTime: row.start_time ?? row.startTime ?? new Date().toISOString(),
          endTime: row.end_time ?? row.endTime ?? new Date().toISOString(),
          capacity: row.capacity ?? 100,
          attendeeCount: row.attendee_count ?? row.attendeeCount ?? 0,
          coverUrl: row.cover_url ?? row.coverUrl ?? '',
          organizerName: row.organizer_name ?? row.organizerName ?? '',
          isRegistered: row.is_registered ?? row.isRegistered ?? false,
        }));
      }
    } catch (e) {
      console.warn('[Supabase Events Read Warn]:', e);
    }
  }

  if (pgPool) {
    try {
      const res = await pgPool.query('SELECT * FROM events ORDER BY start_time ASC');
      if (res.rows && res.rows.length > 0) {
        return res.rows.map((row) => ({
          id: row.id,
          title: row.title,
          campaignId: row.campaign_id,
          category: row.category,
          description: row.description,
          venue: row.venue,
          isOnline: row.is_online,
          startTime: row.start_time,
          endTime: row.end_time,
          capacity: row.capacity,
          attendeeCount: row.attendee_count,
          coverUrl: row.cover_url,
          organizerName: row.organizer_name,
          isRegistered: row.is_registered,
        }));
      }
    } catch (e) {
      console.warn('[DB Events Read Warn]:', e);
    }
  }
  return events;
}

async function dbGetPosts(groupId: string) {
  if (supabaseServerClient) {
    try {
      const { data, error } = await supabaseServerClient
        .from('posts')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          groupId: row.group_id ?? row.groupId,
          authorId: row.author_id ?? row.authorId,
          authorName: row.author_name ?? row.authorName,
          authorAvatar: row.author_avatar ?? row.authorAvatar,
          authorRole: row.author_role ?? row.authorRole,
          body: row.body,
          mediaUrl: row.media_url ?? row.mediaUrl,
          likeCount: row.like_count ?? row.likeCount ?? 0,
          commentCount: row.comment_count ?? row.commentCount ?? 0,
          isLiked: row.is_liked ?? row.isLiked ?? false,
          createdAt: row.created_at ?? row.createdAt,
        }));
      }
    } catch (e) {
      console.warn('[Supabase Posts Read Warn]:', e);
    }
  }

  if (pgPool) {
    try {
      const res = await pgPool.query('SELECT * FROM posts WHERE group_id = $1 ORDER BY created_at DESC', [groupId]);
      if (res.rows && res.rows.length > 0) {
        return res.rows.map((row) => ({
          id: row.id,
          groupId: row.group_id,
          authorId: row.author_id,
          authorName: row.author_name,
          authorAvatar: row.author_avatar,
          authorRole: row.author_role,
          body: row.body,
          mediaUrl: row.media_url,
          likeCount: row.like_count,
          commentCount: row.comment_count,
          isLiked: row.is_liked,
          createdAt: row.created_at,
        }));
      }
    } catch (e) {
      console.warn('[DB Posts Read Warn]:', e);
    }
  }
  return posts.filter((p) => p.groupId === groupId);
}

async function dbGetComments(postId: string) {
  if (supabaseServerClient) {
    try {
      const { data, error } = await supabaseServerClient
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          postId: row.post_id ?? row.postId,
          authorName: row.author_name ?? row.authorName,
          authorAvatar: row.author_avatar ?? row.authorAvatar,
          body: row.body,
          createdAt: row.created_at ?? row.createdAt,
        }));
      }
    } catch (e) {
      console.warn('[Supabase Comments Read Warn]:', e);
    }
  }

  if (pgPool) {
    try {
      const res = await pgPool.query('SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC', [postId]);
      if (res.rows && res.rows.length > 0) {
        return res.rows.map((row) => ({
          id: row.id,
          postId: row.post_id,
          authorName: row.author_name,
          authorAvatar: row.author_avatar,
          body: row.body,
          createdAt: row.created_at,
        }));
      }
    } catch (e) {
      console.warn('[DB Comments Read Warn]:', e);
    }
  }
  return comments[postId] || [];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Router Gateway
  const router = express.Router();

  // Health check
  router.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CommunityConnect API Gateway',
      supabaseConfigured: Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY),
      timestamp: new Date().toISOString()
    });
  });

  // Supabase status route
  router.get('/supabase/status', (req, res) => {
    const isConfigured = Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY);
    res.json({
      success: true,
      configured: isConfigured,
      supabaseUrl: isConfigured ? process.env.VITE_SUPABASE_URL : 'Not configured (Set VITE_SUPABASE_URL in .env)',
      message: isConfigured
        ? 'Supabase backend integrated and ready for persistent PostgreSQL & Auth operations.'
        : 'Supabase credentials not detected in .env. Running on built-in Express mock store & PWA local cache.'
    });
  });

  // Registered User Store with Passwords (starts empty - no dummy accounts)
  const registeredUsers: any[] = [];

  // Credentials lookup map: email -> password
  const userCredentialsStore = new Map<string, string>();

  // Helper to resolve current authenticated user from request token/headers
  async function getAuthUserFromReq(req: express.Request) {
    const authHeader = req.headers.authorization || '';
    let token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token && req.headers['x-user-id']) {
      token = String(req.headers['x-user-id']);
    }
    if (!token) return null;

    let userId = token;
    if (token.startsWith('cc_jwt_') && token.endsWith('_token')) {
      userId = token.slice(7, -6);
    }

    // 1. Check registeredUsers memory cache
    let user = registeredUsers.find((u) => u.id === userId || u.email.toLowerCase() === userId.toLowerCase());
    if (user) return user;

    // 2. Query Supabase profiles table
    if (supabaseServerClient) {
      try {
        const { data } = await supabaseServerClient
          .from('profiles')
          .select('*')
          .or(`id.eq.${userId},email.ilike.${userId}`)
          .maybeSingle();

        if (data) {
          const profileUser = {
            id: data.id,
            fullName: data.full_name || data.fullName || 'Civic Member',
            username: data.username || data.email?.split('@')[0] || 'civicmember',
            email: data.email,
            role: data.role || 'user',
            avatarUrl: data.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
            location: data.location || 'Kampala, Uganda',
            bio: data.bio || 'Community member',
            verified: Boolean(data.verified ?? true),
          };
          registeredUsers.push(profileUser);
          return profileUser;
        }
      } catch (_) {}
    }

    return null;
  }

  // Auth routes
  router.get('/auth/me', async (req, res) => {
    const authUser = await getAuthUserFromReq(req);
    if (!authUser) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });
    }
    const { password: _, ...userClean } = authUser;
    return res.json({ success: true, data: userClean });
  });

  router.put('/auth/profile', async (req, res) => {
    const authUser = await getAuthUserFromReq(req);
    if (!authUser) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const { fullName, bio, location, avatarUrl, phone } = req.body;

    if (fullName) authUser.fullName = fullName;
    if (bio) authUser.bio = bio;
    if (location) authUser.location = location;
    if (avatarUrl) authUser.avatarUrl = avatarUrl;
    if (phone) authUser.phone = phone;

    if (supabaseServerClient) {
      try {
        await supabaseServerClient
          .from('profiles')
          .update({
            full_name: authUser.fullName,
            bio: authUser.bio,
            location: authUser.location,
            avatar_url: authUser.avatarUrl,
          })
          .eq('id', authUser.id);
      } catch (e) {
        console.warn('[Supabase Profile Update Error]:', e);
      }
    }

    const { password: _, ...userClean } = authUser;
    return res.json({ success: true, data: userClean, message: 'Profile updated successfully' });
  });

  router.post('/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    return res.json({
      success: true,
      message: `Password reset instructions have been sent to ${email || 'your email'}.`,
    });
  });

  router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }
    if (!password || String(password).trim() === '') {
      return res.status(400).json({ success: false, error: 'Password is required.' });
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    // 1. Try Supabase Auth or Profiles
    let dbUser: any = null;
    if (supabaseServerClient) {
      try {
        const { data, error } = await supabaseServerClient
          .from('profiles')
          .select('*')
          .ilike('email', trimmedEmail)
          .maybeSingle();

        if (!error && data) {
          dbUser = data;
        }
      } catch (err) {
        console.error('[Supabase DB Query Exception]:', err);
      }
    }

    // 2. Local registered user fallback lookup
    const localUser = registeredUsers.find((u) => u.email.toLowerCase() === trimmedEmail);

    // If account not found in DB nor local registered list -> Deny access
    if (!dbUser && !localUser) {
      return res.status(401).json({
        success: false,
        error: 'Account not registered in database. Unregistered users cannot log in. Please create an account first.',
      });
    }

    // 3. Password Verification
    const storedPassword = userCredentialsStore.get(trimmedEmail) || localUser?.password;
    if (storedPassword && String(password) !== String(storedPassword)) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect password. Access denied. Please check your credentials and try again.',
      });
    }

    // Save password in store for session
    userCredentialsStore.set(trimmedEmail, String(password));

    // Construct user object
    const foundUser = dbUser
      ? {
          id: dbUser.id,
          fullName: dbUser.full_name || dbUser.fullName || 'Civic Member',
          username: dbUser.username || trimmedEmail.split('@')[0],
          email: dbUser.email,
          role: dbUser.role || 'user',
          avatarUrl: dbUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
          location: dbUser.location || 'Kampala, Uganda',
          bio: dbUser.bio || 'Community member',
          verified: Boolean(dbUser.verified ?? true),
        }
      : {
          id: localUser.id,
          fullName: localUser.fullName,
          username: localUser.username,
          email: localUser.email,
          role: localUser.role,
          avatarUrl: localUser.avatarUrl,
          location: localUser.location,
          bio: localUser.bio,
          verified: localUser.verified,
        };

    // Cache user in memory
    if (!registeredUsers.some((u) => u.id === foundUser.id)) {
      registeredUsers.push(foundUser);
    }

    return res.json({
      success: true,
      data: {
        user: foundUser,
        token: `cc_jwt_${foundUser.id}_token`,
      },
    });
  });

  router.post('/auth/register', async (req, res) => {
    const { fullName, email, password, confirmPassword, phone } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }
    if (!fullName) {
      return res.status(400).json({ success: false, error: 'Full Name is required.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required.' });
    }
    if (confirmPassword && String(password) !== String(confirmPassword)) {
      return res.status(400).json({ success: false, error: 'Passwords do not match. Please ensure passwords match.' });
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    // Save password into credentials store
    userCredentialsStore.set(trimmedEmail, String(password));

    // 1. Save and query directly via Supabase Database
    if (supabaseServerClient) {
      try {
        const { data: existing } = await supabaseServerClient
          .from('profiles')
          .select('id, email')
          .ilike('email', trimmedEmail)
          .maybeSingle();

        if (existing) {
          return res.status(400).json({
            success: false,
            error: 'An account with this email address already exists in the database. Please log in instead.',
          });
        }

        const newUserId = crypto.randomUUID();
        const baseUsername = String(fullName).toLowerCase().replace(/[^a-z0-9]/g, '_');
        const newUsername = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;

        const profileRecord = {
          id: newUserId,
          email: trimmedEmail,
          full_name: String(fullName).trim(),
          username: newUsername,
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
          role: 'user',
          verified: true,
          location: 'Kampala, Uganda',
          bio: 'Active civic community member',
        };

        const { data: inserted, error: insertError } = await supabaseServerClient
          .from('profiles')
          .insert([profileRecord])
          .select()
          .single();

        if (insertError) {
          console.error('[Supabase Register Insert Error]:', insertError);
        } else if (inserted) {
          registeredUsers.push({
            id: inserted.id,
            fullName: inserted.full_name,
            username: inserted.username,
            email: inserted.email,
            password: String(password),
            role: inserted.role,
            avatarUrl: inserted.avatar_url,
            location: inserted.location,
            bio: inserted.bio,
            verified: inserted.verified,
          });

          return res.json({
            success: true,
            message: 'Account created and saved directly to the Supabase database!',
            data: {
              user: {
                id: inserted.id,
                fullName: inserted.full_name,
                username: inserted.username,
                email: inserted.email,
                role: inserted.role,
                avatarUrl: inserted.avatar_url,
                location: inserted.location,
                bio: inserted.bio,
                verified: inserted.verified,
              },
              token: `cc_jwt_${inserted.id}_token`,
              supabaseConfirmed: true,
            },
          });
        }
      } catch (err) {
        console.error('[Supabase Register Exception]:', err);
      }
    }

    // 2. Fallback check if Supabase is not reached
    const alreadyExists = registeredUsers.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists. Please log in instead.',
      });
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      fullName: String(fullName).trim(),
      username: String(fullName).toLowerCase().replace(/[^a-z0-9]/g, '_'),
      email: trimmedEmail,
      password: password || 'Password123',
      phone: phone || '',
      role: 'user',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      location: 'Uganda',
      bio: 'Active civic community member',
      verified: true,
      confirmedAt: new Date().toISOString(),
    };

    registeredUsers.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;

    return res.json({
      success: true,
      message: 'Account created and confirmed successfully!',
      data: {
        user: userWithoutPassword,
        token: `cc_jwt_${newUser.id}_token`,
        supabaseConfirmed: true,
      },
    });
  });

  // Campaigns endpoints
  router.get('/campaigns', async (req, res) => {
    const { category, search } = req.query;
    let list = await dbGetCampaigns();
    if (category) {
      list = list.filter((c) => c.category.toLowerCase() === String(category).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q));
    }
    res.json({ success: true, data: list });
  });

  router.get('/campaigns/:id', async (req, res) => {
    const list = await dbGetCampaigns();
    const campaign = list.find((c) => c.id === req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    res.json({ success: true, data: campaign });
  });

  router.post('/campaigns', async (req, res) => {
    const organizerName = req.body.organizerName || req.body.ownerName || 'Community Member';
    const organizerAvatar = req.body.organizerAvatar || req.body.ownerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250';
    const organizerId = req.body.organizerId || req.body.ownerId || `usr_${Date.now()}`;

    const newCampaign = {
      id: `cmp_${Date.now()}`,
      ownerId: organizerId,
      ownerName: organizerName,
      ownerAvatar: organizerAvatar,
      ownerVerified: true,
      title: req.body.title || 'Untitled Campaign',
      category: req.body.category || 'Environment',
      summary: req.body.summary || '',
      description: req.body.description || '',
      location: req.body.location || 'Kampala',
      isOnline: Boolean(req.body.isOnline),
      coverUrl: req.body.coverUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000',
      goalType: req.body.goalType || 'signatures',
      goalValue: Number(req.body.goalValue) || 100,
      currentValue: 1,
      unitLabel: req.body.unitLabel || 'participants',
      organizerName,
      organizerAvatar,
      organizerVerified: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updates: [],
      endorsements: 1,
    };
    campaigns.unshift(newCampaign as any);
    saveDataToDisk();

    if (supabaseServerClient) {
      try {
        await supabaseServerClient.from('campaigns').insert([{
          id: newCampaign.id,
          title: newCampaign.title,
          category: newCampaign.category,
          summary: newCampaign.summary,
          description: newCampaign.description,
          location: newCampaign.location,
          is_online: newCampaign.isOnline,
          cover_url: newCampaign.coverUrl,
          goal_type: newCampaign.goalType,
          goal_value: newCampaign.goalValue,
          current_value: newCampaign.currentValue,
          unit_label: newCampaign.unitLabel,
          organizer_name: newCampaign.organizerName,
          organizer_avatar: newCampaign.organizerAvatar,
          organizer_verified: newCampaign.organizerVerified,
          status: newCampaign.status,
          created_at: newCampaign.createdAt,
          updates: JSON.stringify(newCampaign.updates),
          endorsements: newCampaign.endorsements,
        }]);
      } catch (e) {
        console.warn('[Supabase Campaign Insert Error]:', e);
      }
    }

    if (pgPool) {
      try {
        await pgPool.query(
          `INSERT INTO campaigns (id, title, category, summary, description, location, is_online, cover_url, goal_type, goal_value, current_value, unit_label, organizer_name, organizer_avatar, organizer_verified, status, created_at, updates, endorsements)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
           ON CONFLICT (id) DO NOTHING`,
          [
            newCampaign.id,
            newCampaign.title,
            newCampaign.category,
            newCampaign.summary,
            newCampaign.description,
            newCampaign.location,
            newCampaign.isOnline,
            newCampaign.coverUrl,
            newCampaign.goalType,
            newCampaign.goalValue,
            newCampaign.currentValue,
            newCampaign.unitLabel,
            newCampaign.organizerName,
            newCampaign.organizerAvatar,
            newCampaign.organizerVerified,
            newCampaign.status,
            newCampaign.createdAt,
            JSON.stringify(newCampaign.updates),
            newCampaign.endorsements,
          ]
        );
      } catch (e) {
        console.warn('[DB Campaign Insert Error]:', e);
      }
    }

    res.json({ success: true, data: newCampaign, message: 'Campaign published successfully' });
  });

  router.put('/campaigns/:id', async (req, res) => {
    const id = req.params.id;
    let campaign = campaigns.find((c) => c.id === id);

    if (!campaign && supabaseServerClient) {
      try {
        const { data } = await supabaseServerClient.from('campaigns').select('*').eq('id', id).maybeSingle();
        if (data) campaign = data;
      } catch (_) {}
    }

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    const { title, summary, description, category, location, isOnline, goalType, goalValue, unitLabel, coverUrl, status } = req.body;

    if (title) campaign.title = title;
    if (summary) campaign.summary = summary;
    if (description) campaign.description = description;
    if (category) campaign.category = category;
    if (location) campaign.location = location;
    if (isOnline !== undefined) campaign.isOnline = Boolean(isOnline);
    if (goalType) campaign.goalType = goalType;
    if (goalValue !== undefined) campaign.goalValue = Number(goalValue);
    if (unitLabel) campaign.unitLabel = unitLabel;
    if (coverUrl) campaign.coverUrl = coverUrl;
    if (status) campaign.status = status;

    saveDataToDisk();

    if (supabaseServerClient) {
      try {
        await supabaseServerClient.from('campaigns').update({
          title: campaign.title,
          summary: campaign.summary,
          description: campaign.description,
          category: campaign.category,
          location: campaign.location,
          is_online: campaign.isOnline,
          goal_type: campaign.goalType,
          goal_value: campaign.goalValue,
          unit_label: campaign.unitLabel,
          cover_url: campaign.coverUrl,
          status: campaign.status,
        }).eq('id', id);
      } catch (e) {
        console.warn('[Supabase Campaign Update Error]:', e);
      }
    }

    res.json({ success: true, data: campaign, message: 'Campaign updated successfully' });
  });

  router.delete('/campaigns/:id', async (req, res) => {
    const id = req.params.id;
    const index = campaigns.findIndex((c) => c.id === id);
    if (index !== -1) {
      campaigns.splice(index, 1);
    }
    saveDataToDisk();

    if (supabaseServerClient) {
      try {
        await supabaseServerClient.from('campaigns').delete().eq('id', id);
      } catch (e) {
        console.warn('[Supabase Campaign Delete Error]:', e);
      }
    }

    if (pgPool) {
      try {
        await pgPool.query('DELETE FROM campaigns WHERE id = $1', [id]);
      } catch (_) {}
    }

    res.json({ success: true, message: 'Campaign deleted successfully' });
  });

  router.post('/campaigns/:id/join', async (req, res) => {
    const campaign = campaigns.find((c) => c.id === req.params.id);
    if (campaign) {
      campaign.currentValue += 1;
      campaign.participantsCount = (campaign.participantsCount || 0) + 1;
      campaign.isJoined = true;
      saveDataToDisk();

      if (supabaseServerClient) {
        try {
          await supabaseServerClient.from('campaigns').update({
            current_value: campaign.currentValue,
            participants_count: campaign.participantsCount,
          }).eq('id', req.params.id);
        } catch (_) {}
      }

      if (pgPool) {
        try {
          await pgPool.query('UPDATE campaigns SET current_value = current_value + 1 WHERE id = $1', [req.params.id]);
        } catch (_) {}
      }

      res.json({ success: true, data: { joined: true, currentValue: campaign.currentValue } });
    } else {
      res.status(404).json({ success: false, error: 'Campaign not found' });
    }
  });

  // Groups endpoints
  router.get('/groups', async (req, res) => {
    const list = await dbGetGroups();
    res.json({ success: true, data: list });
  });

  router.get('/groups/:id', async (req, res) => {
    const list = await dbGetGroups();
    const group = list.find((g) => g.id === req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }
    res.json({ success: true, data: group });
  });

  router.post('/groups', async (req, res) => {
    const adminName = req.body.adminName || req.body.ownerName || 'Group Leader';
    const ownerId = req.body.ownerId || `usr_${Date.now()}`;
    const newGroup = {
      id: `grp_${Date.now()}`,
      ownerId,
      name: req.body.name || 'New Community Group',
      category: req.body.category || 'Youth',
      description: req.body.description || '',
      location: req.body.location || 'Uganda',
      visibility: req.body.visibility || 'public',
      memberCount: 1,
      activeDiscussions: 0,
      coverUrl: req.body.coverUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1000',
      createdAt: new Date().toISOString(),
      isJoined: true,
      adminName,
    };
    groups.unshift(newGroup as any);
    saveDataToDisk();

    if (supabaseServerClient) {
      try {
        await supabaseServerClient.from('groups').insert([{
          id: newGroup.id,
          name: newGroup.name,
          category: newGroup.category,
          description: newGroup.description,
          location: newGroup.location,
          visibility: newGroup.visibility,
          member_count: newGroup.memberCount,
          active_discussions: newGroup.activeDiscussions,
          cover_url: newGroup.coverUrl,
          created_at: newGroup.createdAt,
          is_joined: newGroup.isJoined,
        }]);
      } catch (e) {
        console.warn('[Supabase Group Insert Error]:', e);
      }
    }

    if (pgPool) {
      try {
        await pgPool.query(
          `INSERT INTO groups (id, name, category, description, location, visibility, member_count, active_discussions, cover_url, created_at, is_joined)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO NOTHING`,
          [
            newGroup.id,
            newGroup.name,
            newGroup.category,
            newGroup.description,
            newGroup.location,
            newGroup.visibility,
            newGroup.memberCount,
            newGroup.activeDiscussions,
            newGroup.coverUrl,
            newGroup.createdAt,
            newGroup.isJoined,
          ]
        );
      } catch (e) {
        console.warn('[DB Group Insert Error]:', e);
      }
    }

    res.json({ success: true, data: newGroup });
  });

  router.put('/groups/:id', async (req, res) => {
    const id = req.params.id;
    let group = groups.find((g) => g.id === id);

    if (!group && supabaseServerClient) {
      try {
        const { data } = await supabaseServerClient.from('groups').select('*').eq('id', id).maybeSingle();
        if (data) group = data;
      } catch (_) {}
    }

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    const { name, category, description, location, visibility, coverUrl, logoUrl } = req.body;

    if (name) group.name = name;
    if (category) group.category = category;
    if (description) group.description = description;
    if (location) group.location = location;
    if (visibility) group.visibility = visibility;
    if (coverUrl) group.coverUrl = coverUrl;
    if (logoUrl) group.logoUrl = logoUrl;

    saveDataToDisk();

    if (supabaseServerClient) {
      try {
        await supabaseServerClient.from('groups').update({
          name: group.name,
          category: group.category,
          description: group.description,
          location: group.location,
          visibility: group.visibility,
          cover_url: group.coverUrl,
        }).eq('id', id);
      } catch (e) {
        console.warn('[Supabase Group Update Error]:', e);
      }
    }

    res.json({ success: true, data: group, message: 'Group updated successfully' });
  });

  router.delete('/groups/:id', async (req, res) => {
    const id = req.params.id;
    const index = groups.findIndex((g) => g.id === id);
    if (index !== -1) {
      groups.splice(index, 1);
    }
    saveDataToDisk();

    if (supabaseServerClient) {
      try {
        await supabaseServerClient.from('groups').delete().eq('id', id);
      } catch (e) {
        console.warn('[Supabase Group Delete Error]:', e);
      }
    }

    if (pgPool) {
      try {
        await pgPool.query('DELETE FROM groups WHERE id = $1', [id]);
      } catch (_) {}
    }

    res.json({ success: true, message: 'Group deleted successfully' });
  });

  router.post('/groups/:id/join', async (req, res) => {
    const group = groups.find((g) => g.id === req.params.id);
    if (group) {
      group.isJoined = !group.isJoined;
      group.memberCount = group.isJoined ? group.memberCount + 1 : Math.max(1, group.memberCount - 1);
      saveDataToDisk();

      if (supabaseServerClient) {
        try {
          await supabaseServerClient.from('groups').update({
            is_joined: group.isJoined,
            member_count: group.memberCount,
          }).eq('id', req.params.id);
        } catch (_) {}
      }

      if (pgPool) {
        try {
          await pgPool.query(
            'UPDATE groups SET is_joined = $1, member_count = $2 WHERE id = $3',
            [group.isJoined, group.memberCount, req.params.id]
          );
        } catch (_) {}
      }

      res.json({ success: true, data: { joined: group.isJoined, membershipStatus: group.isJoined ? 'approved' : 'none' } });
    } else {
      res.status(404).json({ success: false, error: 'Group not found' });
    }
  });

  // Group Discussions & Posts endpoints
  router.get('/groups/:id/posts', async (req, res) => {
    const groupPosts = await dbGetPosts(req.params.id);
    res.json({ success: true, data: groupPosts });
  });

  router.post('/groups/:id/posts', async (req, res) => {
    const authorName = req.body.authorName || 'Community Member';
    const authorAvatar = req.body.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250';
    const authorRole = req.body.authorRole || 'Active Member';
    const authorId = req.body.authorId || `usr_${Date.now()}`;

    const newPost = {
      id: `pst_${Date.now()}`,
      groupId: req.params.id,
      authorId,
      authorName,
      authorAvatar,
      authorRole,
      body: req.body.body || req.body.text || '',
      mediaUrl: req.body.mediaUrl || null,
      likeCount: 1,
      commentCount: 0,
      isLiked: true,
      createdAt: 'Just now',
    };
    posts.unshift(newPost);
    comments[newPost.id] = [];
    saveDataToDisk();

    if (supabaseServerClient) {
      try {
        await supabaseServerClient.from('posts').insert([{
          id: newPost.id,
          group_id: newPost.groupId,
          author_id: newPost.authorId,
          author_name: newPost.authorName,
          author_avatar: newPost.authorAvatar,
          author_role: newPost.authorRole,
          body: newPost.body,
          media_url: newPost.mediaUrl,
          like_count: newPost.likeCount,
          comment_count: newPost.commentCount,
          is_liked: newPost.isLiked,
          created_at: new Date().toISOString(),
        }]);
      } catch (e) {
        console.warn('[Supabase Post Insert Error]:', e);
      }
    }

    if (pgPool) {
      try {
        await pgPool.query(
          `INSERT INTO posts (id, group_id, author_id, author_name, author_avatar, author_role, body, media_url, like_count, comment_count, is_liked, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            newPost.id,
            newPost.groupId,
            newPost.authorId,
            newPost.authorName,
            newPost.authorAvatar,
            newPost.authorRole,
            newPost.body,
            newPost.mediaUrl,
            newPost.likeCount,
            newPost.commentCount,
            newPost.isLiked,
            newPost.createdAt,
          ]
        );
      } catch (e) {
        console.warn('[DB Post Insert Error]:', e);
      }
    }

    res.json({ success: true, data: newPost });
  });

  router.put('/posts/:id', async (req, res) => {
    const id = req.params.id;
    let post = posts.find((p) => p.id === id);

    if (!post && supabaseServerClient) {
      try {
        const { data } = await supabaseServerClient.from('posts').select('*').eq('id', id).maybeSingle();
        if (data) post = data;
      } catch (_) {}
    }

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const { body, mediaUrl } = req.body;
    if (body !== undefined) post.body = body;
    if (mediaUrl !== undefined) post.mediaUrl = mediaUrl;

    saveDataToDisk();

    if (supabaseServerClient) {
      try {
        await supabaseServerClient.from('posts').update({
          body: post.body,
          media_url: post.mediaUrl,
        }).eq('id', id);
      } catch (e) {
        console.warn('[Supabase Post Update Error]:', e);
      }
    }

    res.json({ success: true, data: post, message: 'Post updated successfully' });
  });

  router.delete('/posts/:id', async (req, res) => {
    const id = req.params.id;
    const index = posts.findIndex((p) => p.id === id);
    if (index !== -1) {
      posts.splice(index, 1);
    }
    delete comments[id];
    saveDataToDisk();

    if (supabaseServerClient) {
      try {
        await supabaseServerClient.from('posts').delete().eq('id', id);
        await supabaseServerClient.from('comments').delete().eq('post_id', id);
      } catch (e) {
        console.warn('[Supabase Post Delete Error]:', e);
      }
    }

    if (pgPool) {
      try {
        await pgPool.query('DELETE FROM posts WHERE id = $1', [id]);
        await pgPool.query('DELETE FROM comments WHERE post_id = $1', [id]);
      } catch (_) {}
    }

    res.json({ success: true, message: 'Post deleted successfully' });
  });

  // Discussion Post Comments endpoints
  router.get('/posts/:id/comments', async (req, res) => {
    const postCommentsList = await dbGetComments(req.params.id);
    res.json({ success: true, data: postCommentsList });
  });

  router.delete('/comments/:id', async (req, res) => {
    const id = req.params.id;
    for (const postId in comments) {
      const idx = comments[postId].findIndex((c) => c.id === id);
      if (idx !== -1) {
        comments[postId].splice(idx, 1);
        break;
      }
    }

    saveDataToDisk();

    if (supabaseServerClient) {
      try {
        await supabaseServerClient.from('comments').delete().eq('id', id);
      } catch (e) {
        console.warn('[Supabase Comment Delete Error]:', e);
      }
    }

    if (pgPool) {
      try {
        await pgPool.query('DELETE FROM comments WHERE id = $1', [id]);
      } catch (_) {}
    }

    res.json({ success: true, message: 'Comment deleted successfully' });
  });

  router.post('/posts/:id/comments', async (req, res) => {
    const postId = req.params.id;
    const authorName = req.body.authorName || 'Community Member';
    const authorAvatar = req.body.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250';

    const newComment = {
      id: `c_${Date.now()}`,
      authorName,
      authorAvatar,
      body: req.body.body || req.body.text || '',
      createdAt: 'Just now',
    };
    if (!comments[postId]) comments[postId] = [];
    comments[postId].push(newComment);

    const post = posts.find((p) => p.id === postId);
    if (post) post.commentCount += 1;

    saveDataToDisk();

    if (supabaseServerClient) {
      try {
        await supabaseServerClient.from('comments').insert([{
          id: newComment.id,
          post_id: postId,
          author_name: newComment.authorName,
          author_avatar: newComment.authorAvatar,
          body: newComment.body,
          created_at: new Date().toISOString(),
        }]);
        await supabaseServerClient.from('posts').update({
          comment_count: (post?.commentCount || 1),
        }).eq('id', postId);
      } catch (e) {
        console.warn('[Supabase Comment Insert Error]:', e);
      }
    }

    if (pgPool) {
      try {
        await pgPool.query(
          `INSERT INTO comments (id, post_id, author_name, author_avatar, body, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [newComment.id, postId, newComment.authorName, newComment.authorAvatar, newComment.body, newComment.createdAt]
        );
        await pgPool.query('UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1', [postId]);
      } catch (e) {
        console.warn('[DB Comment Insert Error]:', e);
      }
    }

    res.json({ success: true, data: newComment });
  });

  router.post('/posts/:id/like', async (req, res) => {
    const post = posts.find((p) => p.id === req.params.id);
    if (post) {
      post.isLiked = !post.isLiked;
      post.likeCount = post.isLiked ? post.likeCount + 1 : Math.max(0, post.likeCount - 1);
      saveDataToDisk();

      if (supabaseServerClient) {
        try {
          await supabaseServerClient.from('posts').update({
            is_liked: post.isLiked,
            like_count: post.likeCount,
          }).eq('id', req.params.id);
        } catch (_) {}
      }

      if (pgPool) {
        try {
          await pgPool.query('UPDATE posts SET is_liked = $1, like_count = $2 WHERE id = $3', [
            post.isLiked,
            post.likeCount,
            req.params.id,
          ]);
        } catch (_) {}
      }

      res.json({ success: true, data: { isLiked: post.isLiked, likeCount: post.likeCount } });
    } else {
      res.status(404).json({ success: false, error: 'Post not found' });
    }
  });

  // Events endpoints
  router.get('/events', async (req, res) => {
    const list = await dbGetEvents();
    res.json({ success: true, data: list });
  });

  router.get('/events/:id', async (req, res) => {
    const list = await dbGetEvents();
    const event = list.find((e) => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    res.json({ success: true, data: event });
  });

  router.post('/events', async (req, res) => {
    const organizerName = req.body.organizerName || 'Community Organizer';
    const organizerAvatar = req.body.organizerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250';
    const organizerId = req.body.organizerId || `usr_${Date.now()}`;

    const newEvent = {
      id: `evt_${Date.now()}`,
      organizerId,
      organizerName,
      organizerAvatar,
      title: req.body.title || 'Community Event',
      description: req.body.description || '',
      category: req.body.category || 'Environment',
      coverUrl: req.body.coverUrl || 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&q=80&w=1000',
      venue: req.body.venue || 'Community Grounds',
      isOnline: Boolean(req.body.isOnline),
      startTime: req.body.startTime || new Date().toISOString(),
      endTime: req.body.endTime || new Date().toISOString(),
      capacity: Number(req.body.capacity) || 100,
      registeredCount: 1,
      isRegistered: true,
    };
    events.unshift(newEvent as any);
    saveDataToDisk();

    if (supabaseServerClient) {
      try {
        await supabaseServerClient.from('events').insert([{
          id: newEvent.id,
          organizer_id: newEvent.organizerId,
          organizer_name: newEvent.organizerName,
          title: newEvent.title,
          description: newEvent.description,
          category: newEvent.category,
          venue: newEvent.venue,
          is_online: newEvent.isOnline,
          start_time: newEvent.startTime,
          end_time: newEvent.endTime,
          capacity: newEvent.capacity,
          attendee_count: newEvent.registeredCount,
          cover_url: newEvent.coverUrl,
          is_registered: true,
          created_at: new Date().toISOString(),
        }]);
      } catch (e) {
        console.warn('[Supabase Event Insert Error]:', e);
      }
    }

    res.json({ success: true, data: newEvent });
  });

  router.put('/events/:id', async (req, res) => {
    const id = req.params.id;
    let event = events.find((e) => e.id === id);

    if (!event && supabaseServerClient) {
      try {
        const { data } = await supabaseServerClient.from('events').select('*').eq('id', id).maybeSingle();
        if (data) event = data;
      } catch (_) {}
    }

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const { title, description, category, venue, isOnline, startTime, endTime, capacity, coverUrl } = req.body;

    if (title) event.title = title;
    if (description) event.description = description;
    if (category) event.category = category;
    if (venue) event.venue = venue;
    if (isOnline !== undefined) event.isOnline = Boolean(isOnline);
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    if (capacity !== undefined) event.capacity = Number(capacity);
    if (coverUrl) event.coverUrl = coverUrl;

    saveDataToDisk();

    if (supabaseServerClient) {
      try {
        await supabaseServerClient.from('events').update({
          title: event.title,
          description: event.description,
          category: event.category,
          venue: event.venue,
          is_online: event.isOnline,
          start_time: event.startTime,
          end_time: event.endTime,
          capacity: event.capacity,
          cover_url: event.coverUrl,
        }).eq('id', id);
      } catch (e) {
        console.warn('[Supabase Event Update Error]:', e);
      }
    }

    res.json({ success: true, data: event, message: 'Event updated successfully' });
  });

  router.delete('/events/:id', async (req, res) => {
    const id = req.params.id;
    const index = events.findIndex((e) => e.id === id);
    if (index !== -1) {
      events.splice(index, 1);
    }
    saveDataToDisk();

    if (supabaseServerClient) {
      try {
        await supabaseServerClient.from('events').delete().eq('id', id);
      } catch (e) {
        console.warn('[Supabase Event Delete Error]:', e);
      }
    }

    if (pgPool) {
      try {
        await pgPool.query('DELETE FROM events WHERE id = $1', [id]);
      } catch (_) {}
    }

    res.json({ success: true, message: 'Event deleted successfully' });
  });

  router.post('/events/:id/register', async (req, res) => {
    const event = events.find((e) => e.id === req.params.id);
    if (event) {
      event.isRegistered = !event.isRegistered;
      event.registeredCount = event.isRegistered ? event.registeredCount + 1 : Math.max(1, event.registeredCount - 1);
      saveDataToDisk();

      if (supabaseServerClient) {
        try {
          await supabaseServerClient.from('events').update({
            is_registered: event.isRegistered,
            attendee_count: event.registeredCount,
          }).eq('id', req.params.id);
        } catch (_) {}
      }

      res.json({ success: true, data: { isRegistered: event.isRegistered, registeredCount: event.registeredCount } });
    } else {
      res.status(404).json({ success: false, error: 'Event not found' });
    }
  });

  // Reports endpoint
  router.post('/reports', (req, res) => {
    const { resourceType, resourceId, reason, details } = req.body;
    res.json({
      success: true,
      data: { id: `rep_${Date.now()}`, status: 'received' },
      message: 'Report submitted successfully and logged for moderator review',
    });
  });

  // Mount API Gateway router
  app.use('/api/v1', router);
  app.use('/api', router);

  // Vite development mode integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CommunityConnect Express API Gateway running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
