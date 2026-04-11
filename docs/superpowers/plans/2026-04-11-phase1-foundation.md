# Phase 1: Foundation & Theme — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the Hooked PWA with Next.js (App Router), MUI, Supabase Auth (e-post + lösenord), and a full mobile app shell with bottom navigation.

**Architecture:** Next.js App Router with route groups `(auth)` for public auth pages and `(app)` for protected pages. MUI configured with a custom dark nature theme via an emotion cache registry component for SSR compatibility. Supabase SSR handles session management in middleware and server components. Bottom navigation drives all main app routing.

**Tech Stack:** Next.js 15, TypeScript, MUI v6, @emotion/cache, @supabase/ssr, @ducanh2912/next-pwa, lucide-react, Jest + React Testing Library

---

## File Map

| File | Ansvar |
|---|---|
| `lib/theme.ts` | MUI-temadefinition (färger, komponent-overrides) |
| `lib/supabase/client.ts` | Browser Supabase-klient |
| `lib/supabase/server.ts` | Server Supabase-klient (Server Components) |
| `components/ThemeRegistry.tsx` | Emotion cache + ThemeProvider för App Router |
| `components/navigation/BottomNav.tsx` | Bottom navigation med 4 tabbar |
| `middleware.ts` | Sessionskontroll, redirect-logik |
| `app/layout.tsx` | Root layout med ThemeRegistry |
| `app/page.tsx` | Root redirect → /hem |
| `app/(auth)/login/page.tsx` | Inloggningssida |
| `app/(auth)/registrera/page.tsx` | Registreringssida |
| `app/(auth)/glomt-losenord/page.tsx` | Glömt lösenord-sida |
| `app/(app)/layout.tsx` | Skyddat app-skal med BottomNav |
| `app/(app)/hem/page.tsx` | Platshållare |
| `app/(app)/chatt/page.tsx` | Platshållare |
| `app/(app)/karta/page.tsx` | Platshållare |
| `app/(app)/logbok/page.tsx` | Platshållare |
| `jest.config.ts` | Jest-konfiguration |
| `jest.setup.ts` | Jest setup (Testing Library matchers) |
| `__tests__/lib/theme.test.ts` | Tester för temavärden |
| `__tests__/components/navigation/BottomNav.test.tsx` | Tester för BottomNav |
| `next.config.ts` | Next.js + PWA-konfiguration |
| `public/manifest.json` | PWA-manifest |

---

## Task 1: Initiera Next.js-projekt + installera beroenden

**Files:**
- Create: (hela projektstrukturen via create-next-app)
- Modify: `next.config.ts`
- Modify: `package.json`
- Create: `.env.local`
- Create: `.env.example`

- [ ] **Steg 1: Kör create-next-app**

```bash
cd /home/albin/Documents/Skitfiske
npx create-next-app@latest . --typescript --eslint --app --no-tailwind --no-src-dir --import-alias="@/*"
```

