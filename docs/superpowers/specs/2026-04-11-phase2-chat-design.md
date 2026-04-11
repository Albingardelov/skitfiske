# Phase 2: Real-time Club Chat — Design Spec

**Projekt:** Hooked – Fishing Club PWA  
**Datum:** 2026-04-11  
**Stack:** Next.js 16 (App Router) + TypeScript + MUI v9 + Supabase Realtime + Supabase Storage  

---

## 1. Databas

### Tabell: `channels`

Seedad en gång vid setup — ändras aldrig i applikationen.

| Kolumn | Typ | Notering |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| name | text | Slug: "allmant", "fangster", "utrustning" |
| label | text | Visningsnamn: "Allmänt", "Fångster", "Utrustning" |

**Seed-data:**
```sql
INSERT INTO channels (name, label) VALUES
  ('allmant', 'Allmänt'),
  ('fangster', 'Fångster'),
  ('utrustning', 'Utrustning');
```

### Tabell: `messages`

| Kolumn | Typ | Notering |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| channel_id | uuid | FK → channels.id |
| user_id | uuid | FK → auth.users.id |
| full_name | text | Kopieras från user_metadata.full_name vid insert |
| content | text | Nullable (meddelande kan vara enbart foto) |
| image_url | text | Nullable (publik URL till Supabase Storage) |

> **Constraint:** `content` och `image_url` kan inte båda vara null — minst ett måste ha ett värde. Hanteras i `MessageInput` (skicka-knappen är disabled om båda är tomma).
| created_at | timestamptz | default now() |

### RLS-regler för `messages`

```sql
-- Alla autentiserade användare kan läsa
CREATE POLICY "Authenticated users can read messages"
ON messages FOR SELECT
TO authenticated
USING (true);

-- Användare kan bara skapa meddelanden med sitt eget user_id
CREATE POLICY "Users can insert own messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

Ingen UPDATE eller DELETE i denna fas.

### RLS-regler för `channels`

```sql
-- Alla autentiserade användare kan läsa kanaler
CREATE POLICY "Authenticated users can read channels"
ON channels FOR SELECT
TO authenticated
USING (true);
```

### Supabase Storage

- Bucket: `chat-images` (public)
- Filsökväg: `[user_id]/[timestamp].[extension]`
- RLS: autentiserade användare kan ladda upp till sin egen mapp

```sql
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view chat images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat-images');
```

---

## 2. Filstruktur

```
app/(app)/chatt/
  page.tsx              ← Chatt-sidan (hämtar kanaler, hanterar aktiv kanal)

components/chat/
  ChatTabs.tsx          ← MUI Tabs för kanalval
  MessageList.tsx       ← Scrollbar lista med meddelanden, auto-scroll
  MessageBubble.tsx     ← Enskilt meddelande (text och/eller foto)
  MessageInput.tsx      ← Textfält + fotoknapp + skicka-knapp

hooks/
  useChat.ts            ← Supabase Realtime + optimistic UI + fotouppladdning

lib/supabase/
  chat.ts               ← DB-queries: fetchMessages, insertMessage, uploadImage
```

---

## 3. UI-layout

```
┌─────────────────────────────────┐
│ Allmänt │ Fångster │ Utrustning │  ← sticky top, MUI Tabs
├─────────────────────────────────┤
│                                 │
│  [Namn]  10:23                  │  ← andras meddelanden (vänster)
│  Hej allihopa!                  │
│                                 │
│              [Namn]  10:25      │  ← egna meddelanden (höger, orange)
│              God fångst!        │
│                                 │
│  [foto]                         │  ← bildbubblor
│                                 │
│                                 │
├─────────────────────────────────┤
│ [📷]  Skriv meddelande...  [➤]  │  ← sticky bottom input
└─────────────────────────────────┘
```

**Meddelandebubblor:**
- Egna: höger-justerade, `primary.main` (#FB8500) bakgrund
- Andras: vänster-justerade, `paper` (#004080) bakgrund, avsändarnamn + tid visas
- Foton: max-width 240px, rounded corners, klickbara (öppnar i fullscreen i senare fas)

**Input-fält:**
- MUI `TextField` med `multiline` (max 4 rader)
- Kameraikon (Lucide `Camera`) till vänster → triggar `<input type="file" accept="image/*" capture="environment">`
- Skicka-knapp (Lucide `Send`) till höger, disabled om tomt + ingen bild
- Keyboard-aware: `paddingBottom` justeras när tangentbordet är öppet (CSS `env(safe-area-inset-bottom)`)

---

## 4. Realtid & dataflöde (`useChat`)

### Prenumeration
```
mountEffect:
  → fetchMessages(channelId, limit=50)
  → subscribe to realtime INSERT on messages WHERE channel_id = channelId
  → on new message: append to list
  → return cleanup: unsubscribe
```

### Kanalyte
Vid byte av aktiv kanal: avprenumerera gammal kanal, prenumerera ny, töm meddelandelistan.

### Optimistic UI
1. Skapa temporärt meddelande med `id: 'optimistic-[timestamp]'`, `status: 'pending'`
2. Lägg till i lokal state direkt
3. Skicka `insertMessage()` till Supabase
4. Vid lyckat insert: Realtime-eventet ersätter det optimistiska meddelandet
5. Vid fel: markera meddelandet med `status: 'error'`, visa retry-knapp

### Auto-scroll
- `useRef` på en tom `div` längst ner i meddelandelistan
- `useEffect` watchtar `messages.length` → `ref.current?.scrollIntoView({ behavior: 'smooth' })`
- Scrollar bara automatiskt om användaren inte scrollat upp mer än 200px (scroll-position check)

### Fotouppladdning
1. Fil väljs via `<input type="file">`
2. Validering: max 5MB, `image/*`
3. Upload till `chat-images/[user_id]/[timestamp].[ext]` via Supabase Storage
4. Public URL returneras → sätts som `image_url` i meddelandet
5. Text och foto kan kombineras i samma meddelande

---

## 5. Komponenter

### `ChatTabs`
- Props: `channels`, `activeChannelId`, `onChannelChange`
- MUI `Tabs` + `Tab`, variant="scrollable" för framtida expansion
- Sticky top (position: sticky, top: 0, zIndex: 10)

### `MessageList`
- Props: `messages`, `currentUserId`
- Scrollbar container med `overflow-y: auto`
- Renderar `MessageBubble` per meddelande
- Auto-scroll-ref längst ner

### `MessageBubble`
- Props: `message`, `isOwn: boolean`
- Visar: avsändarnamn (om inte egna), tid, text, foto
- Optimistiska meddelanden: lätt genomskinliga med spinner
- Felmeddelanden: röd border med retry-ikon

### `MessageInput`
- Props: `onSend(content, imageFile)`, `disabled`
- Hanterar: textstate, vald bildfil, preview av vald bild
- Skickar via callback, rensar state efter skickat

### `useChat(channelId)`
- Returnerar: `{ messages, sendMessage, isLoading, error }`
- Hanterar: Realtime-subscription, optimistic updates, fotouppladdning

---

## 6. Testning

- `MessageBubble`: renderar korrekt för egna vs andras meddelanden
- `MessageInput`: disabled-state, callback anropas med rätt data
- `useChat`: mockar Supabase-klienten, testar optimistic append och Realtime-handler
