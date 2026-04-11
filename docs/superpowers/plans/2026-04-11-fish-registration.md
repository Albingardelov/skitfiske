# Phase 3: Fish Registration (Logbok) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/logbok` placeholder with a full fish registration feature — log catches with species, weight, length, date, optional GPS location and photo, and view all catches in a tabbed list.

**Architecture:** Two pages: `/logbok` (tabbed list with FAB) and `/logbok/ny` (registration form). Two reusable components (`CatchCard`, `CatchList`) handle the list UI. DB queries are isolated in `lib/supabase/catches.ts`. TypeScript types live in `types/catch.ts`.

**Tech Stack:** Next.js 16, TypeScript, MUI v9, @supabase/ssr, Supabase Storage, Lucide React, Jest + React Testing Library

---

## CRITICAL: Read AGENTS.md before writing any code

Every subagent must read `/home/albin/Documents/Skitfiske/AGENTS.md` before writing any Next.js code. Next.js 16 has breaking changes compared to earlier versions.

---

## File Map

| File | Ansvar |
|---|---|
| `types/catch.ts` | Catch och InsertCatch TypeScript-interfaces |
| `lib/supabase/catches.ts` | fetchMyCatches, fetchAllCatches, insertCatch, uploadCatchImage |
| `components/catch/CatchCard.tsx` | Enskilt fångstkort (art, vikt, längd, datum, plats, bild) |
| `components/catch/CatchList.tsx` | Lista med CatchCards, tom-state och loading-state |
| `app/(app)/logbok/page.tsx` | Logboksidan — Tabs + CatchList + FAB |
| `app/(app)/logbok/ny/page.tsx` | Registreringsformulär |
| `__tests__/components/catch/CatchCard.test.tsx` | 7 tester för CatchCard |
| `__tests__/components/catch/CatchList.test.tsx` | 3 tester för CatchList |

---

## Task 1: Supabase-databas & Storage (manuell setup)

**OBS: Denna task körs manuellt i Supabase Dashboard — ingen kod skrivs.**

**Files:** Inga filer — SQL körs i Supabase Dashboard.

- [ ] **Steg 1: Skapa tabellen `catches`**

Gå till **Supabase Dashboard → SQL Editor** och kör:

```sql
CREATE TABLE catches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  species text NOT NULL,
  weight_kg numeric(6,3) NOT NULL,
  length_cm numeric(5,1) NOT NULL,
  location_text text,
  lat float8,
  lng float8,
  image_url text,
  caught_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE catches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read catches"
ON catches FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert own catches"
ON catches FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

- [ ] **Steg 2: Skapa Storage bucket**

Gå till **Supabase Dashboard → Storage → New Bucket**:
- Name: `catch-images`
- Public: ✅

- [ ] **Steg 3: Lägg till Storage RLS-policies**

```sql
CREATE POLICY "Users can upload own catch images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'catch-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view catch images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'catch-images');
```

- [ ] **Steg 4: Verifiera**

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'catches';
```

Förväntad output: en rad med `catches`.

---

## Task 2: TypeScript-typer

**Files:**
- Create: `types/catch.ts`

- [ ] **Steg 1: Skapa `types/catch.ts`**

```ts
// types/catch.ts
export interface Catch {
  id: string;
  user_id: string;
  full_name: string;
  species: string;
  weight_kg: number;
  length_cm: number;
  location_text: string | null;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  caught_at: string;
  created_at: string;
}

export interface InsertCatch {
  user_id: string;
  full_name: string;
  species: string;
  weight_kg: number;
  length_cm: number;
  location_text: string | null;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  caught_at: string;
}
```

- [ ] **Steg 2: TypeScript-kontroll**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Förväntad output: ingen output (inga fel).

- [ ] **Steg 3: Committa**

```bash
git add types/catch.ts
git commit -m "feat: add catch TypeScript types"
```

---

## Task 3: DB-queries (`lib/supabase/catches.ts`)

**Files:**
- Create: `lib/supabase/catches.ts`

- [ ] **Steg 1: Skapa `lib/supabase/catches.ts`**

```ts
// lib/supabase/catches.ts
import { createClient } from '@/lib/supabase/client';
import type { Catch, InsertCatch } from '@/types/catch';

export async function fetchMyCatches(userId: string): Promise<Catch[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('catches')
    .select('*')
    .eq('user_id', userId)
    .order('caught_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchAllCatches(): Promise<Catch[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('catches')
    .select('*')
    .order('caught_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function insertCatch(entry: InsertCatch): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('catches').insert(entry);
  if (error) throw error;
}

export async function uploadCatchImage(userId: string, file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from('catch-images').upload(path, file);
  if (error) throw error;

  const { data } = supabase.storage.from('catch-images').getPublicUrl(path);
  return data.publicUrl;
}
```

