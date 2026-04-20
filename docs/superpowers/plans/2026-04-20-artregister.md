# Artregister Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ersätt det fria artfältet i registreringsformuläret med ett artregister — en global baslista + klubbspecifika tillägg — och exponera en `/artregister`-sida för hantering.

**Architecture:** Globala arter är hårdkodade i `lib/speciesLatin.ts`. Klubbspecifika arter lagras i Supabase-tabellen `club_species`. En ny hjälpfunktion `allSpeciesNames` kombinerar båda källorna till en sorterad lista som används i ett MUI Autocomplete-fält i registreringsformuläret. En dedikerad sida `/artregister` visar hela listan och låter klubbmedlemmar lägga till och ta bort egna arter.

**Tech Stack:** Next.js (App Router), React, TypeScript, MUI v5, Supabase (PostgreSQL + RLS), Jest + React Testing Library

---

### Task 1: DB-migration + typdefinition

**Files:**
- Create: `supabase/migrations/20260420120000_club_species.sql`
- Create: `types/species.ts`

- [ ] **Step 1: Skapa migrationsfilen**

Skapa filen `supabase/migrations/20260420120000_club_species.sql` med exakt detta innehåll:

```sql
-- club_species: klubbspecifika fiskar utöver den globala baslistan
create table if not exists public.club_species (
  id         uuid primary key default gen_random_uuid(),
  club_id    uuid not null references public.clubs(id) on delete cascade,
  name       text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (club_id, lower(name))
);

alter table public.club_species enable row level security;

-- Alla klubbmedlemmar kan läsa
create policy "club_species_select"
  on public.club_species for select
  using (
    exists (
      select 1 from public.club_members
      where club_members.club_id = club_species.club_id
        and club_members.user_id = auth.uid()
    )
  );

-- Alla klubbmedlemmar kan lägga till
create policy "club_species_insert"
  on public.club_species for insert
  with check (
    auth.uid() = created_by
    and exists (
      select 1 from public.club_members
      where club_members.club_id = club_species.club_id
        and club_members.user_id = auth.uid()
    )
  );

-- Bara skaparen kan ta bort
create policy "club_species_delete"
  on public.club_species for delete
  using (created_by = auth.uid());
```

- [ ] **Step 2: Kör migrationen mot Supabase**

```bash
cd /home/albin/Documents/Skitfiske && npx supabase db push
```

Förväntat: `Applied 1 migration` (eller liknande). Om du inte har Supabase CLI lokalt kör du SQL direkt i Supabase-dashboarden (SQL Editor).

- [ ] **Step 3: Skapa typdefinitionen**

Skapa `types/species.ts`:

```ts
// types/species.ts
export interface ClubSpecies {
  id: string;
  club_id: string;
  name: string;
  created_by: string;
  created_at: string;
}
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260420120000_club_species.sql types/species.ts
git commit -m "feat(artregister): DB-migration club_species + typ"
```

---

### Task 2: GLOBAL_SPECIES-export + lib/species.ts + tester

**Files:**
- Modify: `lib/speciesLatin.ts`
- Create: `lib/species.ts`
- Create: `__tests__/lib/species.test.ts`

- [ ] **Step 1: Skriv det failande testet**

Skapa `__tests__/lib/species.test.ts`:

```ts
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
    // Å kommer före Ö i svenska alfabetet (Å, Ä, Ö)
    const indexAl = result.indexOf('Ål');
    const indexOs = result.indexOf('Öring');
    expect(indexAl).toBeLessThan(indexOs);
  });
});
```

- [ ] **Step 2: Kör testet och bekräfta att det misslyckas**

```bash
npx jest __tests__/lib/species.test.ts --no-coverage
```

Förväntat: FAIL — `Cannot find module '@/lib/species'`

- [ ] **Step 3: Lägg till GLOBAL_SPECIES-export i speciesLatin.ts**

Öppna `lib/speciesLatin.ts`. Nuvarande innehåll:

