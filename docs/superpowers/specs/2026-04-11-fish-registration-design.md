# Phase 3: Fish Registration (Logbok) — Design Spec

**Projekt:** Hooked – Fishing Club PWA  
**Datum:** 2026-04-11  
**Stack:** Next.js 16 (App Router) + TypeScript + MUI v9 + Supabase + Supabase Storage  

---

## 1. Databas

### Tabell: `catches`

| Kolumn | Typ | Notering |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | FK → auth.users.id ON DELETE CASCADE |
| full_name | text | Kopieras från user_metadata.full_name vid insert |
| species | text | Fiskart (fritext) |
| weight_kg | numeric(6,3) | Vikt i kg |
| length_cm | numeric(5,1) | Längd i cm |
| location_text | text | Nullable — fritext eller omvänd geokodning |
| lat | float8 | Nullable — GPS-latitud |
| lng | float8 | Nullable — GPS-longitud |
| image_url | text | Nullable — publik URL i Supabase Storage |
| caught_at | timestamptz | Tidpunkt för fångsten, default now() |
| created_at | timestamptz | default now() |

### RLS-regler för `catches`

```sql
-- Alla autentiserade användare kan läsa alla fångster
CREATE POLICY "Authenticated users can read catches"
ON catches FOR SELECT
TO authenticated
USING (true);

-- Användare kan bara skapa fångster med sitt eget user_id
CREATE POLICY "Users can insert own catches"
ON catches FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

### Supabase Storage

- Bucket: `catch-images` (public)
- Filsökväg: `[user_id]/[timestamp].[extension]`
- RLS: autentiserade användare kan ladda upp till sin egen mapp

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

---

## 2. Filstruktur

```
types/catch.ts                        — TypeScript-typer för Catch
lib/supabase/catches.ts               — DB-queries: fetchMyCatches, fetchAllCatches, insertCatch, uploadCatchImage
components/catch/CatchCard.tsx        — Enskilt fångstkort
components/catch/CatchList.tsx        — Lista med CatchCards + tom-state
app/(app)/logbok/page.tsx             — Logboksidan (Tabs + CatchList + FAB)
app/(app)/logbok/ny/page.tsx          — Registreringsformulär

__tests__/components/catch/CatchCard.test.tsx
__tests__/components/catch/CatchList.test.tsx
```

---

## 3. UI-layout

### Logboksidan (`/logbok`)

```
┌─────────────────────────────────┐
│  Mina fångster │ Alla fångster  │  ← sticky MUI Tabs (fullWidth)
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🐟 Gädda                  │  │
│  │ 2.4 kg · 58 cm            │  │
│  │ 📍 Mälaren · 11 apr 10:23 │  │
│  │ [miniatyrbild om finns]   │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🐟 Abborre                │  │
│  │ 0.8 kg · 32 cm            │  │
│  │ 10 apr 14:05              │  │
│  └───────────────────────────┘  │
│                                 │
│                           ⊕     │  ← FAB (primary.main, fixed bottom-right)
└─────────────────────────────────┘
```

**FAB:** MUI `Fab` med `+`-ikon (Lucide `Plus`), `position: fixed`, `bottom: 80px` (ovanför BottomNav), `right: 16px`.

**Tom-state:** Om listan är tom visas texten "Inga fångster registrerade än." centrerat.

### Registreringssida (`/logbok/ny`)

```
← Tillbaka              Registrera fångst

  Art *               [Gädda              ]
  Vikt (kg) *         [2.4                ]
  Längd (cm) *        [58                 ]
  Datum & tid *       [2026-04-11 10:23   ]
  Plats               [📍 Hämta GPS-position]
                      [Fritext...          ]
  Foto                [📷 Välj bild       ]
                      [förhandsvisning]

  [         Spara fångst         ]
```

Obligatoriska fält: art, vikt, längd, datum/tid (markerade med `*`).  
Plats och foto är valfria.  
Spara-knappen är disabled tills alla obligatoriska fält är ifyllda.  
Vid lyckad sparning: `router.push('/logbok')`.

---

## 4. Komponenter

### `CatchCard`

- Props: `catch: Catch`
- Visar: art, vikt (kg), längd (cm), datum/tid (sv-SE), platsbeskrivning (om finns), miniatyrbild (om finns, max-width 80px, rounded)
- MUI `Card` med `CardContent`

### `CatchList`

- Props: `catches: Catch[]`, `isLoading: boolean`
- Renderar `CatchCard` per fångst
- Tom-state: `<Typography>Inga fångster registrerade än.</Typography>` centrerat
- Loading-state: `<CircularProgress />` centrerat

### `app/(app)/logbok/page.tsx`

- `'use client'`
- MUI Tabs: "Mina fångster" / "Alla fångster"
- Fetchår fångster vid mount och vid tabyte
- FAB med `Plus`-ikon → `router.push('/logbok/ny')`

### `app/(app)/logbok/ny/page.tsx`

- `'use client'`
- Hanterar all formulärstate lokalt: species, weightKg, lengthCm, caughtAt, locationText, lat, lng, imageFile
- GPS via `navigator.geolocation.getCurrentPosition()` → sätter lat/lng och locationText = "GPS-position"
- Foto: `<input type="file" accept="image/*">`, max 5MB, visar förhandsvisning med `URL.createObjectURL`
- Vid submit: laddar upp bild (om vald) → insertCatch → router.push('/logbok')
- Spara-knappen disabled om species/weightKg/lengthCm är tomma

---

## 5. DB-queries (`lib/supabase/catches.ts`)

```ts
fetchMyCatches(userId: string): Promise<Catch[]>
  // SELECT * FROM catches WHERE user_id = userId ORDER BY caught_at DESC

fetchAllCatches(): Promise<Catch[]>
  // SELECT * FROM catches ORDER BY caught_at DESC

insertCatch(catch: InsertCatch): Promise<void>
  // INSERT INTO catches

uploadCatchImage(userId: string, file: File): Promise<string>
  // Upload to catch-images/[userId]/[timestamp].[ext], return publicUrl
```

---

## 6. TypeScript-typer (`types/catch.ts`)

```ts
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

---

## 7. Testning

- `CatchCard`: renderar korrekt data (art, vikt, längd, datum), hanterar nullable fält (ingen plats → platsbeskrivning visas inte, ingen bild → ingen img)
- `CatchList`: tom-state visas när listan är tom, renderar rätt antal kort
