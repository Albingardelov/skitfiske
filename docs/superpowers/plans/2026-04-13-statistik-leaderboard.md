# Statistik, Leaderboard & Mönsterinsikt — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Statistik-flik i Logbok med personlig säsongsstatistik, rekord per art, mönsterinsikter och klubbleaderboard, plus ett kontextuellt insiktskort på Hem.

**Architecture:** All computation lives in pure functions in `lib/stats/index.ts` (testable in isolation). UI components consume pre-computed data via props. Logbok gets a top-level Logg|Statistik tab toggle; Statistik-fliken fetches its own data independently. Hem gets a HomeInsightCard that reuses already-fetched myCatches.

**Tech Stack:** Next.js App Router, MUI v6, TypeScript, Jest + React Testing Library, Supabase (existing `catches` table, no schema changes)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `lib/stats/index.ts` | Pure computation: personalStats, patternInsights, leaderboard, homeInsight |
| Create | `__tests__/lib/stats.test.ts` | Unit tests for all four functions |
| Create | `components/logbok/LogbokTabs.tsx` | Top-level Logg\|Statistik tab bar |
| Create | `components/stats/SeasonKpiRow.tsx` | 3 KPI cards (fångster/tyngsta/toppbete) |
| Create | `components/stats/SpeciesRecordList.tsx` | Rekord per art, collapsible |
| Create | `components/stats/PatternInsightCards.tsx` | Mönsterinsikts-kort |
| Create | `components/stats/ClubLeaderboard.tsx` | Topplista + klubbrekord + senaste stora |
| Create | `components/logbok/StatistikView.tsx` | Data-fetching container for stats tab |
| Modify | `app/(app)/logbok/page.tsx` | Add LogbokTabs, render StatistikView on stats tab |
| Create | `components/home/HomeInsightCard.tsx` | Kontextuellt insiktskort |
| Modify | `app/(app)/hem/page.tsx` | Add HomeInsightCard after HemHero |

---

## Task 1: lib/stats/index.ts — rena beräkningsfunktioner

**Files:**
- Create: `lib/stats/index.ts`
- Create: `__tests__/lib/stats.test.ts`

- [ ] **Steg 1: Skriv det felande testet**

Skapa `__tests__/lib/stats.test.ts`:

```typescript
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
      mc({ caught_at: `${YEAR}-04-01T07:00:00Z` }), // morgon UTC
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
    // Morgonfångster i januari, kontrolleras kväll i juli
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
```

- [ ] **Steg 2: Kör testet och verifiera att det misslyckas**

```bash
npx jest __tests__/lib/stats.test.ts --no-coverage 2>&1 | head -20
```

Förväntat: `Cannot find module '@/lib/stats/index'`

- [ ] **Steg 3: Implementera lib/stats/index.ts**

Skapa `lib/stats/index.ts`:

