// lib/species.ts
import { GLOBAL_SPECIES } from '@/lib/speciesLatin';
import type { ClubSpecies } from '@/types/species';

/** Kombinerar globala arter med klubbens egna, deduplicerar och sorterar (sv-SE). */
export function allSpeciesNames(clubSpecies: ClubSpecies[]): string[] {
  const clubNames = clubSpecies.map((s) => s.name);
  return [...new Set([...GLOBAL_SPECIES, ...clubNames])].sort((a, b) =>
    a.localeCompare(b, 'sv')
  );
}
