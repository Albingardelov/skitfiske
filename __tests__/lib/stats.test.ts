import type { Catch } from '@/types/catch';
import {
  computePersonalStats,
  computePatternInsights,
  computeLeaderboard,
  computeHomeInsight,
} from '@/lib/stats/index';

const YEAR = new Date().getFullYear();

const base: Catch = {
  id: '1',
  user_id: 'u1',
  full_name: 'Anna Svensson',
  species: 'Gädda',
  weight_kg: 2.5,
  length_cm: 60,
  location_text: null,
  lat: null,
  lng: null,
  sea_surface_temp_c: null,
  air_temp_c: null,
  image_url: null,
  caught_at: `${YEAR}-04-15T07:30:00Z`,
  created_at: `${YEAR}-04-15T07:30:00Z`,
  bait: 'Jigg',
  club_id: 'club1',
};

let _id = 0;
function mc(over: Partial<Catch>): Catch {
  return { ...base, id: String(++_id), ...over };
}

// ─── computePersonalStats ──────────────────────────────────────────────────

describe('computePersonalStats', () => {
  it('returnerar nollor för tom lista', () => {
    const s = computePersonalStats([]);
    expect(s.seasonCatchCount).toBe(0);
    expect(s.heaviestCatch).toBeNull();
    expect(s.topBait).toBeNull();
    expect(s.speciesRecords).toHaveLength(0);
  });

  it('räknar bara innevarande år i säsongen', () => {
    const thisYear = mc({ caught_at: `${YEAR}-03-01T12:00:00Z` });
    const lastYear = mc({ caught_at: `${YEAR - 1}-03-01T12:00:00Z` });
    expect(computePersonalStats([thisYear, lastYear]).seasonCatchCount).toBe(1);
  });

  it('hittar tyngsta fångsten oavsett år', () => {
    const light = mc({ weight_kg: 1.0, caught_at: `${YEAR - 1}-01-01T12:00:00Z` });
    const heavy = mc({ weight_kg: 8.5 });
    expect(computePersonalStats([light, heavy]).heaviestCatch?.weightKg).toBe(8.5);
  });

  it('identifierar toppbete baserat på antal', () => {
    const catches = [mc({ bait: 'Jigg' }), mc({ bait: 'Jigg' }), mc({ bait: 'Masken' })];
    expect(computePersonalStats(catches).topBait).toBe('Jigg');
  });

  it('sorterar artrekord efter antal, fallande', () => {
    const catches = [mc({ species: 'Abborre' }), mc({ species: 'Gädda' }), mc({ species: 'Abborre' })];
    const records = computePersonalStats(catches).speciesRecords;
    expect(records[0].species).toBe('Abborre');
    expect(records[0].count).toBe(2);
  });
});

// ─── computePatternInsights ────────────────────────────────────────────────

describe('computePatternInsights', () => {
  it('returnerar tom lista för tom input', () => {
    expect(computePatternInsights([])).toHaveLength(0);
  });

  it('returnerar tom lista när ingen art når tröskel', () => {
    const catches = Array.from({ length: 4 }, () => mc({}));
    expect(computePatternInsights(catches)).toHaveLength(0);
  });

  it('genererar tid-på-dygnet-insikt för art med ≥5 fångster', () => {
    const catches = Array.from({ length: 5 }, () =>
      mc({ caught_at: `${YEAR}-04-01T07:00:00Z` }),
    );
    const insights = computePatternInsights(catches);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0].text).toContain('morgnar');
  });

  it('genererar bete-insikt när ett bete dominerar 2×', () => {
    const catches = [
      ...Array.from({ length: 6 }, () => mc({ bait: 'Jigg', caught_at: `${YEAR}-04-01T12:00:00Z` })),
      ...Array.from({ length: 2 }, () => mc({ bait: 'Masken', caught_at: `${YEAR}-04-01T12:00:00Z` })),
      mc({ caught_at: `${YEAR}-04-01T12:00:00Z` }),
    ];
    const baitInsight = computePatternInsights(catches).find((i) => i.text.includes('×'));
    expect(baitInsight).toBeTruthy();
    expect(baitInsight?.text).toContain('Jigg');
  });

  it('begränsar insikter till max 3', () => {
    const catches = [
      ...Array.from({ length: 5 }, () => mc({ species: 'Gädda', caught_at: `${YEAR}-04-01T07:00:00Z` })),
      ...Array.from({ length: 5 }, () => mc({ species: 'Abborre', caught_at: `${YEAR}-05-01T07:00:00Z` })),
      ...Array.from({ length: 5 }, () => mc({ species: 'Öring', caught_at: `${YEAR}-06-01T07:00:00Z` })),
    ];
    expect(computePatternInsights(catches).length).toBeLessThanOrEqual(3);
  });
});