```ts
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
```

Lägg till en rad i slutet av filen:

```ts
/** Exporterad lista med globala artnamn för autocomplete och artregister. */
export const GLOBAL_SPECIES: string[] = Object.keys(LATIN);
```

- [ ] **Step 4: Skapa lib/species.ts**

Skapa `lib/species.ts`:

```ts
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
```

- [ ] **Step 5: Kör testet och bekräfta att det går igenom**

```bash
npx jest __tests__/lib/species.test.ts --no-coverage
```

Förväntat: 4 tests pass.

- [ ] **Step 6: Kör hela testsviten**

```bash
npx jest --no-coverage
```

Förväntat: alla befintliga tests + de nya 4 passerar.

- [ ] **Step 7: Commit**

```bash
git add lib/speciesLatin.ts lib/species.ts __tests__/lib/species.test.ts
git commit -m "feat(artregister): GLOBAL_SPECIES-export + allSpeciesNames + tester"
```

---

### Task 3: lib/supabase/species.ts

**Files:**
- Create: `lib/supabase/species.ts`

- [ ] **Step 1: Skapa filen**

Skapa `lib/supabase/species.ts`. Följ exakt samma mönster som `lib/supabase/catches.ts` (thin wrapper kring Supabase-klienten):

```ts
// lib/supabase/species.ts
import { createClient } from '@/lib/supabase/client';
import type { ClubSpecies } from '@/types/species';

/** Hämtar alla klubbspecifika arter för en given klubb. */
export async function fetchClubSpecies(clubId: string): Promise<ClubSpecies[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('club_species')
    .select('*')
    .eq('club_id', clubId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Lägger till en ny art i klubbens lista. */
export async function insertClubSpecies(
  clubId: string,
  name: string,
  userId: string,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('club_species')
    .insert({ club_id: clubId, name: name.trim(), created_by: userId });
  if (error) throw error;
}

/** Tar bort en art (RLS kontrollerar att det är skaparen som tar bort). */
export async function deleteClubSpecies(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('club_species')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/supabase/species.ts
git commit -m "feat(artregister): supabase-funktioner för club_species"
```

---

### Task 4: Artregistersidan

**Files:**
- Create: `app/(app)/artregister/page.tsx`

- [ ] **Step 1: Skapa sidan**

Skapa `app/(app)/artregister/page.tsx`:

