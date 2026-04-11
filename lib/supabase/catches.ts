// lib/supabase/catches.ts
import { createClient } from '@/lib/supabase/client';
import type { Catch, InsertCatch } from '@/types/catch';

export async function fetchMyCatches(userId: string): Promise<Catch[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('catches')
    .select('*')
    .eq('user_id', userId)
    .order('caught_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchAllCatches(): Promise<Catch[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('catches')
    .select('*')
    .order('caught_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function insertCatch(entry: InsertCatch): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('catches').insert(entry);
  if (error) throw error;
}

export async function fetchCatch(id: string): Promise<Catch | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('catches')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function uploadCatchImage(userId: string, file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from('catch-images').upload(path, file);
  if (error) throw error;

  const { data } = supabase.storage.from('catch-images').getPublicUrl(path);
  return data.publicUrl;
}