Välj vid promptar:
- TypeScript: Yes
- ESLint: Yes
- App Router: Yes
- Tailwind CSS: No
- src/ directory: No
- import alias (@/*): Yes

- [ ] **Steg 2: Installera produktionsberoenden**

```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled @emotion/cache
npm install @supabase/supabase-js @supabase/ssr
npm install lucide-react
npm install @ducanh2912/next-pwa
```

- [ ] **Steg 3: Installera testberoenden**

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest
```

- [ ] **Steg 4: Lägg till test-script i package.json**

Öppna `package.json` och lägg till i `"scripts"`:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Steg 5: Skapa .env.local**

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=din_supabase_url_här
NEXT_PUBLIC_SUPABASE_ANON_KEY=din_supabase_anon_key_här
EOF
```

Hämta värdena från Supabase Dashboard → Settings → API.

- [ ] **Steg 6: Skapa .env.example**

```bash
cat > .env.example << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
EOF
```

- [ ] **Steg 7: Säkerställ att .env.local finns i .gitignore**

Kontrollera att `.gitignore` innehåller `.env.local`. Det gör den vanligtvis från create-next-app.

- [ ] **Steg 8: Koppla git-remote**

```bash
git remote add origin https://github.com/Albingardelov/skitfiske.git
git branch -M main
```

- [ ] **Steg 9: Städa standardfiler från create-next-app**

Ta bort standardinnehållet i `app/globals.css` (behåll bara `:root` och `body` om det finns, annars töm filen) och ersätt `app/page.tsx` med en tom redirect (görs i Task 5).

- [ ] **Steg 10: Committa initial setup**

```bash
git add -A
git commit -m "chore: initialize Next.js project with MUI, Supabase and PWA dependencies"
git push -u origin main
```

---

## Task 2: Konfigurera Jest

**Files:**
- Create: `jest.config.ts`
- Create: `jest.setup.ts`

- [ ] **Steg 1: Skapa jest.config.ts**

```ts
// jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const customConfig: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default createJestConfig(customConfig);
```

- [ ] **Steg 2: Skapa jest.setup.ts**

```ts
// jest.setup.ts
import '@testing-library/jest-dom';
```

- [ ] **Steg 3: Verifiera Jest fungerar**

Skapa en temporär testfil:

```bash
mkdir -p __tests__
cat > __tests__/smoke.test.ts << 'EOF'
describe('jest', () => {
  it('works', () => {
    expect(1 + 1).toBe(2);
  });
});
EOF
```

Kör:
```bash
npm test
```

Förväntad output: `PASS __tests__/smoke.test.ts`

- [ ] **Steg 4: Ta bort smoke-testet**

```bash
rm __tests__/smoke.test.ts
```

- [ ] **Steg 5: Committa**

```bash
git add jest.config.ts jest.setup.ts
git commit -m "chore: configure Jest with React Testing Library"
```

---

## Task 3: Skapa Supabase-klienter

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`

- [ ] **Steg 1: Skapa lib/supabase/client.ts**

```ts
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Steg 2: Skapa lib/supabase/server.ts**

```ts
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignoreras i Server Components — middleware hanterar cookies
          }
        },
      },
    }
  );
}
```

- [ ] **Steg 3: Committa**

```bash
git add lib/supabase/client.ts lib/supabase/server.ts
git commit -m "feat: add Supabase browser and server clients"
```

---

## Task 4: Skapa MUI-tema (TDD)

**Files:**
- Create: `__tests__/lib/theme.test.ts`
- Create: `lib/theme.ts`

- [ ] **Steg 1: Skriv det fallande testet**

```ts
// __tests__/lib/theme.test.ts
import theme from '@/lib/theme';

describe('MUI theme', () => {
  it('has Safety Orange as primary color', () => {
    expect(theme.palette.primary.main).toBe('#FB8500');
  });

  it('has Deep Forest Green as secondary color', () => {
    expect(theme.palette.secondary.main).toBe('#1B4332');
  });

  it('has Lake Blue as background default', () => {
    expect(theme.palette.background.default).toBe('#003566');
  });

  it('has white as primary text color', () => {
    expect(theme.palette.text.primary).toBe('#FFFFFF');
  });

  it('has borderRadius 12', () => {
    expect(theme.shape.borderRadius).toBe(12);
  });

  it('Button has minHeight 48', () => {
    const buttonRoot = theme.components?.MuiButton?.styleOverrides?.root as Record<string, unknown>;
    expect(buttonRoot.minHeight).toBe(48);
  });
});
```

- [ ] **Steg 2: Kör testet för att bekräfta att det fallerar**

```bash
npm test -- __tests__/lib/theme.test.ts
```

Förväntad output: `FAIL` — Cannot find module '@/lib/theme'

- [ ] **Steg 3: Implementera lib/theme.ts**

```ts
// lib/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FB8500',
    },
    secondary: {
      main: '#1B4332',
    },
    background: {
      default: '#003566',
      paper: '#004080',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#F1F1F1',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 700, lineHeight: 1.3 },
    h2: { fontWeight: 700, lineHeight: 1.3 },
    h3: { fontWeight: 700, lineHeight: 1.3 },
    h4: { fontWeight: 700, lineHeight: 1.3 },
    h5: { fontWeight: 700, lineHeight: 1.3 },
    h6: { fontWeight: 700, lineHeight: 1.3 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 48,
          padding: '12px 24px',
          textTransform: 'none' as const,
          fontWeight: 700,
          fontSize: '1rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            '&:hover fieldset': {
              borderColor: '#FB8500',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FB8500',
            },
          },
          '& .MuiInputBase-input': {
            padding: '14px 16px',
          },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: '#1B4332',
        },
      },
    },
  },
});

export default theme;
```

- [ ] **Steg 4: Kör testet igen för att bekräfta att det passerar**

```bash
npm test -- __tests__/lib/theme.test.ts
```

Förväntad output: `PASS __tests__/lib/theme.test.ts` med 6 gröna tester.

- [ ] **Steg 5: Committa**

```bash
git add lib/theme.ts __tests__/lib/theme.test.ts
git commit -m "feat: add MUI nature theme with outdoor-optimized component overrides"
```

---

## Task 5: Skapa ThemeRegistry + root layout

**Files:**
- Create: `components/ThemeRegistry.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

- [ ] **Steg 1: Skapa components/ThemeRegistry.tsx**

```tsx
// components/ThemeRegistry.tsx
'use client';

import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useState } from 'react';
import theme from '@/lib/theme';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: 'mui' });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;
    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
```

- [ ] **Steg 2: Uppdatera app/layout.tsx**

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import ThemeRegistry from '@/components/ThemeRegistry';

export const metadata: Metadata = {
  title: 'Hooked',
  description: 'Fiskeklubbens app',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
```

- [ ] **Steg 3: Uppdatera app/page.tsx**

```tsx
// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/hem');
}
```

- [ ] **Steg 4: Töm app/globals.css**

Ersätt hela innehållet i `app/globals.css` med:

```css
/* Global styles hanteras av MUI CssBaseline */
```

- [ ] **Steg 5: Committa**

```bash
git add components/ThemeRegistry.tsx app/layout.tsx app/page.tsx app/globals.css
git commit -m "feat: add MUI ThemeRegistry and root layout"
```

---

## Task 6: Skapa BottomNav (TDD)

**Files:**
- Create: `__tests__/components/navigation/BottomNav.test.tsx`
- Create: `components/navigation/BottomNav.tsx`

- [ ] **Steg 1: Skriv det fallande testet**

```tsx
// __tests__/components/navigation/BottomNav.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import BottomNav from '@/components/navigation/BottomNav';
import theme from '@/lib/theme';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/hem'),
  useRouter: jest.fn().mockReturnValue({ push: mockPush }),
}));

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

