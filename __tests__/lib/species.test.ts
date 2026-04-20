// __tests__/lib/species.test.ts
import { allSpeciesNames } from '@/lib/species';
import type { ClubSpecies } from '@/types/species';

function makeClubSpecies(name: string): ClubSpecies {
  return {
    id: '1',
    club_id: 'club1',
    name,
    created_by: 'user1',
    created_at: '2026-04-20T00:00:00Z',
  };
}

describe('allSpeciesNames', () => {
  it('inkluderar globala arter', () => {
    const result = allSpeciesNames([]);
    expect(result).toContain('Abborre');
    expect(result).toContain('Gädda');
  });

  it('inkluderar klubbspecifika arter', () => {
    const result = allSpeciesNames([makeClubSpecies('Havsabborre')]);
    expect(result).toContain('Havsabborre');
  });

  it('returnerar inga dubletter', () => {
    // Abborre finns i globala listan — lägg till igen som klubbart
    const result = allSpeciesNames([makeClubSpecies('Abborre')]);
    expect(result.filter((s) => s === 'Abborre')).toHaveLength(1);
  });

  it('sorterar alfabetiskt (sv-SE)', () => {
    const result = allSpeciesNames([makeClubSpecies('Ål')]);
    // Ål ska sorteras före Ö i sv-SE (Å kommer innan Ö i svenska alfabetet)
    const indexAl = result.indexOf('Ål');
    const indexOs = result.indexOf('Öring');
    expect(indexAl).toBeLessThan(indexOs);
  });
});