// ─── computeLeaderboard ────────────────────────────────────────────────────

describe('computeLeaderboard', () => {
  it('returnerar tomma listor för tom input', () => {
    const lb = computeLeaderboard([], 'u1');
    expect(lb.topList).toHaveLength(0);
    expect(lb.speciesRecords).toHaveLength(0);
    expect(lb.recentBig).toHaveLength(0);
  });

  it('markerar inloggad användare i topplistan', () => {
    const catches = Array.from({ length: 3 }, () =>
      mc({ user_id: 'u1', caught_at: `${YEAR}-04-01T12:00:00Z` }),
    );
    expect(computeLeaderboard(catches, 'u1').topList[0].isCurrentUser).toBe(true);
  });

  it('räknar bara innevarande år i säsongstoppen', () => {
    const thisYear = mc({ user_id: 'u1', caught_at: `${YEAR}-04-01T12:00:00Z` });
    const lastYear = mc({ user_id: 'u1', caught_at: `${YEAR - 1}-04-01T12:00:00Z` });
    expect(computeLeaderboard([thisYear, lastYear], 'u1').topList[0].count).toBe(1);
  });

  it('hittar tyngsta per art för klubbrekord', () => {
    const catches = [
      mc({ species: 'Gädda', weight_kg: 3.0, full_name: 'Anna Svensson' }),
      mc({ species: 'Gädda', weight_kg: 7.5, full_name: 'Björn Berg' }),
    ];
    const lb = computeLeaderboard(catches, 'u1');
    expect(lb.speciesRecords[0].weightKg).toBe(7.5);
    expect(lb.speciesRecords[0].fullName).toBe('Björn Berg');
  });

  it('recentBig visar bara senaste 30 dagarna', () => {
    const old = mc({
      weight_kg: 10.0,
      caught_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    });
    const recent = mc({
      weight_kg: 5.0,
      caught_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    });
    const lb = computeLeaderboard([old, recent], 'u1');
    expect(lb.recentBig).toHaveLength(1);
    expect(lb.recentBig[0].weightKg).toBe(5.0);
  });
});

// ─── computeHomeInsight ────────────────────────────────────────────────────

describe('computeHomeInsight', () => {
  it('returnerar null för tom lista', () => {
    expect(computeHomeInsight([], new Date())).toBeNull();
  });

  it('returnerar null när ingen art når tröskel', () => {
    const catches = Array.from({ length: 4 }, () => mc({}));
    expect(computeHomeInsight(catches, new Date())).toBeNull();
  });

  it('returnerar null när varken tid eller månad matchar', () => {
    const catches = Array.from({ length: 5 }, () =>
      mc({ caught_at: `${YEAR}-01-15T07:00:00Z` }),
    );
    const now = new Date(`${YEAR}-07-15T20:00:00Z`);
    expect(computeHomeInsight(catches, now)).toBeNull();
  });

  it('returnerar insikt när månaden matchar', () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const catches = Array.from({ length: 5 }, () =>
      mc({ caught_at: `${YEAR}-${month}-15T12:00:00Z` }),
    );
    expect(computeHomeInsight(catches, now)).not.toBeNull();
  });

  it('inkluderar toppbete i insikten', () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const catches = Array.from({ length: 5 }, () =>
      mc({ bait: 'Jigg', caught_at: `${YEAR}-${month}-15T12:00:00Z` }),
    );
    expect(computeHomeInsight(catches, now)?.topBait).toBe('Jigg');
  });
});