beforeEach(() => {
  mockPush.mockClear();
});

describe('BottomNav', () => {
  it('renders all four navigation items', () => {
    renderWithTheme(<BottomNav />);
    expect(screen.getByText('Hem')).toBeInTheDocument();
    expect(screen.getByText('Chatt')).toBeInTheDocument();
    expect(screen.getByText('Karta')).toBeInTheDocument();
    expect(screen.getByText('Logbok')).toBeInTheDocument();
  });

  it('navigates to /chatt when Chatt tab is clicked', async () => {
    renderWithTheme(<BottomNav />);
    await userEvent.click(screen.getByText('Chatt'));
    expect(mockPush).toHaveBeenCalledWith('/chatt');
  });

  it('navigates to /karta when Karta tab is clicked', async () => {
    renderWithTheme(<BottomNav />);
    await userEvent.click(screen.getByText('Karta'));
    expect(mockPush).toHaveBeenCalledWith('/karta');
  });

  it('navigates to /logbok when Logbok tab is clicked', async () => {
    renderWithTheme(<BottomNav />);
    await userEvent.click(screen.getByText('Logbok'));
    expect(mockPush).toHaveBeenCalledWith('/logbok');
  });
});
```

- [ ] **Steg 2: Kör testet för att bekräfta att det fallerar**

```bash
npm test -- __tests__/components/navigation/BottomNav.test.tsx
```

Förväntad output: `FAIL` — Cannot find module '@/components/navigation/BottomNav'

- [ ] **Steg 3: Implementera components/navigation/BottomNav.tsx**

```tsx
// components/navigation/BottomNav.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { Home, MessageCircle, MapPin, BookOpen } from 'lucide-react';