- [ ] **Steg 2: TypeScript-kontroll**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Förväntad output: ingen output.

- [ ] **Steg 3: Committa**

```bash
git add lib/supabase/catches.ts
git commit -m "feat: add Supabase catch query helpers"
```

---

## Task 4: `CatchCard`-komponent (TDD)

**Files:**
- Create: `__tests__/components/catch/CatchCard.test.tsx`
- Create: `components/catch/CatchCard.tsx`

- [ ] **Steg 1: Skriv det fallande testet**

```tsx
// __tests__/components/catch/CatchCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import CatchCard from '@/components/catch/CatchCard';
import theme from '@/lib/theme';
import type { Catch } from '@/types/catch';

const baseCatch: Catch = {
  id: '1',
  user_id: 'user1',
  full_name: 'Erik Johansson',
  species: 'Gädda',
  weight_kg: 2.4,
  length_cm: 58,
  location_text: 'Mälaren',
  lat: 59.33,
  lng: 18.07,
  image_url: null,
  caught_at: '2026-04-11T10:23:00Z',
  created_at: '2026-04-11T10:23:00Z',
};

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('CatchCard', () => {
  it('renderar fiskart', () => {
    renderWithTheme(<CatchCard catch={baseCatch} />);
    expect(screen.getByText('Gädda')).toBeInTheDocument();
  });

  it('renderar vikt och längd', () => {
    renderWithTheme(<CatchCard catch={baseCatch} />);
    expect(screen.getByText(/2\.4.*kg/)).toBeInTheDocument();
    expect(screen.getByText(/58.*cm/)).toBeInTheDocument();
  });

  it('renderar år från caught_at', () => {
    renderWithTheme(<CatchCard catch={baseCatch} />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('renderar plats när location_text är satt', () => {
    renderWithTheme(<CatchCard catch={baseCatch} />);
    expect(screen.getByText('Mälaren')).toBeInTheDocument();
  });

  it('renderar inte plats när location_text är null', () => {
    const c = { ...baseCatch, location_text: null };
    renderWithTheme(<CatchCard catch={c} />);
    expect(screen.queryByText('Mälaren')).not.toBeInTheDocument();
  });

  it('renderar bild när image_url är satt', () => {
    const c = { ...baseCatch, image_url: 'https://example.com/fish.jpg' };
    renderWithTheme(<CatchCard catch={c} />);
    expect(screen.getByAltText('Fångstbild')).toBeInTheDocument();
  });

  it('renderar inte bild när image_url är null', () => {
    renderWithTheme(<CatchCard catch={baseCatch} />);
    expect(screen.queryByAltText('Fångstbild')).not.toBeInTheDocument();
  });
});
```

- [ ] **Steg 2: Kör testet och bekräfta att det fallerar**

```bash
npm test -- __tests__/components/catch/CatchCard.test.tsx --no-coverage 2>&1 | tail -10
```

Förväntad output: `FAIL` — Cannot find module '@/components/catch/CatchCard'

- [ ] **Steg 3: Implementera `components/catch/CatchCard.tsx`**

```tsx
// components/catch/CatchCard.tsx
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Catch } from '@/types/catch';

interface Props {
  catch: Catch;
}

export default function CatchCard({ catch: c }: Props) {
  const date = new Date(c.caught_at).toLocaleString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card sx={{ mb: 1.5, mx: 2, bgcolor: 'background.paper' }}>
      <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {c.species}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {c.weight_kg} kg · {c.length_cm} cm
          </Typography>
          {c.location_text && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {c.location_text}
            </Typography>
          )}
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {date}
          </Typography>
        </Box>
        {c.image_url && (
          <Box
            component="img"
            src={c.image_url}
            alt="Fångstbild"
            sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
          />
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Steg 4: Kör testet och bekräfta att det passerar**

```bash
npm test -- __tests__/components/catch/CatchCard.test.tsx --no-coverage 2>&1 | tail -10
```

Förväntad output: `PASS` — 7 gröna tester.

- [ ] **Steg 5: Committa**

```bash
git add components/catch/CatchCard.tsx __tests__/components/catch/CatchCard.test.tsx
git commit -m "feat: add CatchCard component"
```

---

## Task 5: `CatchList`-komponent (TDD)

**Files:**
- Create: `__tests__/components/catch/CatchList.test.tsx`
- Create: `components/catch/CatchList.tsx`

- [ ] **Steg 1: Skriv det fallande testet**

```tsx
// __tests__/components/catch/CatchList.test.tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import CatchList from '@/components/catch/CatchList';
import theme from '@/lib/theme';
import type { Catch } from '@/types/catch';

