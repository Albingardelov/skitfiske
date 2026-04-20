// lib/supabase/species.ts
import { createClient } from '@/lib/supabase/client';
import type { ClubSpecies } from '@/types/species';

/** Hämtar alla klubbspecifika arter för en given klubb. */
export async function fetchClubSpecies(clubId: string): Promise<ClubSpecies[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('club_species')
    .select('*')
    .eq('club_id', clubId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Lägger till en ny art i klubbens lista. */
export async function insertClubSpecies(
  clubId: string,
  name: string,
  userId: string,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('club_species')
    .insert({ club_id: clubId, name: name.trim(), created_by: userId });
  if (error) throw error;
}

/** Tar bort en art (RLS kontrollerar att det är skaparen som tar bort). */
export async function deleteClubSpecies(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('club_species')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
