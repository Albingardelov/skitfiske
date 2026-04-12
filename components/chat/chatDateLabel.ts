/** Rubrik mellan meddelanden (t.ex. IDAG / IGÅR). */
export function dayDividerLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startMsg = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayMs = 86400000;

  if (startMsg === startToday) return 'IDAG';
  if (startMsg === startToday - dayMs) return 'IGÅR';

  return d
    .toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' })
    .replace(/\./g, '')
    .toUpperCase();
}

export function isSameCalendarDay(aIso: string, bIso: string): boolean {
  const a = new Date(aIso);
  const b = new Date(bIso);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