const makeCatch = (id: string, species: string): Catch => ({
  id,
  user_id: 'user1',
  full_name: 'Erik Johansson',
  species,
  weight_kg: 1.0,
  length_cm: 40,
  location_text: null,
  lat: null,
  lng: null,
  image_url: null,
  caught_at: '2026-04-11T10:00:00Z',
  created_at: '2026-04-11T10:00:00Z',
});

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('CatchList', () => {
  it('visar tom-state när listan är tom', () => {
    renderWithTheme(<CatchList catches={[]} isLoading={false} />);
    expect(screen.getByText('Inga fångster registrerade än.')).toBeInTheDocument();
  });

  it('renderar ett kort per fångst', () => {
    const catches = [makeCatch('1', 'Gädda'), makeCatch('2', 'Abborre')];
    renderWithTheme(<CatchList catches={catches} isLoading={false} />);
    expect(screen.getByText('Gädda')).toBeInTheDocument();
    expect(screen.getByText('Abborre')).toBeInTheDocument();
  });

  it('visar laddningsindikator när isLoading är true', () => {
    renderWithTheme(<CatchList catches={[]} isLoading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```

- [ ] **Steg 2: Kör testet och bekräfta att det fallerar**

```bash
npm test -- __tests__/components/catch/CatchList.test.tsx --no-coverage 2>&1 | tail -10
```

Förväntad output: `FAIL` — Cannot find module '@/components/catch/CatchList'

- [ ] **Steg 3: Implementera `components/catch/CatchList.tsx`**

```tsx
// components/catch/CatchList.tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import CatchCard from '@/components/catch/CatchCard';
import type { Catch } from '@/types/catch';

interface Props {
  catches: Catch[];
  isLoading: boolean;
}

export default function CatchList({ catches, isLoading }: Props) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (catches.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <Typography color="text.secondary">Inga fångster registrerade än.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ overflowY: 'auto', flex: 1, py: 1 }}>
      {catches.map((c) => (
        <CatchCard key={c.id} catch={c} />
      ))}
    </Box>
  );
}
```

- [ ] **Steg 4: Kör testet och bekräfta att det passerar**

```bash
npm test -- __tests__/components/catch/CatchList.test.tsx --no-coverage 2>&1 | tail -10
```

Förväntad output: `PASS` — 3 gröna tester.

- [ ] **Steg 5: Kör alla tester**

```bash
npm test --no-coverage 2>&1 | tail -10
```

Förväntad output: `Tests: 33 passed` (23 tidigare + 7 CatchCard + 3 CatchList).

- [ ] **Steg 6: Committa**

```bash
git add components/catch/CatchList.tsx __tests__/components/catch/CatchList.test.tsx
git commit -m "feat: add CatchList component"
```

---

## Task 6: Logboksida (`app/(app)/logbok/page.tsx`)

**Files:**
- Modify: `app/(app)/logbok/page.tsx`

- [ ] **Steg 1: Ersätt platshållaren**

```tsx
// app/(app)/logbok/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Fab from '@mui/material/Fab';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { fetchMyCatches, fetchAllCatches } from '@/lib/supabase/catches';
import CatchList from '@/components/catch/CatchList';
import type { Catch } from '@/types/catch';

export default function LogbokPage() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    const load = tab === 0 ? fetchMyCatches(userId) : fetchAllCatches();
    load
      .then((data) => setCatches(data))
      .catch(() => setCatches([]))
      .finally(() => setIsLoading(false));
  }, [tab, userId]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper' }}>
        <Tabs
          value={tab}
          onChange={(_, v: number) => setTab(v)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': { color: 'text.secondary' },
            '& .Mui-selected': { color: 'primary.main' },
            '& .MuiTabs-indicator': { bgcolor: 'primary.main' },
          }}
        >
          <Tab label="Mina fångster" />
          <Tab label="Alla fångster" />
        </Tabs>
      </Box>

      <CatchList catches={catches} isLoading={isLoading} />

      <Fab
        color="primary"
        aria-label="Lägg till fångst"
        onClick={() => router.push('/logbok/ny')}
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
      >
        <Plus size={24} />
      </Fab>
    </Box>
  );
}
```

- [ ] **Steg 2: TypeScript-kontroll**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Förväntad output: ingen output.

- [ ] **Steg 3: Committa**

```bash
git add "app/(app)/logbok/page.tsx"
git commit -m "feat: implement logbook page with tabs and catch list"
```

---

## Task 7: Registreringsformulär (`app/(app)/logbok/ny/page.tsx`)

**Files:**
- Create: `app/(app)/logbok/ny/page.tsx`

- [ ] **Steg 1: Skapa `app/(app)/logbok/ny/page.tsx`**

```tsx
// app/(app)/logbok/ny/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import { ArrowLeft, MapPin, Camera } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { insertCatch, uploadCatchImage } from '@/lib/supabase/catches';

