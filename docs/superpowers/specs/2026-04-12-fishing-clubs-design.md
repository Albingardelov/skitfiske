# Fiskeklubbar (multi-tenant) — design

## Mål

Flera oberoende klubbar ska kunna använda samma app: egen fångstfeed per klubb, skapa klubb, gå med via kod, och tydlig **aktiv klubb** i UI.

## Datamodell

- **`clubs`**: `id`, `name`, `slug` (unik), `invite_code` (unik, kort), `created_by`, `created_at`.
- **`club_members`**: `club_id`, `user_id`, `role` (`admin` | `member`), `joined_at`. Primärnyckel `(club_id, user_id)`.
- **`catches`**: kolumn **`club_id`** (FK → `clubs`, `NOT NULL` för nya rader efter migration).
- **`channels`**: kolumn **`club_id`** (FK, kan vara `NULL` för befintliga rader tills migrerat).

## Åtkomst (Supabase)

- **RLS** på `clubs`, `club_members`, `catches` (och anpassade policies för `channels`/`messages` där det behövs).
- **`create_club(name)`** och **`join_club_by_code(code)`** som `SECURITY DEFINER`-funktioner så skapande och kod-inträde sker atomärt och säkert utan öppna insert-policies.

## Klient

- **`ClubContext`**: laddar användarens klubbar, **aktiv klubb** (persist i `localStorage`), `createClub`, `joinClub`.
- **`fetchClubCatches(clubId)`** ersätter global `fetchAllCatches()` för klubb-vyer.
- **Onboarding**: om användaren saknar klubb → omdirigering till `/klubb` (skapa eller gå med).
- **Registrera fångst**: `club_id` från aktiv klubb.

## Ytterligare (senare)

- Bjud in e-post, roller per kanal, byta klubb i header överallt, migrera `NULL` `channels.club_id` till en standardklubb.
