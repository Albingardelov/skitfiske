# Phase 4: Karta (Map) — Design Spec

**Projekt:** Hooked – Fishing Club PWA  
**Datum:** 2026-04-11  
**Stack:** Next.js 16 (App Router) + TypeScript + MUI v9 + Leaflet + react-leaflet + Supabase  

---

## 1. Syfte

Kartsidan visar fångstplatser som markörers på en interaktiv karta. Användaren kan:
- Växla mellan sina egna och alla klubbmedlemmars fångster
- Se detaljer om en fångst via popup
- Klicka på kartan (eller trycka på FAB) för att registrera en ny fångst med koordinaterna förifyllda

---

## 2. Paket

```bash
npm install leaflet react-leaflet @types/leaflet
```

Leaflet kräver `window` och kan inte rendera på servern. Kartkomponenten importeras alltid med `dynamic(() => import(...), { ssr: false })` i Next.js 16.

---

## 3. Filstruktur

```
components/map/CatchMap.tsx           — Leaflet MapContainer, TileLayer, GPS-position, dynamiskt importerad
components/map/CatchMarkerLayer.tsx   — Markörers med popup, hanterar kartklick via useMapEvents
app/(app)/karta/page.tsx              — Filter-state, fetch, dynamisk import av CatchMap, FAB
app/(app)/logbok/ny/page.tsx          — Ändring: läser ?lat och ?lng från useSearchParams
```

---

## 4. UI-layout

```
┌─────────────────────────────────┐
│  [Mina] [Alla]                  │  ← MUI ToggleButtonGroup (position:absolute, top:8px, left:8px, zIndex:1000)
│                                 │
│         🐟                      │  ← Leaflet Marker (fångst)
│   🐟                            │
│              🐟                 │
│       📍                        │  ← Blå CircleMarker (användarens GPS)
│                                 │
│                           ⊕     │  ← MUI Fab (position:fixed, bottom:80px, right:16px)
└─────────────────────────────────┘
```

**Karthöjd:** `calc(100vh - 64px)` (tar hela skärmen minus BottomNav).

**Startposition:** Sverige centrum — lat: 62.0, lng: 15.0, zoom: 5. Zoomar automatiskt till användarens position om GPS finns.

**Tiles:** OpenStreetMap — `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`

---

## 5. Markör-popup

Klick på en fångstmarkör visar:

```
┌──────────────────────┐
│ Gädda                │  ← species
│ 2.4 kg · 58 cm       │  ← weight_kg + length_cm
│ Mälaren              │  ← location_text (om finns)
│ 11 apr 2026 10:23    │  ← caught_at formaterat sv-SE
│ [bild 120px bred]    │  ← image_url (om finns)
└──────────────────────┘
```

Bara fångster med `lat !== null && lng !== null` visas som markörers.

---

## 6. Komponenter

### `CatchMap.tsx`

```
Props:
  catches: Catch[]
  onMapClick: (lat: number, lng: number) => void

Ansvar:
  - Renderar Leaflet MapContainer med OpenStreetMap TileLayer
  - Hämtar användarens GPS via navigator.geolocation och visar blå CircleMarker
  - Renderar CatchMarkerLayer
  - Höjd: 100% (fylls av förälderns calc(100vh - 64px))
```

### `CatchMarkerLayer.tsx`

```
Props:
  catches: Catch[]
  onMapClick: (lat: number, lng: number) => void

Ansvar:
  - Renderar Marker + Popup per fångst (bara de med lat/lng)
  - Lyssnar på kartklick via useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) })
```

### `app/(app)/karta/page.tsx`

```
State:
  filter: 'mine' | 'all'
  catches: Catch[]
  isLoading: boolean
  userId: string
  fabLat: number | null   ← sätts av onMapClick, används av FAB
  fabLng: number | null

Beteende:
  - useEffect: hämtar userId från Supabase auth
  - useEffect: fetchMyCatches(userId) eller fetchAllCatches() när filter/userId ändras
  - MUI ToggleButtonGroup med "Mina" / "Alla"
  - Dynamisk import av CatchMap med { ssr: false }
  - FAB: navigerar till /logbok/ny?lat=X&lng=Y (om fabLat finns) eller /logbok/ny
```

### `app/(app)/logbok/ny/page.tsx` — ändring

```
Tillägg i useEffect (mount):
  const searchParams = useSearchParams()
  const qLat = searchParams.get('lat')
  const qLng = searchParams.get('lng')
  if (qLat && qLng) {
    setLat(parseFloat(qLat))
    setLng(parseFloat(qLng))
    setLocationText('Karta-position')
  }
```

`useSearchParams` kräver att komponenten är wrappat i `<Suspense>` — se implementationsnoter nedan.

---

## 7. Navigationsflöde

**Klick på tom kartyta:**
`onMapClick(lat, lng)` → sätter `fabLat`/`fabLng` i page-state → FAB-länken uppdateras

**Klick på FAB:**
- Om `fabLat` finns: `router.push('/logbok/ny?lat=X&lng=Y')`
- Annars: `router.push('/logbok/ny')`

**`/logbok/ny` vid öppning med query params:**
- Läser `?lat` och `?lng` via `useSearchParams`
- Sätter `lat`, `lng`, `locationText = 'Karta-position'`
- GPS-knappen visar redan "GPS-position hämtad" (eftersom lat är satt)

---

## 8. Implementationsnoter

### Leaflet CSS
Leaflet kräver sin CSS för att markörers och popups ska renderas korrekt. Importera i `CatchMap.tsx`:
```ts
import 'leaflet/dist/leaflet.css';
```

### Leaflet default icon fix
Leaflet's standardmarkör fungerar inte med webpack utan en fix:
```ts
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
```

### useSearchParams + Suspense
`useSearchParams()` i Next.js 16 kräver att komponenten är wrappat i `<Suspense>`. I `logbok/ny/page.tsx` löses det genom att extrahera en `NyFangstForm`-komponent som använder `useSearchParams`, och exportera en `NyFangstPage` som wrappar den i `<Suspense>`.

### Dynamisk import
```ts
// app/(app)/karta/page.tsx
const CatchMap = dynamic(() => import('@/components/map/CatchMap'), { ssr: false });
```

---

## 9. Testning

Leaflet kräver DOM + canvas och är opraktiskt att enhetstesta. Inga komponenttester skrivs för kartkomponenterna. Verifieras manuellt:

1. Kartan laddas och visar OpenStreetMap-tiles
2. Markörers visas för fångster med GPS-koordinater
3. Klick på markör visar popup med korrekt data
4. Toggle Mina/Alla byter markörerna
5. Klick på karta → FAB-länken uppdateras → formuläret öppnas med koordinaterna
6. Blå prick visas på användarens position (om GPS tillåts)
