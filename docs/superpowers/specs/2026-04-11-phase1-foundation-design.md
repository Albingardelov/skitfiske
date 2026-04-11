# Phase 1: Foundation & Theme — Design Spec

**Projekt:** Hooked – Fishing Club PWA  
**Datum:** 2026-04-11  
**Stack:** Next.js (App Router) + TypeScript + MUI + Supabase + @ducanh2912/next-pwa  
**Pakethanterare:** npm  
**Språk:** Svenska  

---

## 1. Projektstruktur

```
app/
  (auth)/
    login/page.tsx
    registrera/page.tsx
    glomt-losenord/page.tsx
  (app)/
    layout.tsx          ← App-skal med bottom nav (kräver inloggning)
    hem/page.tsx        ← Platshållare
    chatt/page.tsx      ← Platshållare
    karta/page.tsx      ← Platshållare
    logbok/page.tsx     ← Platshållare
  layout.tsx            ← Root layout (MUI ThemeProvider, Supabase)
  page.tsx              ← Redirect → /hem eller /login
middleware.ts           ← Skyddar (app)-rutter, redirectar oautentiserade

lib/
  supabase/
    client.ts           ← Browser-klient
    server.ts           ← Server-klient (för Server Components)
  theme.ts              ← MUI-tema

components/
  navigation/
    BottomNav.tsx
```

Route groups (`(auth)` och `(app)`) separerar autentiserade och publika sidor utan att påverka URL-strukturen.

---

## 2. MUI-tema (`lib/theme.ts`)

### Palett
| Token | Färg | Användning |
|---|---|---|
| `primary.main` | `#FB8500` | CTA-knappar, aktiv tab |
| `secondary.main` | `#1B4332` | Accenter |
| `background.default` | `#003566` | Sidans bakgrund |
| `text.primary` | `#FFFFFF` | Huvudtext |
| `text.secondary` | `#F1F1F1` | Sekundär text |

### Komponent-overrides
- **Button:** `minHeight: 48px`, ökad `padding` för stora touchytor
- **TextField:** ökad `padding`, tydlig border för solljussynlighet
- **borderRadius:** `12px` globalt

### Typografi
- System default-font (ingen extern font-fetch för PWA-prestanda)
- Rubriker: `fontWeight: 700`, generöst radavstånd

### Kontrast
Alla text/bakgrund-kombinationer uppfyller minst 4.5:1 (WCAG AA).

---

## 3. Supabase Auth-flöde

### Autentiseringsmetod
E-post + lösenord via Supabase Auth.

### Sidor

**`/login`**
- Fält: E-post, Lösenord
- Knapp: "Logga in" (primary, full bredd)
- Länkar: "Registrera dig", "Glömt lösenord?"
- Vid lyckat login: redirect → `/hem`

**`/registrera`**
- Fält: Namn, E-post, Lösenord, Bekräfta lösenord
- Namn sparas som `user_metadata.full_name` i Supabase Auth (ingen separat profiles-tabell i Phase 1)
- Supabase skapar konto + skickar bekräftelsemejl
- Vid lyckat submit: bekräftelsemeddelande (ingen redirect)

**`/glomt-losenord`**
- Fält: E-post
- Supabase skickar återställningslänk
- Vid lyckat submit: bekräftelsemeddelande

### Middleware (`middleware.ts`)
- Använder Supabase SSR-klient för sessionskontroll
- Oautentiserade → `/login`
- Inloggade på auth-sidor → `/hem`

---

## 4. App-skal & Bottom Navigation

### `app/(app)/layout.tsx`
Wrapprar alla skyddade sidor. Renderar `BottomNav` och sätter `paddingBottom` på innehållsytan.

### `BottomNav.tsx`

| Ikon (Lucide) | Label | Route |
|---|---|---|
| `Home` | Hem | `/hem` |
| `MessageCircle` | Chatt | `/chatt` |
| `MapPin` | Karta | `/karta` |
| `BookOpen` | Logbok | `/logbok` |

- `position: fixed`, bottom: 0
- Aktiv tab: `#FB8500`
- `minHeight: 64px`

### Platshållarsidor
`/hem`, `/chatt`, `/karta`, `/logbok` visar enbart sidnamnet centrerat. Byggs ut i Phase 2–4.

---

## 5. PWA-manifest

```json
{
  "name": "Hooked",
  "short_name": "Hooked",
  "theme_color": "#1B4332",
  "background_color": "#003566",
  "display": "standalone",
  "start_url": "/hem"
}
```

Konfigureras via `@ducanh2912/next-pwa` i `next.config.ts`.

---

## 6. Miljövariabler (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`.env.local` läggs i `.gitignore`. Aldrig committas.
