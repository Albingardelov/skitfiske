# Design: Visa fångstvikt i gram istället för kg

**Datum:** 2026-04-20

## Bakgrund

Fångstvikter registreras och visas idag i kg. Användaren vill att UI:t ska acceptera och visa gram istället. Databasen ändras inte — `weight_kg`-kolumnen i Supabase behålls som den är.

## Beslut

Konvertering sker enbart i UI:t (approach A — central hjälpfunktion):

- En ny formateringsfunktion `formatWeightG(kg: number)` ersätter `formatWeightSv` i `CatchCard.tsx`. Den multiplicerar `kg × 1000` och returnerar en sträng med "g"-suffix (t.ex. `"1 250 g"`), formaterat med `sv-SE`-locale.
- Registreringsformuläret tar emot gram från användaren och dividerar med 1000 innan det sparas (`weight_kg: parsedGrams / 1000`).
- Alla visningsställen uppdateras att visa gram.

## Filer att ändra

| Fil | Ändring |
|-----|---------|
| `components/catch/CatchCard.tsx` | Byt `formatWeightSv` → `formatWeightG`, uppdatera inline `{c.weight_kg} kg` |
| `app/(app)/logbok/ny/page.tsx` | Label "Vikt (g)", `step="1"`, dividera med 1000 vid sparning |
| `components/map/CatchMarkerLayer.tsx` | `{c.weight_kg * 1000} g` |
| `components/home/SeasonPerformanceSection.tsx` | `{heavy.weight_kg * 1000} g` |
| `components/stats/SeasonKpiRow.tsx` | `${stats.heaviestCatch.weightKg * 1000} g` |
| `components/stats/ClubLeaderboard.tsx` | `{rec.weightKg * 1000} g`, `{c.weightKg * 1000} g` |
| `components/stats/SpeciesRecordList.tsx` | `{rec.heaviestKg * 1000} g` |
| `app/(app)/logbok/[id]/page.tsx` | `{catch_.weight_kg * 1000} g` |

## Vad ändras inte

- Supabase-kolumnen `weight_kg` — ingen migration
- TypeScript-typer (`weight_kg: number`) — fortfarande kg internt
- Interna variabelnamn i stats-logik
- Tester som inte testar viktformatering direkt
