const formatter = new Intl.NumberFormat('sv-SE', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatWeightG(kg: number): string {
  return `${formatter.format(kg * 1000)} g`;
}
