# Statistik, Leaderboard & Mönsterinsikt — Designdokument

**Datum:** 2026-04-13
**Status:** Godkänd, redo för implementation

---

## Sammanfattning

Utnyttja befintlig fångstdata (art, vikt, bete, GPS, väder, tid) för att ge sötvattenfiskare
personliga mönsterinsikter och ett socialt leaderboard inom klubben. Ingen ny datastruktur
krävs — allt beräknas client-side från befintlig `catches`-tabell.

---

## Målgrupp

Sötvattenfiskare (gädda, abborre, öring) som är medlemmar i en fiskeklubb i appen.
Lika viktigt: personlig förbättring och det sociala i klubben.

---

## 1. Navigation & Placering

Statistiken lever som en **ny flik i Logbok-sidan**. Logbok får en toggle/tab-bar längst
upp med två val:

- **Logg** — befintlig listvy av fångster (nuvarande standardvy)
- **Statistik** — ny vy med personlig statistik + klubbleaderboard

Inga ändringar i bottennavet. Trycker man på mönsterinsikt-kortet på Hem-sidan
navigeras man till Logbok och Statistik-fliken öppnas automatiskt.

---

## 2. Personlig Statistik

### 2a. Säsongsöversikt (3 KPI-kort)

Tre kompakta kort på en rad längst upp i Statistik-fliken:

| Kort | Värde |
|------|-------|
| Fångster | Totalt antal denna säsong (1 jan–31 dec) |
| Tyngsta | Tyngsta fångsten i kg + art |
| Toppbete | Mest använda bete räknat i antal fångster |

Säsong = innevarande kalenderår.

### 2b. Rekord per art

Kollapsbar lista sorterad efter antal fångster (mest fångad art överst).
För varje art visas:
- Antal fångster totalt (alla tider)
- Tyngsta (kg)
- Längsta (cm)

Visar bara arter med minst 1 fångst. Max 8 arter visas innan "Visa fler"-knapp.

### 2c. Mönsterinsikter

2–3 insiktskort med konkret text. Varje insikt genereras från en specifik analys:

**Bästa tid på dygnet per art**
Delar upp fångster i fyra block: Morgon (05–10), Dag (10–17), Kväll (17–22), Natt (22–05).
Visar vilket block som ger flest fångster per art.
→ *"Du fångar mest gädda 05–10 på morgonen"*

**Bästa bete per art**
Vilket bete ger flest fångster per art.
→ *"Jigg ger dig 3× fler abborrar än andra beten"* (om tydlig vinnare finns, annars döljs)

**Bästa månad per art**
Vilken månad ger flest fångster för den art du fångar mest.
→ *"Din bästa månad för gädda är april"*

**Tröskel:** Minst 5 fångster av en art krävs för att en insikt ska visas.
Om ingen art når tröskeln visas: *"Logga fler fångster för att se dina mönster."*

---

## 3. Klubbleaderboard

Visas direkt under personlig statistik i samma Statistik-flik, separerat med rubrik
**"Klubben"**. Filtreras på `club_id` för aktiv klubb.

### 3a. Säsongens topplista

Rankar alla klubbmedlemmar efter antal fångster innevarande säsong.
- Plats (1, 2, 3…), avatar-initialer, namn, antal fångster
- Användarens egen rad är alltid synlig och markerad, oavsett placering
- Max 10 rader visas

### 3b. Klubbrekord per art

Klubbens tyngsta fångst per art (alla tider).
- Art, vikt (kg), fiskarens namn
- Sorterat efter vikt, max 5 arter

### 3c. Senaste stora

De 3 tyngsta fångsternas sista 30 dagar i hela klubben.
- Namn, art, vikt, datum
- Fungerar som ett socialt flöde — visar att det händer saker

---

## 4. Mönsterinsikt-kort på Hem

Ett nytt kort på `/hem`-sidan, placerat direkt under `HemHero`-komponenten.

**Innehåll:** Kontextuell insikt baserad på historiska fångster + aktuell tid och månad.
Matchar nuvarande timme mot användarens historiska toppblock, och nuvarande månad
mot bästa fångstmånad för sin toppart.

Exempel-text:
> **Bra förutsättningar för gädda**
> Du fångar mest gädda tidiga morgnar i april — precis som nu. Bete: jigg.

**Villkor för att visas:**
- Minst 5 fångster av en art i historiken
- Nuvarande timme matchar (±1 block) historisk topptid, ELLER nuvarande månad matchar historisk toppmånad
- Båda villkor behöver inte uppfyllas — ett räcker

**Om villkor inte uppfylls:** kortet visas inte. Inget tomt tillstånd.

Trycker man på kortet → navigerar till Logbok med Statistik-fliken aktiv.

---

## 5. Dataflöde & Prestanda

### Datakällor

Allt hämtas från befintlig Supabase `catches`-tabell. Inga nya tabeller eller RPC-funktioner.

### Hämtningsstrategi

**Personlig statistik:** Hämta alla fångster för `user_id` (ingen tidsbegränsning — behövs
för all-time rekord och mönster). Cacha resultatet i komponentens state; hämtas om när
fliken öppnas och data är äldre än 5 minuter.

**Leaderboard:** Hämta alla fångster för `club_id` innevarande år. Samma cache-logik.

**Mönsterinsikt-kort (Hem):** Återanvänder data som redan hämtas i `HemPage` om möjligt,
annars ett separat lättviktigt anrop vid mount.

### Beräkning

All aggregering sker i TypeScript-hjälpfunktioner i `lib/stats/`:
- `computePersonalStats(catches)` → säsongsöversikt + rekord per art
- `computePatternInsights(catches)` → mönsterinsikter
- `computeLeaderboard(catches)` → topplista + klubbrekord + senaste stora
- `computeHomeInsight(catches, now)` → kontextuell insikt för Hem-kortet

Rena funktioner utan sido-effekter — lätta att enhetstesta.

### Felhantering

Om Supabase-anropet misslyckas: visa ett diskret felmeddelande ("Kunde inte ladda
statistik") med en "Försök igen"-knapp. Statistikfliken blockerar inte Logg-fliken.

---

## 6. Komponenter (ny kod)

| Komponent | Plats | Ansvar |
|-----------|-------|--------|
| `LogbokTabs` | `components/logbok/` | Tab-toggle Logg/Statistik |
| `StatistikView` | `components/logbok/` | Samlingsvyn för all statistik |
| `SeasonKpiRow` | `components/stats/` | 3 KPI-kort på rad |
| `SpeciesRecordList` | `components/stats/` | Rekord per art |
| `PatternInsightCards` | `components/stats/` | Mönsterinsikts-kort |
| `ClubLeaderboard` | `components/stats/` | Topplista + rekord + senaste |
| `HomeInsightCard` | `components/home/` | Insiktskort på Hem |
| `lib/stats/index.ts` | `lib/stats/` | Alla beräkningsfunktioner |

---

## 7. Vad som inte ingår

- Push-notiser när någon sätter nytt klubbrekord (möjlig v2)
- Historiska säsonger (jämföra 2024 vs 2025) — v2
- Karta-integration med statistik — v2
- Exportera statistik som PDF/CSV — v2
