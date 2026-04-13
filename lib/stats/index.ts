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

const INSIGHT_THRESHOLD = 5;

function getTimeBlock(isoDate: string): TimeBlock {
  const hour = new Date(isoDate).getUTCHours();
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
  const insights: PatternInsight[] = [];

  const bySpecies = new Map<string, Catch[]>();
  for (const c of catches) {
    const arr = bySpecies.get(c.species) ?? [];
    arr.push(c);
    bySpecies.set(c.species, arr);
  }

  const qualified = [...bySpecies.entries()]
    .filter(([, cs]) => cs.length >= INSIGHT_THRESHOLD)
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
      if (topCount >= 2 * secondCount) {
        const ratio = Math.floor(topCount / secondCount);
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
  const currentHour = now.getUTCHours();
  const currentMonth = now.getUTCMonth();

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
    .filter(([, cs]) => cs.length >= INSIGHT_THRESHOLD)
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
    const m = new Date(c.caught_at).getUTCMonth();
    monthCounts.set(m, (monthCounts.get(m) ?? 0) + 1);
  }
  const bestMonth = topKey(monthCounts);
  const monthMatches = bestMonth !== null && (
    Math.abs(bestMonth - currentMonth) <= 1 ||
    Math.abs(bestMonth - currentMonth) >= 11
  );
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
