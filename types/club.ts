// types/club.ts
export interface Club {
  id: string;
  name: string;
  slug: string;
  invite_code: string;
  created_at: string;
  created_by: string;
}

export interface ClubMembership {
  role: 'admin' | 'member';
  club: Club;
}