```typescript
import type { Catch } from '@/types/catch';

// ─── Types ─────────────────────────────────────────────────────────────────

export type TimeBlock = 'Morgon' | 'Dag' | 'Kväll' | 'Natt';

export interface SpeciesRecord {
  species: string;
  count: number;
  heaviestKg: number;
  longestCm: number;
}

export interface PersonalStats {
  seasonCatchCount: number;
  heaviestCatch: { species: string; weightKg: number } | null;
  topBait: string | null;
  speciesRecords: SpeciesRecord[];
}

export interface PatternInsight {
  text: string;
  species: string;
}

export interface TopListEntry {
  userId: string;
  fullName: string;
  count: number;
  rank: number;
  isCurrentUser: boolean;
}

export interface ClubSpeciesRecord {
  species: string;
  weightKg: number;
  fullName: string;
}

export interface RecentBigCatch {
  species: string;
  weightKg: number;
  fullName: string;
  caughtAt: string;
}

export interface LeaderboardData {
  topList: TopListEntry[];
  speciesRecords: ClubSpeciesRecord[];
  recentBig: RecentBigCatch[];
}

export interface HomeInsight {
  species: string;
  timeLabel: string | null;
  monthLabel: string | null;
  topBait: string | null;
}

// ─── Internal helpers ──────────────────────────────────────────────────────

const TIME_BLOCK_LABELS: Record<TimeBlock, string> = {
  Morgon: 'tidiga morgnar',
  Dag: 'dagtid',
  Kväll: 'kvällar',
  Natt: 'nätter',
};

const MONTH_NAMES = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

function getTimeBlock(isoDate: string): TimeBlock {
  const hour = new Date(isoDate).getHours();
  if (hour >= 5 && hour < 10) return 'Morgon';
  if (hour >= 10 && hour < 17) return 'Dag';
  if (hour >= 17 && hour < 22) return 'Kväll';
  return 'Natt';
}

function topKey<T>(map: Map<T, number>): T | null {
  let best: T | null = null;
  let bestCount = 0;
  for (const [key, count] of map) {
    if (count > bestCount) {
      bestCount = count;
      best = key;
    }
  }
  return best;
}

// ─── computePersonalStats ──────────────────────────────────────────────────

export function computePersonalStats(catches: Catch[]): PersonalStats {
  const year = new Date().getFullYear();
  const seasonCatches = catches.filter(
    (c) => new Date(c.caught_at).getFullYear() === year,
  );

  const heaviest = catches.reduce<Catch | null>(
    (acc, c) => (!acc || c.weight_kg > acc.weight_kg ? c : acc),
    null,
  );

  const baitCounts = new Map<string, number>();
  for (const c of seasonCatches) {
    if (c.bait) baitCounts.set(c.bait, (baitCounts.get(c.bait) ?? 0) + 1);
  }

  const speciesMap = new Map<string, { count: number; heaviestKg: number; longestCm: number }>();
  for (const c of catches) {
    const prev = speciesMap.get(c.species) ?? { count: 0, heaviestKg: 0, longestCm: 0 };
    speciesMap.set(c.species, {
      count: prev.count + 1,
      heaviestKg: Math.max(prev.heaviestKg, c.weight_kg),
      longestCm: Math.max(prev.longestCm, c.length_cm),
    });
  }

  const speciesRecords: SpeciesRecord[] = [...speciesMap.entries()]
    .map(([species, d]) => ({ species, ...d }))
    .sort((a, b) => b.count - a.count);

  return {
    seasonCatchCount: seasonCatches.length,
    heaviestCatch: heaviest ? { species: heaviest.species, weightKg: heaviest.weight_kg } : null,
    topBait: topKey(baitCounts),
    speciesRecords,
  };
}

// ─── computePatternInsights ────────────────────────────────────────────────

export function computePatternInsights(catches: Catch[]): PatternInsight[] {
  const THRESHOLD = 5;
  const insights: PatternInsight[] = [];

  const bySpecies = new Map<string, Catch[]>();
  for (const c of catches) {
    const arr = bySpecies.get(c.species) ?? [];
    arr.push(c);
    bySpecies.set(c.species, arr);
  }

  const qualified = [...bySpecies.entries()]
    .filter(([, cs]) => cs.length >= THRESHOLD)
    .sort((a, b) => b[1].length - a[1].length);

  for (const [species, cs] of qualified) {
    if (insights.length >= 3) break;

    // Bästa tid på dygnet
    const timeCounts = new Map<TimeBlock, number>();
    for (const c of cs) {
      const block = getTimeBlock(c.caught_at);
      timeCounts.set(block, (timeCounts.get(block) ?? 0) + 1);
    }
    const bestBlock = topKey(timeCounts);
    if (bestBlock) {
      insights.push({
        species,
        text: `Du fångar mest ${species.toLowerCase()} ${TIME_BLOCK_LABELS[bestBlock]}`,
      });
    }

    if (insights.length >= 3) break;

    // Bästa bete (kräver 2× fördel)
    const baitCounts = new Map<string, number>();
    for (const c of cs) {
      if (c.bait) baitCounts.set(c.bait, (baitCounts.get(c.bait) ?? 0) + 1);
    }
    if (baitCounts.size >= 2) {
      const sorted = [...baitCounts.entries()].sort((a, b) => b[1] - a[1]);
      const [topBait, topCount] = sorted[0];
      const secondCount = sorted[1][1];
      const ratio = Math.round(topCount / secondCount);
      if (ratio >= 2) {
        insights.push({
          species,
          text: `${topBait} ger dig ${ratio}× fler ${species.toLowerCase()} än andra beten`,
        });
      }
    }

    if (insights.length >= 3) break;

    // Bästa månad
    const monthCounts = new Map<number, number>();
    for (const c of cs) {
      const month = new Date(c.caught_at).getMonth();
      monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1);
    }
    const bestMonth = topKey(monthCounts);
    if (bestMonth !== null) {
      insights.push({
        species,
        text: `Din bästa månad för ${species.toLowerCase()} är ${MONTH_NAMES[bestMonth]}`,
      });
    }
  }

  return insights;
}

// ─── computeLeaderboard ────────────────────────────────────────────────────

export function computeLeaderboard(catches: Catch[], currentUserId: string): LeaderboardData {
  const year = new Date().getFullYear();
  const now = Date.now();
  const MS_30 = 30 * 24 * 60 * 60 * 1000;

  const seasonCatches = catches.filter(
    (c) => new Date(c.caught_at).getFullYear() === year,
  );

  // Topplista: fångster per användare denna säsong
  const userCounts = new Map<string, { fullName: string; count: number }>();
  for (const c of seasonCatches) {
    const prev = userCounts.get(c.user_id) ?? { fullName: c.full_name, count: 0 };
    userCounts.set(c.user_id, { fullName: prev.fullName, count: prev.count + 1 });
  }
  const ranked = [...userCounts.entries()]
    .map(([userId, { fullName, count }]) => ({
      userId,
      fullName,
      count,
      rank: 0,
      isCurrentUser: userId === currentUserId,
    }))
    .sort((a, b) => b.count - a.count);

  const topList: TopListEntry[] = ranked.slice(0, 10).map((e, i) => ({ ...e, rank: i + 1 }));

  // Säkerställ att inloggad användare alltid syns
  if (currentUserId && !topList.some((e) => e.userId === currentUserId)) {
    const entry = userCounts.get(currentUserId);
    if (entry) {
      const rank = ranked.findIndex((e) => e.userId === currentUserId) + 1;
      topList.push({ userId: currentUserId, fullName: entry.fullName, count: entry.count, rank, isCurrentUser: true });
    }
  }

  // Klubbrekord per art (alla tider, tyngsta)
  const speciesHeaviest = new Map<string, { weightKg: number; fullName: string }>();
  for (const c of catches) {
    const prev = speciesHeaviest.get(c.species);
    if (!prev || c.weight_kg > prev.weightKg) {
      speciesHeaviest.set(c.species, { weightKg: c.weight_kg, fullName: c.full_name });
    }
  }
  const speciesRecords: ClubSpeciesRecord[] = [...speciesHeaviest.entries()]
    .map(([species, { weightKg, fullName }]) => ({ species, weightKg, fullName }))
    .sort((a, b) => b.weightKg - a.weightKg)
    .slice(0, 5);

  // Senaste stora: topp 3 tyngsta senaste 30 dagarna
  const recentBig: RecentBigCatch[] = catches
    .filter((c) => now - new Date(c.caught_at).getTime() <= MS_30)
    .sort((a, b) => b.weight_kg - a.weight_kg)
    .slice(0, 3)
    .map((c) => ({
      species: c.species,
      weightKg: c.weight_kg,
      fullName: c.full_name,
      caughtAt: c.caught_at,
    }));

  return { topList, speciesRecords, recentBig };
}

// ─── computeHomeInsight ────────────────────────────────────────────────────

export function computeHomeInsight(catches: Catch[], now: Date): HomeInsight | null {
  const THRESHOLD = 5;
  const currentHour = now.getHours();
  const currentMonth = now.getMonth();

  function hourToBlock(h: number): TimeBlock {
    if (h >= 5 && h < 10) return 'Morgon';
    if (h >= 10 && h < 17) return 'Dag';
    if (h >= 17 && h < 22) return 'Kväll';
    return 'Natt';
  }
  const currentBlock = hourToBlock(currentHour);
  const blockOrder: TimeBlock[] = ['Morgon', 'Dag', 'Kväll', 'Natt'];
  const idx = blockOrder.indexOf(currentBlock);
  const adjacentBlocks = new Set<TimeBlock>([
    blockOrder[(idx + 3) % 4],
    currentBlock,
    blockOrder[(idx + 1) % 4],
  ]);

  const bySpecies = new Map<string, Catch[]>();
  for (const c of catches) {
    const arr = bySpecies.get(c.species) ?? [];
    arr.push(c);
    bySpecies.set(c.species, arr);
  }

  const topEntry = [...bySpecies.entries()]
    .filter(([, cs]) => cs.length >= THRESHOLD)
    .sort((a, b) => b[1].length - a[1].length)[0];

  if (!topEntry) return null;

  const [species, cs] = topEntry;

  const timeCounts = new Map<TimeBlock, number>();
  for (const c of cs) {
    const block = getTimeBlock(c.caught_at);
    timeCounts.set(block, (timeCounts.get(block) ?? 0) + 1);
  }
  const bestBlock = topKey(timeCounts);
  const timeMatches = bestBlock ? adjacentBlocks.has(bestBlock) : false;
  const timeLabel = bestBlock ? TIME_BLOCK_LABELS[bestBlock] : null;

  const monthCounts = new Map<number, number>();
  for (const c of cs) {
    const m = new Date(c.caught_at).getMonth();
    monthCounts.set(m, (monthCounts.get(m) ?? 0) + 1);
  }
  const bestMonth = topKey(monthCounts);
  const monthMatches = bestMonth !== null && Math.abs(bestMonth - currentMonth) <= 1;
  const monthLabel = bestMonth !== null ? MONTH_NAMES[bestMonth] : null;

  if (!timeMatches && !monthMatches) return null;

  const baitCounts = new Map<string, number>();
  for (const c of cs) {
    if (c.bait) baitCounts.set(c.bait, (baitCounts.get(c.bait) ?? 0) + 1);
  }

  return {
    species,
    timeLabel: timeMatches ? timeLabel : null,
    monthLabel: monthMatches ? monthLabel : null,
    topBait: topKey(baitCounts),
  };
}
```

