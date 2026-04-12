// types/catch.ts
export interface Catch {
  id: string;
  user_id: string;
  full_name: string;
  species: string;
  weight_kg: number;
  length_cm: number;
  location_text: string | null;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  caught_at: string;
  created_at: string;
  bait: string | null;
}

export interface InsertCatch {
  user_id: string;
  full_name: string;
  species: string;
  weight_kg: number;
  length_cm: number;
  location_text: string | null;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  caught_at: string;
  bait: string | null;
}
