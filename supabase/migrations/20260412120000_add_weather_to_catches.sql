-- Kör i Supabase SQL Editor eller via CLI om du använder migrationer.
alter table public.catches
  add column if not exists sea_surface_temp_c double precision,
  add column if not exists air_temp_c double precision;

comment on column public.catches.sea_surface_temp_c is 'Modellerad havs-/ytvatten-temp (°C), t.ex. Open-Meteo marine.';
comment on column public.catches.air_temp_c is 'Lufttemperatur vid platsen (°C), t.ex. Open-Meteo forecast.';
