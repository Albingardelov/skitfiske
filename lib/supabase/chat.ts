// lib/supabase/chat.ts
import { createClient } from '@/lib/supabase/client';
import type { Channel, Message } from '@/types/chat';

export async function fetchChannelsForClub(clubId: string): Promise<Channel[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('club_id', clubId)
    .order('name');

  if (error) throw error;
  return (data ?? []) as Channel[];
}

export async function fetchMessages(channelId: string, limit = 50): Promise<Message[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function insertMessage(message: {
  channel_id: string;
  user_id: string;
  full_name: string;
  content: string | null;
  image_url: string | null;
}): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('messages').insert(message);
  if (error) throw error;
}

export async function deleteMessage(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('messages').delete().eq('id', id);
  if (error) throw error;
}

export async function updateMessage(id: string, content: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('messages').update({ content }).eq('id', id);
  if (error) throw error;
}

export async function uploadChatImage(userId: string, file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from('chat-images').upload(path, file);
  if (error) throw error;

  const { data } = supabase.storage.from('chat-images').getPublicUrl(path);
  return data.publicUrl;
}
