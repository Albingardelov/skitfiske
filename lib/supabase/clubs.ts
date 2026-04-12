// lib/supabase/clubs.ts
import { createClient } from '@/lib/supabase/client';
import type { Club, ClubMembership } from '@/types/club';

const STORAGE_KEY = 'skitfiske.activeClubId';

export function readStoredActiveClubId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function persistActiveClubId(id: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export async function fetchMyClubMemberships(userId: string): Promise<ClubMembership[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('club_members')
    .select(
      `
      role,
      clubs (
        id,
        name,
        slug,
        invite_code,
        created_at,
        created_by
      )
    `
    )
    .eq('user_id', userId);

  if (error) throw error;
  const rows = data ?? [];
  const out: ClubMembership[] = [];
  for (const row of rows as { role: string; clubs: Club | Club[] | null }[]) {
    const club = Array.isArray(row.clubs) ? row.clubs[0] : row.clubs;
    if (!club) continue;
    const role = row.role === 'admin' ? 'admin' : 'member';
    out.push({ role, club });
  }
  return out;
}

export async function createClubRpc(name: string): Promise<Club> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('create_club', { p_name: name });
  if (error) throw error;
  return data as Club;
}

export async function joinClubByCodeRpc(code: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('join_club_by_code', {
    p_code: code.trim(),
  });
  if (error) throw error;
  return data as string;
}
