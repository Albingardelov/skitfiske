// types/chat.ts
export interface Channel {
  id: string;
  name: string;
  label: string;
  /** När satt: kanal tillhör en specifik klubb. */
  club_id?: string | null;
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  full_name: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  status?: 'pending' | 'error';
}
