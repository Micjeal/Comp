import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy client holder to prevent crashes on startup if credentials are missing
let supabaseClient: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  const meta = import.meta as any;
  const url = meta?.env?.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : undefined);
  const key = meta?.env?.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : undefined);
  return Boolean(url && key && url !== 'https://your-project.supabase.co' && !url.includes('your-project'));
};

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseClient) return supabaseClient;

  const meta = import.meta as any;
  const url = meta?.env?.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : undefined);
  const key = meta?.env?.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : undefined);

  if (!url || !key || url === 'https://your-project.supabase.co' || url.includes('your-project')) {
    console.warn('[Supabase] Credentials not configured in .env. Falling back to local/in-memory API storage.');
    return null;
  }

  try {
    supabaseClient = createClient(url, key);
    console.log('[Supabase] Client initialized successfully!');
    return supabaseClient;
  } catch (err) {
    console.error('[Supabase] Initialization error:', err);
    return null;
  }
};

// Supabase Helper Methods with API Fallbacks
export const supabaseApi = {
  // Fetch campaigns from Supabase or fallback
  async getCampaigns() {
    const client = getSupabase();
    if (!client) return null;
    const { data, error } = await client.from('campaigns').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('[Supabase Error] getCampaigns:', error);
      return null;
    }
    return data;
  },

  // Create campaign in Supabase
  async createCampaign(campaign: Record<string, any>) {
    const client = getSupabase();
    if (!client) return null;
    const { data, error } = await client.from('campaigns').insert([campaign]).select().single();
    if (error) {
      console.error('[Supabase Error] createCampaign:', error);
      return null;
    }
    return data;
  },

  // Join campaign in Supabase
  async joinCampaign(campaignId: string, userId: string) {
    const client = getSupabase();
    if (!client) return null;
    const { data, error } = await client.from('campaign_participants').insert([{ campaign_id: campaignId, user_id: userId }]);
    if (error) console.error('[Supabase Error] joinCampaign:', error);
    return !error;
  },

  // Fetch groups from Supabase
  async getGroups() {
    const client = getSupabase();
    if (!client) return null;
    const { data, error } = await client.from('groups').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('[Supabase Error] getGroups:', error);
      return null;
    }
    return data;
  },

  // Submit report to Supabase
  async submitReport(report: { resource_type: string; resource_id: string; reason: string; details?: string }) {
    const client = getSupabase();
    if (!client) return null;
    const { data, error } = await client.from('moderation_reports').insert([report]).select().single();
    if (error) {
      console.error('[Supabase Error] submitReport:', error);
      return null;
    }
    return data;
  },
};
