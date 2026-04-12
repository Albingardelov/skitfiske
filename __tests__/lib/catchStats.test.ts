import type { Catch } from '@/types/catch';
import { heaviestCatch, monthOverMonthTrendLabel } from '@/lib/catchStats';

const base: Catch = {
  id: 'x',
  user_id: 'u',
  full_name: 'A',
  species: 'Gädda',
  weight_kg: 1,
  length_cm: 50,
  location_text: null,
  lat: null,
  lng: null,
  sea_surface_temp_c: null,
  air_temp_c: null,
  image_url: null,
  caught_at: '2026-01-01T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
  bait: null,
  club_id: null,
};

function makeCatch(over: Partial<Catch>): Catch {
  return { ...base, ...over };
}

describe('catchStats', () => {
  it('heaviestCatch väljer största vikt', () => {
    const a = makeCatch({ id: '1', weight_kg: 2 });
    const b = makeCatch({ id: '2', weight_kg: 5 });
    expect(heaviestCatch([a, b])?.id).toBe('2');
  });

  it('monthOverMonthTrendLabel returnerar null för tom lista', () => {
    expect(monthOverMonthTrendLabel([])).toBeNull();
  });
});
