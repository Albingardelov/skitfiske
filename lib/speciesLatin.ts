/** Vanliga svenska sportfiskar → vetenskapligt namn (mockup: kursiv latin i kort). */
const LATIN: Record<string, string> = {
  Abborre: 'Perca fluviatilis',
  Gädda: 'Esox lucius',
  'Gös': 'Stizostedion lucioperca',
  Öring: 'Salmo trutta',
  Regnbåge: 'Oncorhynchus mykiss',
  Harr: 'Thymallus thymallus',
  Mört: 'Rutilus rutilus',
  Sik: 'Coregonus lavaretus',
  Lax: 'Salmo salar',
  Torsk: 'Gadus morhua',
};

export function scientificNameForSpecies(species: string): string | null {
  const key = species.trim();
  return LATIN[key] ?? null;
}

/** Exporterad lista med globala artnamn för autocomplete och artregister. */
export const GLOBAL_SPECIES: string[] = Object.keys(LATIN);
