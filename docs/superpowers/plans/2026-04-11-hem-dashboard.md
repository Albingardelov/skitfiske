# Hem Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "Hem" placeholder with a dashboard showing a greeting, personal catch stats, and a club feed of the 10 latest catches.

**Architecture:** Two units — a pure `StatsRow` component (props-driven, testable) and the `HemPage` (fetches auth + catches, composes the layout). Reuses existing `CatchCard` and `fetchMyCatches`/`fetchAllCatches` from lib.

**Tech Stack:** Next.js 16 App Router, MUI v9, Supabase client, TypeScript

---

## File Structure

```
components/home/StatsRow.tsx          — new: 3 stat boxes (count, heaviest, longest)
app/(app)/hem/page.tsx                — modify: full dashboard implementation
__tests__/components/home/StatsRow.test.tsx  — new: unit tests for StatsRow
```

---

### Task 1: StatsRow component

**Files:**
- Create: `components/home/StatsRow.tsx`
- Create (test): `__tests__/components/home/StatsRow.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/components/home/StatsRow.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import StatsRow from '@/components/home/StatsRow';
import theme from '@/lib/theme';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('StatsRow', () => {
  it('renderar antal fångster', () => {
    renderWithTheme(<StatsRow count={5} heaviestKg={2.4} longestCm={58} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renderar tyngsta fisk i kg', () => {
    renderWithTheme(<StatsRow count={5} heaviestKg={2.4} longestCm={58} />);
    expect(screen.getByText('2.4 kg')).toBeInTheDocument();
  });

  it('renderar längsta fisk i cm', () => {
    renderWithTheme(<StatsRow count={5} heaviestKg={2.4} longestCm={58} />);
    expect(screen.getByText('58 cm')).toBeInTheDocument();
  });

  it('visar – för tyngsta och längsta när inga fångster', () => {
    renderWithTheme(<StatsRow count={0} heaviestKg={null} longestCm={null} />);
    expect(screen.getAllByText('–')).toHaveLength(2);
  });

  it('renderar labels', () => {
    renderWithTheme(<StatsRow count={0} heaviestKg={null} longestCm={null} />);
    expect(screen.getByText('Fångster')).toBeInTheDocument();
    expect(screen.getByText('Tyngsta')).toBeInTheDocument();
    expect(screen.getByText('Längsta')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /home/albin/Documents/Skitfiske
npm test -- --testPathPattern="StatsRow" --passWithNoTests 2>&1 | tail -15
```

Expected: FAIL — `Cannot find module '@/components/home/StatsRow'`

- [ ] **Step 3: Create the component**

Create `components/home/StatsRow.tsx`:

```tsx
// components/home/StatsRow.tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface Props {
  count: number;
  heaviestKg: number | null;
  longestCm: number | null;
}

interface StatBoxProps {
  label: string;
  value: string;
}

function StatBox({ label, value }: StatBoxProps) {
  return (
    <Box sx={{ flex: 1, textAlign: 'center' }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Box>
  );
}

export default function StatsRow({ count, heaviestKg, longestCm }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        mx: 2,
        py: 2,
        px: 1,
        bgcolor: 'background.paper',
        borderRadius: 2,
        mb: 2,
      }}
    >
      <StatBox label="Fångster" value={String(count)} />
      <StatBox label="Tyngsta" value={heaviestKg !== null ? `${heaviestKg} kg` : '–'} />
      <StatBox label="Längsta" value={longestCm !== null ? `${longestCm} cm` : '–'} />
    </Box>
  );
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern="StatsRow" 2>&1 | tail -15
```

Expected: 5 tests pass.

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep StatsRow
```

Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add components/home/StatsRow.tsx __tests__/components/home/StatsRow.test.tsx
git commit -m "feat: add StatsRow component with tests"
```

---

### Task 2: Hem dashboard page

**Files:**
- Modify: `app/(app)/hem/page.tsx`

No unit tests — the page depends on Supabase auth and is verified manually.

- [ ] **Step 1: Read the current file**

Read `app/(app)/hem/page.tsx` — currently a placeholder with just a centered "Hem" text.

- [ ] **Step 2: Replace with full implementation**

Replace `app/(app)/hem/page.tsx` entirely:

```tsx
// app/(app)/hem/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { createClient } from '@/lib/supabase/client';
import { fetchMyCatches, fetchAllCatches } from '@/lib/supabase/catches';
import StatsRow from '@/components/home/StatsRow';
import CatchCard from '@/components/catch/CatchCard';
import type { Catch } from '@/types/catch';

export default function HemPage() {
  const [firstName, setFirstName] = useState<string>('');
  const [myCatches, setMyCatches] = useState<Catch[]>([]);
  const [clubFeed, setClubFeed] = useState<Catch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => {
        const fullName = data.user?.user_metadata?.full_name ?? '';
        setFirstName(fullName.split(' ')[0]);
        const userId = data.user?.id;
        if (!userId) {
          setIsLoading(false);
          return;
        }
        Promise.all([fetchMyCatches(userId), fetchAllCatches()])
          .then(([mine, all]) => {
            setMyCatches(mine);
            setClubFeed(all.slice(0, 10));
          })
          .catch(() => {
            setMyCatches([]);
            setClubFeed([]);
          })
          .finally(() => setIsLoading(false));
      })
      .catch(() => setIsLoading(false));
  }, []);

  const heaviestKg =
    myCatches.length > 0 ? Math.max(...myCatches.map((c) => c.weight_kg)) : null;
  const longestCm =
    myCatches.length > 0 ? Math.max(...myCatches.map((c) => c.length_cm)) : null;

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ px: 2, pt: 3, pb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {firstName ? `Hej, ${firstName}!` : 'Välkommen!'}
        </Typography>
      </Box>

      <StatsRow count={myCatches.length} heaviestKg={heaviestKg} longestCm={longestCm} />

      <Box sx={{ px: 2, mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Senaste i klubben
        </Typography>
      </Box>

      {clubFeed.length === 0 ? (
        <Box sx={{ px: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Inga fångster registrerade än.
          </Typography>
        </Box>
      ) : (
        clubFeed.map((c) => <CatchCard key={c.id} catch={c} />)
      )}
    </Box>
  );
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep hem
```

Expected: no output.

- [ ] **Step 4: Run full test suite**

```bash
npm test 2>&1 | tail -10
```

Expected: all tests pass (at least 38 — 33 previous + 5 new StatsRow tests).

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/hem/page.tsx
git commit -m "feat: implement Hem dashboard with stats and club feed"
```

---

## Manual Verification

After all tasks complete:

1. Log in — greeting shows first name ("Hej, Albin!")
2. Stats row shows correct count, heaviest fish in kg, longest in cm
3. Stats show "–" for a new user with no catches
4. "Senaste i klubben" shows up to 10 most recent catches from all members
5. Each catch card shows species, weight, length, date, optional location/image
6. Loading spinner shows while data fetches
