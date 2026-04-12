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
  /** Havs-/modellerad ytvatten temp (°C), Open-Meteo marine. */
  sea_surface_temp_c: number | null;
  /** Lufttemperatur vid platsen (°C), Open-Meteo forecast. */
  air_temp_c: number | null;
  image_url: string | null;
  caught_at: string;
  created_at: string;
  bait: string | null;
  /** Vilken klubb fångsten rapporteras under (krävs för nya rader). */
  club_id: string | null;
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
  sea_surface_temp_c: number | null;
  air_temp_c: number | null;
  image_url: string | null;
  caught_at: string;
  bait: string | null;
  club_id: string;
}