```tsx
// app/(app)/artregister/page.tsx
'use client';

import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useClub } from '@/contexts/ClubContext';
import { createClient } from '@/lib/supabase/client';
import { fetchClubSpecies, insertClubSpecies, deleteClubSpecies } from '@/lib/supabase/species';
import { GLOBAL_SPECIES } from '@/lib/speciesLatin';
import { stickyBarSurfaceSx, formFieldReadableSx } from '@/lib/appChrome';
import type { ClubSpecies } from '@/types/species';

export default function ArtregisterPage() {
  const router = useRouter();
  const { activeClub } = useClub();
  const [clubSpecies, setClubSpecies] = useState<ClubSpecies[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!activeClub) return;
    fetchClubSpecies(activeClub.id)
      .then(setClubSpecies)
      .catch(() => setClubSpecies([]));
  }, [activeClub]);

  async function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed || !activeClub || !currentUserId) return;

    const exists = [
      ...GLOBAL_SPECIES,
      ...clubSpecies.map((s) => s.name),
    ].some((n) => n.toLowerCase() === trimmed.toLowerCase());

    if (exists) {
      setAddError('Den här arten finns redan i listan.');
      return;
    }

    setIsSaving(true);
    setAddError(null);
    try {
      await insertClubSpecies(activeClub.id, trimmed, currentUserId);
      const updated = await fetchClubSpecies(activeClub.id);
      setClubSpecies(updated);
      setNewName('');
    } catch {
      setSnackbar('Kunde inte lägga till arten. Försök igen.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteClubSpecies(id);
      setClubSpecies((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setSnackbar('Kunde inte ta bort arten. Försök igen.');
    }
  }

  return (
    <Box sx={{ pb: 10, minHeight: '100%', bgcolor: 'background.default', color: 'text.primary' }}>
      <Box
        sx={[
          stickyBarSurfaceSx,
          {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1,
            py: 1,
            color: 'text.primary',
            '& .MuiIconButton-root': { color: 'text.primary' },
          },
        ]}
      >
        <IconButton onClick={() => router.back()} aria-label="Tillbaka">
          <ArrowLeft size={24} />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ color: 'text.primary' }}>
            Artregister
          </Typography>
          {activeClub && (
            <Typography variant="caption" sx={{ color: 'text.primary', opacity: 0.75, display: 'block' }}>
              {activeClub.name}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ px: 2, pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {!activeClub && (
          <Typography variant="body2" sx={{ color: 'error.light' }}>
            <Link component={NextLink} href="/klubb" underline="always" sx={{ color: 'error.light', fontWeight: 600 }}>
              Skapa eller gå med i en klubb
            </Link>{' '}
            för att se och hantera artregistret.
          </Typography>
        )}

        {/* Globala arter */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 700, letterSpacing: '0.04em', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            Globala arter
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {[...GLOBAL_SPECIES].sort((a, b) => a.localeCompare(b, 'sv')).map((name) => (
              <Chip
                key={name}
                label={name}
                size="small"
                sx={{ bgcolor: 'action.selected', color: 'text.primary' }}
              />
            ))}
          </Box>
        </Box>

        {/* Klubbens egna arter */}
        {activeClub && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 700, letterSpacing: '0.04em', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              {activeClub.name}s arter
            </Typography>
            {clubSpecies.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Inga egna arter ännu.
              </Typography>
            ) : (
              <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                {clubSpecies.map((s, i) => (
                  <Box
                    key={s.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      py: 1.25,
                      bgcolor: i % 2 === 0 ? 'background.paper' : 'rgba(255,255,255,0.02)',
                      borderBottom: i < clubSpecies.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ flex: 1, fontSize: '0.9rem', color: 'text.primary' }}>
                      {s.name}
                    </Typography>
                    {s.created_by === currentUserId && (
                      <IconButton
                        size="small"
                        aria-label={`Ta bort ${s.name}`}
                        onClick={() => handleDelete(s.id)}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'error.light' } }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Lägg till ny art */}
        {activeClub && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.04em', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Lägg till art
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Artnamn"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setAddError(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                fullWidth
                error={Boolean(addError)}
                helperText={addError}
                sx={formFieldReadableSx}
              />
              <Button
                variant="contained"
                onClick={handleAdd}
                disabled={!newName.trim() || isSaving}
                sx={{
                  flexShrink: 0,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.light' },
                  '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
                }}
              >
                {isSaving ? <CircularProgress size={20} sx={{ color: 'primary.contrastText' }} /> : 'Lägg till'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={6000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(app)/artregister/page.tsx
git commit -m "feat(artregister): artregistersida med global + klubbspecifika arter"
```

---

### Task 5: SpeciesAutocomplete + uppdatera registreringsformuläret

**Files:**
- Create: `components/logbok/SpeciesAutocomplete.tsx`
- Modify: `app/(app)/logbok/ny/page.tsx`

- [ ] **Step 1: Skapa SpeciesAutocomplete**

Skapa `components/logbok/SpeciesAutocomplete.tsx`:

