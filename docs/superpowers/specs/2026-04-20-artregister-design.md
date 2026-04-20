# Design: Artregister

**Datum:** 2026-04-20

## Bakgrund

Registreringsformuläret har ett fritt textfält för art, vilket leder till skräpdata (stavfel, skämt, osv). En klubbmedlem efterfrågade en lista med faktiska arter. Lösningen är ett artregister med en global baslista och möjlighet för klubbmedlemmar att lägga till egna arter, kombinerat med ett autocomplete-fält i registreringsformuläret.

## Mål

- Förhindra skräpdata i artfältet
- Inte tvinga användare att scrolla igenom en gigantisk lista
- Tillåta alla klubbmedlemmar att lägga till nya arter
- Hålla globala arter enkel att underhålla (i kod)

## Arkitektur

### Datakällor

**Globala arter** — hårdkodade i `lib/speciesLatin.ts` (10 arter idag: Abborre, Gädda, Gös, Öring, Regnbåge, Harr, Mört, Sik, Lax, Torsk). Inga DB-förändringar för dessa.

**Klubbspecifika arter** — ny Supabase-tabell `club_species`. Varje rad tillhör en klubb och skapades av en specifik användare.

### DB-schema

```sql
CREATE TABLE club_species (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id    uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name       text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (club_id, lower(name))
);

ALTER TABLE club_species ENABLE ROW LEVEL SECURITY;

-- Läsa: alla inloggade användare i klubben
CREATE POLICY "Klubbmedlemmar kan läsa artlistan"
  ON club_species FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.club_id = club_species.club_id
        AND club_members.user_id = auth.uid()
    )
  );

-- Skriva: alla inloggade klubbmedlemmar
CREATE POLICY "Klubbmedlemmar kan lägga till arter"
  ON club_species FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.club_id = club_species.club_id
        AND club_members.user_id = auth.uid()
    )
  );

-- Ta bort: den som skapade arten (eller admin, ej implementerat nu)
CREATE POLICY "Skaparen kan ta bort arten"
  ON club_species FOR DELETE
  USING (created_by = auth.uid());
```

### Ny fil: `lib/supabase/species.ts`

Exponerar:
- `fetchClubSpecies(clubId: string): Promise<ClubSpecies[]>` — hämtar klubbens egna arter
- `insertClubSpecies(clubId: string, name: string, userId: string): Promise<void>` — lägger till ny art
- `deleteClubSpecies(id: string): Promise<void>` — tar bort en art

### Ny typ: `types/species.ts`

```ts
export interface ClubSpecies {
  id: string;
  club_id: string;
  name: string;
  created_by: string;
  created_at: string;
}
```

### Hjälpfunktion: `lib/species.ts`

```ts
import { GLOBAL_SPECIES } from './speciesLatin'; // ny export
import type { ClubSpecies } from '@/types/species';

export function allSpeciesNames(clubSpecies: ClubSpecies[]): string[] {
  const clubNames = clubSpecies.map((s) => s.name);
  return [...new Set([...GLOBAL_SPECIES, ...clubNames])].sort((a, b) =>
    a.localeCompare(b, 'sv')
  );
}
```

---

## Komponenter och sidor

### Ny sida: `app/(app)/artregister/page.tsx`

**Innehåll:**
- Header: "Artregister" + aktivt klubbnamn (samma mönster som andra sidor)
- **Global-sektion:** lista med de 10 globala arterna, badge "Global" bredvid varje, read-only
- **Klubbsektion:** klubbens egna arter, varje rad har en ta-bort-knapp (visas bara för den som lade till arten)
- **Lägg till-formulär:** `TextField` + "Lägg till"-knapp. Validering: tom sträng och befintligt namn (case-insensitive) blockeras med inline-felmeddelande. Vid lyckat tillägg töms fältet och den nya arten visas i listan.
- Om ingen aktiv klubb: visar feltext med länk till `/klubb`

### Ändrad komponent: `app/(app)/logbok/ny/page.tsx`

- Ersätt `TextField` för "Art" med ny komponent `SpeciesAutocomplete`

### Ny komponent: `components/logbok/SpeciesAutocomplete.tsx`

- MUI `Autocomplete` med `freeSolo={false}` (tvingar val ur listan)
- Options: `allSpeciesNames(clubSpecies)` — kombinerat och sorterat
- Hämtar `clubSpecies` via `fetchClubSpecies` vid mount (samma pattern som väder-fetch i formuläret)
- Footer i dropdown: "Saknas din art? Lägg till den →" (navigerar till `/artregister`)
- Props: `value: string`, `onChange: (v: string) => void`

### Navigation

Lägg till "Artregister" i bottom nav med lämplig ikon (t.ex. `Fish` från lucide-react). Placering: femte position.

---

## Felhantering

| Scenario | Beteende |
|----------|----------|
| Supabase-fel vid hämtning | Visar tom klubblista, globala arter fortfarande tillgängliga |
| Supabase-fel vid tillägg | Snackbar: "Kunde inte lägga till arten. Försök igen." |
| Dublett (samma namn) | Inline-fel under textfältet: "Den här arten finns redan i listan" |
| Ingen aktiv klubb | Informationstext med länk till klubbsidan |

---

## Vad ändras inte

- `speciesLatin.ts` — befintliga `scientificNameForSpecies`-funktionen berörs ej
- `types/catch.ts` — `species: string` förblir en sträng (ingen FK till species-tabellen)
- Befintliga fångster med fritt inskriven art påverkas ej
- Ingen admin-roll för artkuration (alla medlemmar lika)