- [ ] **Steg 4: Kör testerna och verifiera att de passerar**

```bash
npx jest __tests__/lib/stats.test.ts --no-coverage 2>&1 | tail -15
```

Förväntat: alla tester gröna, `Test Suites: 1 passed`

- [ ] **Steg 5: Commit**

```bash
git add lib/stats/index.ts __tests__/lib/stats.test.ts
git commit -m "feat(stats): rena beräkningsfunktioner för statistik, leaderboard och insikter"
```

---

## Task 2: LogbokTabs — toppnavigering Logg|Statistik

**Files:**
- Create: `components/logbok/LogbokTabs.tsx`

- [ ] **Steg 1: Skapa komponenten**

Skapa `components/logbok/LogbokTabs.tsx`:

```typescript
'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { expedition } from '@/lib/theme/expeditionTokens';

interface Props {
  value: 'logg' | 'statistik';
  onChange: (v: 'logg' | 'statistik') => void;
}

export default function LogbokTabs({ value, onChange }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const activeColor = isLight ? expedition.forest : theme.palette.primary.main;

  return (
    <Box
      sx={{
        display: 'flex',
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
        bgcolor: isLight ? expedition.canvasWarm : 'background.default',
      }}
    >
      {(['logg', 'statistik'] as const).map((tab) => {
        const active = value === tab;
        return (
          <ButtonBase
            key={tab}
            onClick={() => onChange(tab)}
            sx={{
              flex: 1,
              py: 1.5,
              borderBottom: '2px solid',
              borderColor: active ? activeColor : 'transparent',
              color: active ? activeColor : 'text.secondary',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            <Typography
              sx={{
                fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                fontWeight: active ? 700 : 500,
                fontSize: '0.875rem',
                letterSpacing: '0.02em',
              }}
            >
              {tab === 'logg' ? 'Logg' : 'Statistik'}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
```

