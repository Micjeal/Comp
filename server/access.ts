import type { Request } from 'express';
import { getDb, isStaff, type ProfileRow } from './config';

export async function canManageResource(table: string, id: string, req: Request): Promise<boolean> {
  if (!req.authUser) return false;
  if (isStaff(req.profile)) return true;
  const ownerColumn = table === 'comments' || table === 'group_posts' ? 'author_id' : table === 'events' ? 'organizer_id' : 'owner_id';
  const { data, error } = await getDb().from(table).select(`id,${ownerColumn}`).eq('id', id).maybeSingle();
  return !error && Boolean(data) && data![ownerColumn] === req.authUser.id;
}

export async function groupAccess(groupId: string, userId?: string, profile?: ProfileRow) {
  const db = getDb();
  const { data: group, error } = await db.from('groups').select('id,owner_id,is_public').eq('id', groupId).maybeSingle();
  if (error || !group) return { exists: false, allowed: false, membership: null as string | null };
  if (group.is_public) return { exists: true, allowed: true, membership: null as string | null };
  if (!userId) return { exists: true, allowed: false, membership: null as string | null };
  if (group.owner_id === userId || isStaff(profile)) return { exists: true, allowed: true, membership: 'approved' };
  const { data: membership } = await db.from('group_members').select('status').eq('group_id', groupId).eq('user_id', userId).maybeSingle();
  return { exists: true, allowed: membership?.status === 'approved', membership: membership?.status || null };
}
