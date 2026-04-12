-- Fiskeklubbar: tabeller, RLS och RPC för skapa / gå med.
-- Kör hela filen i Supabase SQL Editor (en gång).

-- ---------------------------------------------------------------------------
-- Väderkolumner på fångster (om de inte redan finns)
-- ---------------------------------------------------------------------------

alter table public.catches
  add column if not exists sea_surface_temp_c double precision,
  add column if not exists air_temp_c double precision;

comment on column public.catches.sea_surface_temp_c is 'Modellerad havs-/ytvatten-temp (°C), t.ex. Open-Meteo marine.';
comment on column public.catches.air_temp_c is 'Lufttemperatur vid platsen (°C), t.ex. Open-Meteo forecast.';

-- ---------------------------------------------------------------------------
-- Tabeller
-- ---------------------------------------------------------------------------

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 2),
  slug text not null unique,
  invite_code text not null unique,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.club_members (
  club_id uuid not null references public.clubs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (club_id, user_id)
);

create index if not exists club_members_user_id_idx on public.club_members (user_id);

alter table public.catches
  add column if not exists club_id uuid references public.clubs (id) on delete cascade;

alter table public.channels
  add column if not exists club_id uuid references public.clubs (id) on delete cascade;

create index if not exists catches_club_id_idx on public.catches (club_id);
create index if not exists channels_club_id_idx on public.channels (club_id);

-- ---------------------------------------------------------------------------
-- RPC: skapa klubb (admin + standardkanaler)
-- ---------------------------------------------------------------------------

create or replace function public.create_club(p_name text)
returns public.clubs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_club public.clubs;
  v_base text;
  v_slug text;
  v_code text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  v_base := lower(regexp_replace(trim(p_name), '[^a-zA-Z0-9åäöÅÄÖ]+', '-', 'g'));
  if v_base = '' then
    v_base := 'klubb';
  end if;
  v_slug := v_base || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.clubs (name, slug, invite_code, created_by)
  values (trim(p_name), v_slug, v_code, auth.uid())
  returning * into v_club;

  insert into public.club_members (club_id, user_id, role)
  values (v_club.id, auth.uid(), 'admin');

  -- Unikt `name` per rad (många scheman har UNIQUE på name globalt — undvik kollision mellan klubbar).
  insert into public.channels (club_id, name, label)
  values
    (v_club.id, v_club.id::text || ':allmant', 'Allmänt'),
    (v_club.id, v_club.id::text || ':rapporter', 'Rapporter');

  return v_club;
end;
$$;

grant execute on function public.create_club(text) to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: gå med via kod
-- ---------------------------------------------------------------------------

create or replace function public.join_club_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_club_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  select c.id into v_club_id
  from public.clubs c
  where c.invite_code = upper(trim(p_code))
  limit 1;
  if v_club_id is null then
    raise exception 'invalid_code';
  end if;
  insert into public.club_members (club_id, user_id, role)
  values (v_club_id, auth.uid(), 'member')
  on conflict (club_id, user_id) do nothing;
  return v_club_id;
end;
$$;

grant execute on function public.join_club_by_code(text) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.clubs enable row level security;
alter table public.club_members enable row level security;

drop policy if exists "clubs_select_member" on public.clubs;
create policy "clubs_select_member"
  on public.clubs for select
  using (
    exists (
      select 1 from public.club_members m
      where m.club_id = clubs.id and m.user_id = auth.uid()
    )
  );

drop policy if exists "club_members_select_own" on public.club_members;
create policy "club_members_select_own"
  on public.club_members for select
  using (user_id = auth.uid());

alter table public.catches enable row level security;

drop policy if exists "catches_select_own_or_club" on public.catches;
create policy "catches_select_own_or_club"
  on public.catches for select
  using (
    user_id = auth.uid()
    or (
      club_id is not null
      and exists (
        select 1 from public.club_members m
        where m.club_id = catches.club_id and m.user_id = auth.uid()
      )
    )
  );

drop policy if exists "catches_insert_member" on public.catches;
create policy "catches_insert_member"
  on public.catches for insert
  with check (
    user_id = auth.uid()
    and club_id is not null
    and exists (
      select 1 from public.club_members m
      where m.club_id = catches.club_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "catches_update_own" on public.catches;
create policy "catches_update_own"
  on public.catches for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "catches_delete_own" on public.catches;
create policy "catches_delete_own"
  on public.catches for delete
  using (user_id = auth.uid());

alter table public.channels enable row level security;

drop policy if exists "channels_select" on public.channels;
create policy "channels_select"
  on public.channels for select
  using (
    club_id is null
    or exists (
      select 1 from public.club_members m
      where m.club_id = channels.club_id and m.user_id = auth.uid()
    )
  );

alter table public.messages enable row level security;

drop policy if exists "messages_select" on public.messages;
create policy "messages_select"
  on public.messages for select
  using (
    exists (
      select 1 from public.channels ch
      where ch.id = messages.channel_id
      and (
        ch.club_id is null
        or exists (
          select 1 from public.club_members m
          where m.club_id = ch.club_id and m.user_id = auth.uid()
        )
      )
    )
  );

drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own"
  on public.messages for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.channels ch
      where ch.id = messages.channel_id
      and (
        ch.club_id is null
        or exists (
          select 1 from public.club_members m
          where m.club_id = ch.club_id and m.user_id = auth.uid()
        )
      )
    )
  );

drop policy if exists "messages_update_own" on public.messages;
create policy "messages_update_own"
  on public.messages for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "messages_delete_own" on public.messages;
create policy "messages_delete_own"
  on public.messages for delete
  using (user_id = auth.uid());