const navItems = [
  { label: 'Hem', icon: <Home size={24} />, route: '/hem' },
  { label: 'Chatt', icon: <MessageCircle size={24} />, route: '/chatt' },
  { label: 'Karta', icon: <MapPin size={24} />, route: '/karta' },
  { label: 'Logbok', icon: <BookOpen size={24} />, route: '/logbok' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const currentValue = navItems.findIndex((item) => pathname.startsWith(item.route));

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
      elevation={3}
    >
      <BottomNavigation
        value={currentValue}
        onChange={(_, newValue: number) => {
          router.push(navItems[newValue].route);
        }}
        sx={{ minHeight: 64, bgcolor: 'secondary.main' }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.route}
            label={item.label}
            icon={item.icon}
            sx={{
              color: 'rgba(255,255,255,0.6)',
              '&.Mui-selected': { color: 'primary.main' },
              minWidth: 0,
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
```

- [ ] **Steg 4: Kör testet för att bekräfta att det passerar**

```bash
npm test -- __tests__/components/navigation/BottomNav.test.tsx
```

Förväntad output: `PASS` med 4 gröna tester.

- [ ] **Steg 5: Committa**

```bash
git add components/navigation/BottomNav.tsx __tests__/components/navigation/BottomNav.test.tsx
git commit -m "feat: add BottomNav component with four app tabs"
```

---

## Task 7: Skapa middleware

**Files:**
- Create: `middleware.ts`

- [ ] **Steg 1: Skapa middleware.ts**

```ts
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/registrera') ||
    pathname.startsWith('/glomt-losenord');

  // Oautentiserad användare försöker nå skyddad sida
  if (!user && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Inloggad användare försöker nå auth-sida
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/hem', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

- [ ] **Steg 2: Committa**

```bash
git add middleware.ts
git commit -m "feat: add auth middleware with session-based route protection"
```

---

## Task 8: Skapa inloggningssida

**Files:**
- Create: `app/(auth)/login/page.tsx`

- [ ] **Steg 1: Skapa app/(auth)/login/page.tsx**

```tsx
// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Felaktig e-postadress eller lösenord.');
      setLoading(false);
      return;
    }

    router.push('/hem');
    router.refresh();
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        Hooked
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
        Fiskeklubbens app
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ width: '100%', maxWidth: 400 }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="E-postadress"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Lösenord"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ mb: 3 }}
        >
          {loading ? 'Loggar in...' : 'Logga in'}
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link component={NextLink} href="/registrera" color="primary">
            Registrera dig
          </Link>
          <Link component={NextLink} href="/glomt-losenord" color="primary">
            Glömt lösenord?
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
```

- [ ] **Steg 2: Committa**

```bash
git add app/\(auth\)/login/page.tsx
git commit -m "feat: add login page with email/password auth"
```

---

## Task 9: Skapa registreringssida

**Files:**
- Create: `app/(auth)/registrera/page.tsx`

- [ ] **Steg 1: Skapa app/(auth)/registrera/page.tsx**

```tsx
// app/(auth)/registrera/page.tsx
'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Lösenorden matchar inte.');
      return;
    }

    if (password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    setLoading(false);

    if (error) {
      setError('Något gick fel. Försök igen.');
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          bgcolor: 'background.default',
        }}
      >
        <Alert severity="success" sx={{ maxWidth: 400, width: '100%' }}>
          Konto skapat! Kontrollera din e-post för en bekräftelselänk.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        Skapa konto
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ width: '100%', maxWidth: 400 }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Namn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="E-postadress"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Lösenord"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Bekräfta lösenord"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ mb: 3 }}
        >
          {loading ? 'Skapar konto...' : 'Registrera dig'}
        </Button>

        <Link component={NextLink} href="/login" color="primary">
          Har du redan ett konto? Logga in
        </Link>
      </Box>
    </Box>
  );
}
```

- [ ] **Steg 2: Committa**

```bash
git add app/\(auth\)/registrera/page.tsx
git commit -m "feat: add registration page with Supabase signUp"
```

---

## Task 10: Skapa glömt lösenord-sida

**Files:**
- Create: `app/(auth)/glomt-losenord/page.tsx`

- [ ] **Steg 1: Skapa app/(auth)/glomt-losenord/page.tsx**

```tsx
// app/(auth)/glomt-losenord/page.tsx
'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/uppdatera-losenord`,
    });

    setLoading(false);

    if (error) {
      setError('Något gick fel. Försök igen.');
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          bgcolor: 'background.default',
        }}
      >
        <Alert severity="success" sx={{ maxWidth: 400, width: '100%' }}>
          Vi har skickat en återställningslänk till din e-post.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
        Glömt lösenord?
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 4, color: 'text.secondary', textAlign: 'center', maxWidth: 320 }}
      >
        Ange din e-postadress så skickar vi en återställningslänk.
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ width: '100%', maxWidth: 400 }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="E-postadress"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ mb: 3 }}
        >
          {loading ? 'Skickar...' : 'Skicka återställningslänk'}
        </Button>

        <Link component={NextLink} href="/login" color="primary">
          Tillbaka till inloggning
        </Link>
      </Box>
    </Box>
  );
}
```

- [ ] **Steg 2: Committa**

```bash
git add app/\(auth\)/glomt-losenord/page.tsx
git commit -m "feat: add forgot password page"
```

---

## Task 11: Skapa app-layout + platshållarsidor

**Files:**
- Create: `app/(app)/layout.tsx`
- Create: `app/(app)/hem/page.tsx`
- Create: `app/(app)/chatt/page.tsx`
- Create: `app/(app)/karta/page.tsx`
- Create: `app/(app)/logbok/page.tsx`

- [ ] **Steg 1: Skapa app/(app)/layout.tsx**

```tsx
// app/(app)/layout.tsx
import Box from '@mui/material/Box';
import BottomNav from '@/components/navigation/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: '64px' }}>
      {children}
      <BottomNav />
    </Box>
  );
}
```

- [ ] **Steg 2: Skapa app/(app)/hem/page.tsx**

```tsx
// app/(app)/hem/page.tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function HemPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <Typography variant="h5">Hem</Typography>
    </Box>
  );
}
```

- [ ] **Steg 3: Skapa app/(app)/chatt/page.tsx**

```tsx
// app/(app)/chatt/page.tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function ChattPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <Typography variant="h5">Chatt</Typography>
    </Box>
  );
}
```

- [ ] **Steg 4: Skapa app/(app)/karta/page.tsx**

```tsx
// app/(app)/karta/page.tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function KartaPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <Typography variant="h5">Karta</Typography>
    </Box>
  );
}
```

- [ ] **Steg 5: Skapa app/(app)/logbok/page.tsx**

```tsx
// app/(app)/logbok/page.tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function LogbokPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <Typography variant="h5">Logbok</Typography>
    </Box>
  );
}
```

- [ ] **Steg 6: Committa**

```bash
git add app/\(app\)/layout.tsx app/\(app\)/hem/page.tsx app/\(app\)/chatt/page.tsx app/\(app\)/karta/page.tsx app/\(app\)/logbok/page.tsx
git commit -m "feat: add protected app layout with BottomNav and placeholder pages"
```

---

## Task 12: Konfigurera PWA

**Files:**
- Modify: `next.config.ts`
- Create: `public/manifest.json`
- Create: `public/icon-192.png` (placeholder)
- Create: `public/icon-512.png` (placeholder)

- [ ] **Steg 1: Uppdatera next.config.ts**

```ts
// next.config.ts
import type { NextConfig } from 'next';

