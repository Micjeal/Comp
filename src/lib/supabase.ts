import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  const meta = import.meta as any;
  const url = meta?.env?.VITE_SUPABASE_URL;
  const key = meta?.env?.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes('your-project'));
};

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseClient) return supabaseClient;

  const meta = import.meta as any;
  const url = meta?.env?.VITE_SUPABASE_URL;
  const key = meta?.env?.VITE_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes('your-project')) return null;

  supabaseClient = createClient(url, key);
  return supabaseClient;
};

export const supabaseApi = {
  async getCampaigns() {
    const db = getSupabase();
    if (!db) return null;
    const { data } = await db.from('campaigns').select('*').order('created_at', { ascending: false });
    return data;
  },

  async getCampaign(id: string) {
    const db = getSupabase();
    if (!db) return null;
    const { data } = await db.from('campaigns').select('*').eq('id', id).single();
    return data;
  },

  async createCampaign(payload: Record<string, any>) {
    const db = getSupabase();
    if (!db) return null;
    const { data } = await db.from('campaigns').insert(payload).select().single();
    return data;
  },

  async joinCampaign(campaignId: string, userId: string) {
    const db = getSupabase();
    if (!db) return false;
    const { error } = await db.from('campaign_participants').insert({ campaign_id: campaignId, user_id: userId });
    return !error;
  },

  async getGroups() {
    const db = getSupabase();
    if (!db) return null;
    const { data } = await db.from('groups').select('*').order('created_at', { ascending: false });
    return data;
  },

  async getGroupPosts(groupId: string) {
    const db = getSupabase();
    if (!db) return null;
    const { data } = await db.from('group_posts').select('*').eq('group_id', groupId).order('created_at', { ascending: false });
    return data;
  },

  async createGroupPost(payload: Record<string, any>) {
    const db = getSupabase();
    if (!db) return null;
    const { data } = await db.from('group_posts').insert(payload).select().single();
    return data;
  },

  async getComments(postId: string) {
    const db = getSupabase();
    if (!db) return null;
    const { data } = await db.from('comments').select('*').eq('post_id', postId).order('created_at');
    return data;
  },

  async createComment(payload: Record<string, any>) {
    const db = getSupabase();
    if (!db) return null;
    const { data } = await db.from('comments').insert(payload).select().single();
    return data;
  },

  async getEvents() {
    const db = getSupabase();
    if (!db) return null;
    const { data } = await db.from('events').select('*').order('start_time');
    return data;
  },

  async submitReport(report: Record<string, any>) {
    const db = getSupabase();
    if (!db) return null;
    const { data } = await db.from('moderation_reports').insert(report).select().single();
    return data;
  }
};
