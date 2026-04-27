# Skitfiske 🎣

En modern fiskeapp byggd som en progressiv webbapp (PWA). Håll koll på dina fångster, hitta bra fiskevatten på kartan, chatta med andra fiskare och för en digital logbok — allt i en och samma app.

**[skitfiske-rust.vercel.app](https://skitfiske-rust.vercel.app)**

---

## Funktioner

- **Fångstlogbok** — logga och spara dina fångster med art, vikt, mått och plats
- **Interaktiv karta** — se fiskevatten och dina inloggade fångster på kartan
- **Artregister** — sök upp fiskarter med information och bilder
- **Chatt** — realtidschatt för att dela tips med andra fiskare
- **Klubb** — gå med i eller hantera en fiskeklubb
- **Statistik** — se din fångsthistorik och personliga rekord
- **PWA** — installeras som en app på mobilen, fungerar offline

## Tech stack

| Kategori | Teknik |
|---|---|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19, TypeScript, MUI v9 |
| Backend & Auth | Supabase (Postgres, RLS, Realtime) |
| Karta | Leaflet + react-leaflet |
| Deploy | Vercel |
| PWA | next-pwa |

## Kom igång lokalt

```bash
git clone https://github.com/AlbinGardelov/skitfiske
cd skitfiske
npm install
```

Skapa en `.env.local` med dina Supabase-nycklar:

```env
NEXT_PUBLIC_SUPABASE_URL=din-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=din-nyckel
```

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).