const withPWA = require('@ducanh2912/next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {};

module.exports = withPWA(nextConfig);
```

- [ ] **Steg 2: Skapa public/manifest.json**

```json
{
  "name": "Hooked",
  "short_name": "Hooked",
  "description": "Fiskeklubbens app — logga fångster, chatta och tävla",
  "theme_color": "#1B4332",
  "background_color": "#003566",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/hem",
  "scope": "/",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Steg 3: Lägg till manifest-länk i root layout**

Uppdatera `app/layout.tsx` metadata:

```tsx
export const metadata: Metadata = {
  title: 'Hooked',
  description: 'Fiskeklubbens app — logga fångster, chatta och tävla',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Hooked',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};
```

- [ ] **Steg 4: Skapa placeholder-ikoner**

Notera: Riktiga ikoner skapas i ett senare skede. Kör detta för att generera enkla placeholder-PNG:er:

```bash
# Kräver ImageMagick (convert). Hoppa över om det inte finns — ikonerna är valfria i dev.
convert -size 192x192 xc:#1B4332 public/icon-192.png 2>/dev/null || echo "ImageMagick saknas – skapa ikonerna manuellt"
convert -size 512x512 xc:#1B4332 public/icon-512.png 2>/dev/null || echo "ImageMagick saknas – skapa ikonerna manuellt"
```

- [ ] **Steg 5: Kör alla tester för att bekräfta inget är trasigt**

```bash
npm test
```

Förväntad output: Alla tester gröna.

- [ ] **Steg 6: Verifiera att appen bygger**

```bash
npm run build
```

Förväntad output: Ingen TypeScript- eller build-fel.

- [ ] **Steg 7: Committa och pusha**

```bash
git add next.config.ts public/manifest.json public/icon-192.png public/icon-512.png app/layout.tsx
git commit -m "feat: configure PWA manifest and next-pwa"
git push origin main
```

---

## Slutverifiering

När alla tasks är klara:

1. Starta dev-servern: `npm run dev`
2. Öppna `http://localhost:3000` — ska redirecta till `/login`
3. Testa registrering med en riktig e-post
4. Logga in — ska landa på `/hem` med bottom navigation synlig
5. Klicka igenom alla fyra tabbar — URL och highlighted tab ska stämma
6. Logga ut (manuellt via Supabase dashboard eller console) och testa middleware redirect