function getLocalDatetimeString() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

export default function NyFangstPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [species, setSpecies] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [lengthCm, setLengthCm] = useState('');
  const [caughtAt, setCaughtAt] = useState(getLocalDatetimeString());
  const [locationText, setLocationText] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const canSave =
    species.trim().length > 0 &&
    weightKg.trim().length > 0 &&
    lengthCm.trim().length > 0 &&
    caughtAt.length > 0 &&
    !isSaving;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Bilden får max vara 5MB.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleGetGps() {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocationText('GPS-position');
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
      }
    );
  }

  async function handleSubmit() {
    if (!canSave) return;
    setIsSaving(true);

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Inte inloggad');

      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadCatchImage(userData.user.id, imageFile);
      }

      await insertCatch({
        user_id: userData.user.id,
        full_name: userData.user.user_metadata?.full_name ?? 'Anonym',
        species: species.trim(),
        weight_kg: parseFloat(weightKg),
        length_cm: parseFloat(lengthCm),
        location_text: locationText.trim() || null,
        lat,
        lng,
        image_url: imageUrl,
        caught_at: new Date(caughtAt).toISOString(),
      });

      router.push('/logbok');
    } catch {
      alert('Kunde inte spara fångsten. Försök igen.');
      setIsSaving(false);
    }
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1,
          py: 1,
          position: 'sticky',
          top: 0,
          bgcolor: 'background.default',
          zIndex: 10,
        }}
      >
        <IconButton onClick={() => router.push('/logbok')} aria-label="Tillbaka">
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>
          Registrera fångst
        </Typography>
      </Box>

      <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
          label="Art *"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          fullWidth
        />
        <TextField
          label="Vikt (kg) *"
          type="number"
          inputProps={{ step: '0.001', min: '0' }}
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          fullWidth
        />
        <TextField
          label="Längd (cm) *"
          type="number"
          inputProps={{ step: '0.1', min: '0' }}
          value={lengthCm}
          onChange={(e) => setLengthCm(e.target.value)}
          fullWidth
        />
        <TextField
          label="Datum & tid *"
          type="datetime-local"
          value={caughtAt}
          onChange={(e) => setCaughtAt(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={gpsLoading ? <CircularProgress size={16} /> : <MapPin size={16} />}
            onClick={handleGetGps}
            disabled={gpsLoading}
            fullWidth
          >
            {lat ? 'GPS-position hämtad' : 'Hämta GPS-position'}
          </Button>
          <TextField
            label="Plats (fritext)"
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
            fullWidth
            placeholder="t.ex. Mälaren, norra stranden"
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Button
            variant="outlined"
            startIcon={<Camera size={16} />}
            onClick={() => fileInputRef.current?.click()}
            fullWidth
          >
            {imageFile ? imageFile.name : 'Välj bild'}
          </Button>
          {imagePreview && (
            <Box
              component="img"
              src={imagePreview}
              alt="Förhandsvisning"
              sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 2 }}
            />
          )}
        </Box>

        <Button
          variant="contained"
          fullWidth
          disabled={!canSave}
          onClick={handleSubmit}
          sx={{ mt: 1 }}
        >
          {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Spara fångst'}
        </Button>
      </Box>
    </Box>
  );
}
```

- [ ] **Steg 2: Kör alla tester**

```bash
npm test --no-coverage 2>&1 | tail -10
```

Förväntad output: `Tests: 33 passed` (alla gröna).

- [ ] **Steg 3: TypeScript-kontroll**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Förväntad output: ingen output.

- [ ] **Steg 4: Committa och pusha**

```bash
git add "app/(app)/logbok/ny/page.tsx"
git commit -m "feat: add new catch registration form"
git push origin main
```

---

## Slutverifiering (manuell)

1. Starta dev-servern: `npm run dev`
2. Öppna `http://localhost:3000` → logga in
3. Navigera till **Logbok**
4. Kontrollera att tabbar visas (Mina fångster / Alla fångster)
5. Tryck på FAB (+) → formulärsidan öppnas
6. Fyll i art, vikt, längd — spara-knappen ska vara disabled tills alla tre är ifyllda
7. Fyll i alla fält och tryck "Spara fångst" → ska navigera tillbaka till /logbok
8. Fångsten ska synas i listan under "Mina fångster"
9. Testa GPS-knappen → koordinater sätts och "GPS-position" visas i platsfältet
10. Testa fotouppladdning → förhandsvisning visas i formuläret
