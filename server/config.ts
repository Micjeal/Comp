import type { NextFunction, Request, Response } from 'express';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

export const PORT = Number(process.env.PORT || 3000);
export const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
export const REQUIRE_EMAIL_CONFIRMATION = process.env.REQUIRE_EMAIL_CONFIRMATION === 'true';

const options = { auth: { persistSession: false, autoRefreshToken: false } };
export const supabasePublic = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options) : null;
export const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, options) : null;

export interface ProfileRow {
  id: string; email: string; full_name: string; username: string; phone?: string | null;
  avatar_url?: string | null; cover_url?: string | null; bio?: string | null; location?: string | null;
  role: string; verified: boolean; created_at: string; [key: string]: any;
}

declare global {
  namespace Express {
    interface Request { authUser?: User; profile?: ProfileRow; accessToken?: string; }
  }
}

export function asyncRoute(handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => { Promise.resolve(handler(req, res, next)).catch(next); };
}

export function getDb(): SupabaseClient {
  if (!supabaseAdmin) {
    const error = new Error('Server misconfigured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
    (error as any).status = 503;
    throw error;
  }
  return supabaseAdmin;
}

export function cleanText(value: unknown, maxLength = 100_000): string { return String(value ?? '').trim().slice(0, maxLength); }
export function requireText(value: unknown, field: string, maxLength = 100_000): string {
  const text = cleanText(value, maxLength);
  if (!text) { const error = new Error(`${field} is required.`); (error as any).status = 400; throw error; }
  return text;
}
export function slugify(value: string): string {
  const base = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'community';
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}
export function isStaff(profile?: ProfileRow | null): boolean { return profile?.role === 'admin' || profile?.role === 'moderator'; }

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ') || !supabaseAdmin) return next();
  const accessToken = header.slice(7).trim();
  if (!accessToken) return next();
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !data.user) return next();
    const profile = await supabaseAdmin.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
    req.authUser = data.user;
    req.accessToken = accessToken;
    if (profile.data) req.profile = profile.data as ProfileRow;
  } catch { /* public routes continue unauthenticated */ }
  next();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  await optionalAuth(req, res, async () => {
    if (!req.authUser || !req.profile) { res.status(401).json({ success: false, error: 'Authentication required.' }); return; }
    next();
  });
}

export async function requireStaff(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, async () => {
    if (!isStaff(req.profile)) { res.status(403).json({ success: false, error: 'Moderator or administrator role required.' }); return; }
    next();
  });
}
