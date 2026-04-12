// lib/weather/format.ts
export function formatTempSv(celsius: number): string {
  return `${new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 1 }).format(celsius)} °C`;
}

export function weatherSummarySv(parts: {
  sea: number | null;
  air: number | null;
}): string | null {
  const bits: string[] = [];
  if (parts.sea != null) bits.push(`Yta (modell) ${formatTempSv(parts.sea)}`);
  if (parts.air != null) bits.push(`Luft ${formatTempSv(parts.air)}`);
  return bits.length ? bits.join(' · ') : null;
}