- [ ] **Steg 2: TypeScript-check**

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | grep -i "loggboktabs\|logboktabs" || echo "OK"
```

Förväntat: `OK`

- [ ] **Steg 3: Commit**

```bash
git add components/logbok/LogbokTabs.tsx
git commit -m "feat(logbok): LogbokTabs-komponent för Logg|Statistik-växling"
```

---

## Task 3: SeasonKpiRow — 3 KPI-kort

**Files:**
- Create: `components/stats/SeasonKpiRow.tsx`

- [ ] **Steg 1: Skapa komponenten**

Skapa `components/stats/SeasonKpiRow.tsx`:

```typescript
'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { PersonalStats } from '@/lib/stats/index';

interface Props {
  stats: PersonalStats;
}

export default function SeasonKpiRow({ stats }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const items = [
    { label: 'Fångster', value: String(stats.seasonCatchCount), sub: 'i år' },
    {
      label: 'Tyngsta',
      value: stats.heaviestCatch ? `${stats.heaviestCatch.weightKg} kg` : '–',
      sub: stats.heaviestCatch?.species ?? '',
    },
    { label: 'Toppbete', value: stats.topBait ?? '–', sub: 'flest fångster' },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 1, px: 2, pt: 2.5 }}>
      {items.map((item) => (
        <Box
          key={item.label}
          sx={{
            flex: 1,
            bgcolor: isLight ? '#fff' : 'background.paper',
            borderRadius: 2,
            p: 1.5,
            boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            border: isLight ? 'none' : '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            sx={{
              fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
              fontSize: '0.625rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'text.secondary',
              mb: 0.5,
            }}
          >
            {item.label}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-newsreader), Georgia, serif',
              fontWeight: 700,
              fontSize: '1.2rem',
              lineHeight: 1.1,
              color: 'text.primary',
              wordBreak: 'break-word',
            }}
          >
            {item.value}
          </Typography>
          {item.sub && (
            <Typography
              sx={{
                fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                fontSize: '0.7rem',
                color: 'text.secondary',
                mt: 0.25,
              }}
            >
              {item.sub}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}
```

- [ ] **Steg 2: TypeScript-check**

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | grep -i "seasonkpirow" || echo "OK"
```

Förväntat: `OK`

- [ ] **Steg 3: Commit**

```bash
git add components/stats/SeasonKpiRow.tsx
git commit -m "feat(stats): SeasonKpiRow med 3 KPI-kort"
```

---

## Task 4: SpeciesRecordList — rekord per art

**Files:**
- Create: `components/stats/SpeciesRecordList.tsx`

- [ ] **Steg 1: Skapa komponenten**

Skapa `components/stats/SpeciesRecordList.tsx`:

```typescript
'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';
import { ChevronDown } from 'lucide-react';
import type { SpeciesRecord } from '@/lib/stats/index';

interface Props {
  records: SpeciesRecord[];
}

export default function SpeciesRecordList({ records }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [showAll, setShowAll] = useState(false);

  const PAGE = 8;
  const visible = showAll ? records : records.slice(0, PAGE);

  if (records.length === 0) return null;

  return (
    <Box sx={{ px: 2, mt: 2.5 }}>
      <Typography
        sx={{
          fontFamily: 'var(--font-newsreader), Georgia, serif',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: 'text.primary',
          mb: 1,
        }}
      >
        Rekord per art
      </Typography>
      <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        {visible.map((rec, i) => (
          <Box
            key={rec.species}
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto auto',
              alignItems: 'center',
              gap: 2,
              px: 2,
              py: 1.25,
              bgcolor:
                i % 2 === 0
                  ? isLight ? '#fff' : 'background.paper'
                  : isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
              borderBottom: i < visible.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}
          >
            <Typography
              sx={{
                fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'text.primary',
              }}
            >
              {rec.species}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>
              {rec.count}×
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontFeatureSettings: '"tnum"' }}>
              {rec.heaviestKg} kg
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontFeatureSettings: '"tnum"' }}>
              {rec.longestCm} cm
            </Typography>
          </Box>
        ))}
      </Box>
      {records.length > PAGE && (
        <ButtonBase
          onClick={() => setShowAll((v) => !v)}
          sx={{
            mt: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            py: 0.75,
            color: 'text.secondary',
            fontSize: '0.8125rem',
            borderRadius: 1,
          }}
        >
          {showAll ? 'Visa färre' : `Visa ${records.length - PAGE} fler`}
          <ChevronDown
            size={16}
            style={{ transform: showAll ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          />
        </ButtonBase>
      )}
    </Box>
  );
}
```

- [ ] **Steg 2: TypeScript-check**

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | grep -i "speciesrecordlist" || echo "OK"
```

Förväntat: `OK`

- [ ] **Steg 3: Commit**

```bash
git add components/stats/SpeciesRecordList.tsx
git commit -m "feat(stats): SpeciesRecordList med rekord per art"
```

---

## Task 5: PatternInsightCards — mönsterinsikter

**Files:**
- Create: `components/stats/PatternInsightCards.tsx`

- [ ] **Steg 1: Skapa komponenten**

Skapa `components/stats/PatternInsightCards.tsx`:

```typescript
'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { Lightbulb } from 'lucide-react';
import { expedition } from '@/lib/theme/expeditionTokens';
import type { PatternInsight } from '@/lib/stats/index';

interface Props {
  insights: PatternInsight[];
}

export default function PatternInsightCards({ insights }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  return (
    <Box sx={{ px: 2, mt: 2.5 }}>
      <Typography
        sx={{
          fontFamily: 'var(--font-newsreader), Georgia, serif',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: 'text.primary',
          mb: 1,
        }}
      >
        Dina mönster
      </Typography>
      {insights.length === 0 ? (
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontFamily: 'var(--font-work), var(--font-sans), sans-serif' }}
        >
          Logga fler fångster för att se dina mönster.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {insights.map((insight) => (
            <Box
              key={insight.text}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                p: 1.75,
                borderRadius: 2,
                bgcolor: isLight ? 'rgba(27,48,34,0.06)' : 'rgba(169,208,175,0.08)',
              }}
            >
              <Lightbulb
                size={18}
                color={isLight ? expedition.forest : theme.palette.primary.main}
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              <Typography
                sx={{
                  fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  color: 'text.primary',
                }}
              >
                {insight.text}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
```

- [ ] **Steg 2: TypeScript-check**

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | grep -i "patterninsightcards" || echo "OK"
```

Förväntat: `OK`

- [ ] **Steg 3: Commit**

```bash
git add components/stats/PatternInsightCards.tsx
git commit -m "feat(stats): PatternInsightCards för mönsterinsikter"
```

---

## Task 6: ClubLeaderboard — topplista, klubbrekord, senaste stora

**Files:**
- Create: `components/stats/ClubLeaderboard.tsx`

- [ ] **Steg 1: Skapa komponenten**

Skapa `components/stats/ClubLeaderboard.tsx`:

```typescript
'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { alpha, useTheme } from '@mui/material/styles';
import { expedition } from '@/lib/theme/expeditionTokens';
import type { LeaderboardData } from '@/lib/stats/index';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface Props {
  data: LeaderboardData;
}

export default function ClubLeaderboard({ data }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  function sectionLabel(label: string) {
    return (
      <Typography
        sx={{
          fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
          fontSize: '0.625rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          mt: 2,
          mb: 0.75,
        }}
      >
        {label}
      </Typography>
    );
  }

  function rowBg(i: number) {
    return i % 2 === 0
      ? isLight ? '#fff' : 'background.paper'
      : isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)';
  }

  return (
    <Box sx={{ px: 2, mt: 3, pb: 2 }}>
      <Typography
        sx={{
          fontFamily: 'var(--font-newsreader), Georgia, serif',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: 'text.primary',
          mb: 0.5,
        }}
      >
        Klubben
      </Typography>

      {/* Säsongens topplista */}
      {sectionLabel('Säsongens topplista')}
      <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        {data.topList.length === 0 ? (
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Inga fångster registrerade i år.
            </Typography>
          </Box>
        ) : (
          data.topList.map((entry, i) => (
            <Box
              key={entry.userId}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.25,
                bgcolor: entry.isCurrentUser
                  ? isLight
                    ? alpha(expedition.forest, 0.07)
                    : alpha(theme.palette.primary.main, 0.12)
                  : rowBg(i),
                borderBottom: i < data.topList.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Typography
                sx={{
                  width: 24,
                  fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: entry.rank <= 3
                    ? isLight ? expedition.forest : 'primary.main'
                    : 'text.secondary',
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {entry.rank}
              </Typography>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  bgcolor: isLight ? 'rgba(27,48,34,0.1)' : 'rgba(255,255,255,0.1)',
                  color: 'text.primary',
                }}
              >
                {initials(entry.fullName)}
              </Avatar>
              <Typography
                sx={{
                  flex: 1,
                  fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: entry.isCurrentUser ? 700 : 500,
                  color: 'text.primary',
                }}
              >
                {entry.fullName.split(' ')[0]}
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {entry.count}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      {/* Klubbrekord per art */}
      {data.speciesRecords.length > 0 && (
        <>
          {sectionLabel('Klubbrekord per art')}
          <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            {data.speciesRecords.map((rec, i) => (
              <Box
                key={rec.species}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1.25,
                  bgcolor: rowBg(i),
                  borderBottom: i < data.speciesRecords.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Typography
                  sx={{
                    flex: 1,
                    fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'text.primary',
                  }}
                >
                  {rec.species}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-newsreader), Georgia, serif',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: isLight ? expedition.forest : 'primary.main',
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {rec.weightKg} kg
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    minWidth: 72,
                    textAlign: 'right',
                  }}
                >
                  {rec.fullName.split(' ')[0]}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}

      {/* Senaste stora */}
      {data.recentBig.length > 0 && (
        <>
          {sectionLabel('Senaste stora (30 dagar)')}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {data.recentBig.map((c) => (
              <Box
                key={`${c.caughtAt}-${c.fullName}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: isLight ? '#fff' : 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: 'text.primary',
                    }}
                  >
                    {c.fullName.split(' ')[0]} · {c.species}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                      mt: 0.25,
                    }}
                  >
                    {new Date(c.caughtAt).toLocaleDateString('sv-SE', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-newsreader), Georgia, serif',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    color: isLight ? expedition.forest : 'primary.main',
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {c.weightKg} kg
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
```

- [ ] **Steg 2: TypeScript-check**

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | grep -i "clubleaderboard" || echo "OK"
```

Förväntat: `OK`

- [ ] **Steg 3: Commit**

```bash
git add components/stats/ClubLeaderboard.tsx
git commit -m "feat(stats): ClubLeaderboard med topplista, rekord och senaste stora"
```

---

## Task 7: StatistikView + trädning i LogbokPage

**Files:**
- Create: `components/logbok/StatistikView.tsx`
- Modify: `app/(app)/logbok/page.tsx`

- [ ] **Steg 1: Skapa StatistikView**

Skapa `components/logbok/StatistikView.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import { expedition } from '@/lib/theme/expeditionTokens';
import { fetchMyCatches, fetchClubCatches } from '@/lib/supabase/catches';
import {
  computePersonalStats,
  computePatternInsights,
  computeLeaderboard,
} from '@/lib/stats/index';
import SeasonKpiRow from '@/components/stats/SeasonKpiRow';
import SpeciesRecordList from '@/components/stats/SpeciesRecordList';
import PatternInsightCards from '@/components/stats/PatternInsightCards';
import ClubLeaderboard from '@/components/stats/ClubLeaderboard';
import type { Catch } from '@/types/catch';

interface Props {
  userId: string;
  clubId: string | undefined;
}

export default function StatistikView({ userId, clubId }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [personalCatches, setPersonalCatches] = useState<Catch[] | null>(null);
  const [clubCatches, setClubCatches] = useState<Catch[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const [mine, club] = await Promise.all([
        fetchMyCatches(userId),
        clubId ? fetchClubCatches(clubId) : Promise.resolve([]),
      ]);
      setPersonalCatches(mine);
      setClubCatches(club);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!userId) return;
    load();
  }, [userId, clubId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6, flex: 1, minHeight: 0 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ px: 2, pt: 3, flex: 1, minHeight: 0 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={load}>
              Försök igen
            </Button>
          }
        >
          Kunde inte ladda statistik.
        </Alert>
      </Box>
    );
  }

  const catches = personalCatches ?? [];
  const club = clubCatches ?? [];
  const personalStats = computePersonalStats(catches);
  const insights = computePatternInsights(catches);
  const leaderboard = computeLeaderboard(club, userId);

  return (
    <Box
      sx={{
        overflowY: 'auto',
        flex: 1,
        minHeight: 0,
        pb: 4,
        bgcolor: isLight ? expedition.canvasWarm : 'background.default',
      }}
    >
      <SeasonKpiRow stats={personalStats} />
      <SpeciesRecordList records={personalStats.speciesRecords} />
      <PatternInsightCards insights={insights} />
      {clubId && <ClubLeaderboard data={leaderboard} />}
    </Box>
  );
}
```

- [ ] **Steg 2: Uppdatera LogbokPage**

Ersätt hela `app/(app)/logbok/page.tsx` med:

```typescript
// app/(app)/logbok/page.tsx
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { createClient } from '@/lib/supabase/client';
import { useClub } from '@/contexts/ClubContext';
import { fetchMyCatches, fetchClubCatches } from '@/lib/supabase/catches';
import CatchList from '@/components/catch/CatchList';
import EditorialShellHeader from '@/components/layout/EditorialShellHeader';
import LogbokTabs from '@/components/logbok/LogbokTabs';
import LogbokSegmentControl from '@/components/logbok/LogbokSegmentControl';
import SpeciesFilterChips from '@/components/logbok/SpeciesFilterChips';
import DualCatchFab from '@/components/logbok/DualCatchFab';
import StatistikView from '@/components/logbok/StatistikView';
import { expedition } from '@/lib/theme/expeditionTokens';
import type { Catch } from '@/types/catch';

function LogbokContent() {
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const { isReady, activeClub } = useClub();
  const [view, setView] = useState<'logg' | 'statistik'>(
    searchParams.get('view') === 'statistik' ? 'statistik' : 'logg',
  );
  const [tab, setTab] = useState(0);
  const [speciesFilter, setSpeciesFilter] = useState<string | null>(null);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) setUserId(data.user.id);
      });
  }, []);

  useEffect(() => {
    setSpeciesFilter(null);
  }, [tab]);

  useEffect(() => {
    if (!userId || !isReady || view !== 'logg') return;
    if (tab === 1 && !activeClub) {
      setCatches([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const load = tab === 0 ? fetchMyCatches(userId) : fetchClubCatches(activeClub!.id);
    load
      .then((data) => setCatches(data))
      .catch(() => setCatches([]))
      .finally(() => setIsLoading(false));
  }, [tab, userId, isReady, activeClub?.id, view]);

  const speciesOptions = useMemo(() => {
    const set = new Set(catches.map((c) => c.species.trim()).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b, 'sv'));
  }, [catches]);

  const filteredCatches = useMemo(() => {
    if (!speciesFilter) return catches;
    return catches.filter((c) => c.species === speciesFilter);
  }, [catches, speciesFilter]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        bgcolor: isLight ? expedition.canvasWarm : 'background.default',
      }}
    >
      <EditorialShellHeader />
      <LogbokTabs value={view} onChange={setView} />
      {view === 'logg' ? (
        <>
          <LogbokSegmentControl value={tab} onChange={setTab} />
          <SpeciesFilterChips
            species={speciesOptions}
            active={speciesFilter}
            onChange={setSpeciesFilter}
          />
          <CatchList catches={filteredCatches} isLoading={isLoading} cardVariant="logbook" />
        </>
      ) : (
        <StatistikView userId={userId} clubId={activeClub?.id} />
      )}
      <DualCatchFab />
    </Box>
  );
}

export default function LogbokPage() {
  return (
    <Suspense>
      <LogbokContent />
    </Suspense>
  );
}
```

- [ ] **Steg 3: TypeScript-check**

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS|statistikview|logboktabs" || echo "OK"
```

Förväntat: `OK`

- [ ] **Steg 4: Kör alla tester**

```bash
npx jest --no-coverage 2>&1 | tail -10
```

Förväntat: alla befintliga tester fortfarande gröna

- [ ] **Steg 5: Commit**

```bash
git add components/logbok/StatistikView.tsx app/(app)/logbok/page.tsx
git commit -m "feat(logbok): Statistik-flik med personlig statistik och klubbleaderboard"
```

---

## Task 8: HomeInsightCard + trädning i HemPage

**Files:**
- Create: `components/home/HomeInsightCard.tsx`
- Modify: `app/(app)/hem/page.tsx`

- [ ] **Steg 1: Skapa HomeInsightCard**

Skapa `components/home/HomeInsightCard.tsx`:

```typescript
'use client';

import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';
import { Fish } from 'lucide-react';
import { expedition } from '@/lib/theme/expeditionTokens';
import { computeHomeInsight } from '@/lib/stats/index';
import type { Catch } from '@/types/catch';

interface Props {
  catches: Catch[];
}

export default function HomeInsightCard({ catches }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const router = useRouter();

  const insight = computeHomeInsight(catches, new Date());
  if (!insight) return null;

  const sentences: string[] = [];
  if (insight.timeLabel && insight.monthLabel) {
    sentences.push(
      `Du fångar mest ${insight.species.toLowerCase()} ${insight.timeLabel} i ${insight.monthLabel} — precis som nu.`,
    );
  } else if (insight.timeLabel) {
    sentences.push(
      `Du fångar mest ${insight.species.toLowerCase()} ${insight.timeLabel} — precis som nu.`,
    );
  } else if (insight.monthLabel) {
    const m = insight.monthLabel.charAt(0).toUpperCase() + insight.monthLabel.slice(1);
    sentences.push(`${m} är din bästa månad för ${insight.species.toLowerCase()}.`);
  }
  if (insight.topBait) sentences.push(`Bete: ${insight.topBait}.`);

  return (
    <Box sx={{ px: 2, mt: 2 }}>
      <ButtonBase
        onClick={() => router.push('/logbok?view=statistik')}
        sx={{ display: 'block', width: '100%', textAlign: 'left', borderRadius: '16px' }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            p: 2,
            borderRadius: '16px',
            bgcolor: isLight ? expedition.tanChip : 'rgba(169,208,175,0.1)',
            border: '1px solid',
            borderColor: isLight ? 'rgba(27,48,34,0.1)' : 'rgba(169,208,175,0.15)',
          }}
        >
          <Fish
            size={20}
            color={isLight ? expedition.forest : theme.palette.primary.main}
            style={{ flexShrink: 0, marginTop: 2 }}
          />
          <Box>
            <Typography
              sx={{
                fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                fontWeight: 700,
                fontSize: '0.875rem',
                color: isLight ? expedition.forest : 'primary.main',
                mb: 0.25,
              }}
            >
              Bra förutsättningar för {insight.species.toLowerCase()}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                fontSize: '0.8125rem',
                lineHeight: 1.5,
                color: 'text.secondary',
              }}
            >
              {sentences.join(' ')}
            </Typography>
          </Box>
        </Box>
      </ButtonBase>
    </Box>
  );
}
```

- [ ] **Steg 2: Lägg till HomeInsightCard i HemPage**

I `app/(app)/hem/page.tsx`, lägg till importen och komponenten. Hitta raden med `<HemHero firstName={firstName} />` och lägg till insiktskortet direkt efter:

Lägg till import-raden med de övriga home-imports (efter `import HemHero from '@/components/home/HemHero';`):

```typescript
import HomeInsightCard from '@/components/home/HomeInsightCard';
```

Och i JSX, direkt efter `<HemHero firstName={firstName} />`:

```typescript
<HomeInsightCard catches={myCatches} />
```

- [ ] **Steg 3: TypeScript-check**

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS|homeinsightcard" || echo "OK"
```

Förväntat: `OK`

- [ ] **Steg 4: Kör alla tester**

```bash
npx jest --no-coverage 2>&1 | tail -10
```

Förväntat: alla tester gröna

- [ ] **Steg 5: Commit och push**

```bash
git add components/home/HomeInsightCard.tsx app/(app)/hem/page.tsx
git commit -m "feat(hem): HomeInsightCard med kontextuell mönsterinsikt"
git push origin main
```

---

## Verifiering när alla tasks är klara

Kör hela testsviten:

```bash
npx jest --no-coverage 2>&1 | tail -15
```

Förväntat: alla test suites gröna, inga nya fel.

TypeScript:

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | head -20
```

Förväntat: ingen output (inga fel).
