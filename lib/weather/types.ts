// lib/weather/types.ts
/** Snapshot from /api/weather (Open-Meteo marine + forecast). */
export type WeatherSnapshot = {
  seaSurfaceTempC: number | null;
  airTempC: number | null;
  windSpeedMs: number | null;
};
