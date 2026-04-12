import type { Catch } from '@/types/catch';

/** Jämför fångster senaste 30 dagar mot föregående 30 dagar (för trendtext på hem). */
export function monthOverMonthTrendLabel(catches: Catch[]): string | null {
  if (catches.length === 0) return null;
  const now = Date.now();
  const ms30 = 30 * 24 * 60 * 60 * 1000;
  const startRecent = now - ms30;
  const startPrev = now - 2 * ms30;

  const recent = catches.filter((c) => new Date(c.caught_at).getTime() >= startRecent).length;
  const prev = catches.filter((c) => {
    const t = new Date(c.caught_at).getTime();
    return t >= startPrev && t < startRecent;
  }).length;

  if (recent === 0 && prev === 0) return null;
  if (prev === 0 && recent > 0) return `+${recent} senaste månaden`;
  const pct = Math.round(((recent - prev) / prev) * 100);
  if (pct === 0) return 'Oförändrat mot förra månaden';
  return `${pct > 0 ? '+' : ''}${pct}% mot förra månaden`;
}

export function heaviestCatch(catches: Catch[]): Catch | null {
  if (catches.length === 0) return null;
  return catches.reduce((a, b) => (a.weight_kg >= b.weight_kg ? a : b));
}