```tsx
// components/logbok/SpeciesAutocomplete.tsx
'use client';

import { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import NextLink from 'next/link';
import { fetchClubSpecies } from '@/lib/supabase/species';
import { allSpeciesNames } from '@/lib/species';
import { formFieldReadableSx } from '@/lib/appChrome';

interface Props {
  value: string;
  onChange: (v: string) => void;
  clubId: string | null;
}

export default function SpeciesAutocomplete({ value, onChange, clubId }: Props) {
  const [options, setOptions] = useState<string[]>(() => allSpeciesNames([]));

  useEffect(() => {
    if (!clubId) {
      setOptions(allSpeciesNames([]));
      return;
    }
    fetchClubSpecies(clubId)
      .then((cs) => setOptions(allSpeciesNames(cs)))
      .catch(() => setOptions(allSpeciesNames([])));
  }, [clubId]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Autocomplete
        options={options}
        value={value || null}
        onChange={(_, v) => onChange(v ?? '')}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Art *"
            fullWidth
            sx={formFieldReadableSx}
          />
        )}
        noOptionsText="Ingen art hittades"
        sx={{
          '& .MuiAutocomplete-popupIndicator': { color: 'text.secondary' },
          '& .MuiAutocomplete-clearIndicator': { color: 'text.secondary' },
        }}
      />
      <Typography variant="caption" sx={{ color: 'text.secondary', pl: 0.25 }}>
        <Link
          component={NextLink}
          href="/artregister"
          underline="always"
          sx={{ color: 'primary.light' }}
        >
          Saknas din art? Lägg till den →
        </Link>
      </Typography>
    </Box>
  );
}
```

- [ ] **Step 2: Uppdatera registreringsformuläret**

Öppna `app/(app)/logbok/ny/page.tsx`.

Lägg till import av `SpeciesAutocomplete` efter befintliga imports:

```tsx
import SpeciesAutocomplete from '@/components/logbok/SpeciesAutocomplete';
```

Hitta och ersätt detta block (runt rad 236–242):

```tsx
// Var:
<TextField
  label="Art *"
  value={species}
  onChange={(e) => setSpecies(e.target.value)}
  fullWidth
  sx={formFieldReadableSx}
/>

// Ändra till:
<SpeciesAutocomplete
  value={species}
  onChange={setSpecies}
  clubId={activeClub?.id ?? null}
/>
```

- [ ] **Step 3: Kör testsviten**

```bash
npx jest --no-coverage
```

Förväntat: alla tester passerar.

- [ ] **Step 4: Commit**

```bash
git add components/logbok/SpeciesAutocomplete.tsx app/(app)/logbok/ny/page.tsx
git commit -m "feat(artregister): SpeciesAutocomplete i registreringsformuläret"
```

---

### Task 6: Lägg till artregister i BottomNav

**Files:**
- Modify: `components/navigation/BottomNav.tsx`

- [ ] **Step 1: Uppdatera navItems**

Öppna `components/navigation/BottomNav.tsx`.

Ändra rad 6 (import av lucide-ikoner) och rad 8–13 (`navItems`):

```tsx
// Var:
import { Home, MessageCircle, MapPin, BookOpen } from 'lucide-react';

const navItems = [
  { label: 'Hem', icon: Home, route: '/hem' },
  { label: 'Chatt', icon: MessageCircle, route: '/chatt' },
  { label: 'Karta', icon: MapPin, route: '/karta' },
  { label: 'Logbok', icon: BookOpen, route: '/logbok' },
] as const;

// Ändra till:
import { Home, MessageCircle, MapPin, BookOpen, Fish } from 'lucide-react';

const navItems = [
  { label: 'Hem', icon: Home, route: '/hem' },
  { label: 'Chatt', icon: MessageCircle, route: '/chatt' },
  { label: 'Karta', icon: MapPin, route: '/karta' },
  { label: 'Logbok', icon: BookOpen, route: '/logbok' },
  { label: 'Arter', icon: Fish, route: '/artregister' },
] as const;
```

- [ ] **Step 2: Kör testsviten**

```bash
npx jest --no-coverage
```

Förväntat: alla tester passerar.

- [ ] **Step 3: Commit**

```bash
git add components/navigation/BottomNav.tsx
git commit -m "feat(artregister): lägg till Arter i bottom nav"
```
