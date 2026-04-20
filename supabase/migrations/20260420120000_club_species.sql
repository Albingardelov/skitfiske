-- club_species: klubbspecifika fiskar utöver den globala baslistan
create table if not exists public.club_species (
  id         uuid primary key default gen_random_uuid(),
  club_id    uuid not null references public.clubs(id) on delete cascade,
  name       text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (club_id, lower(name))
);

alter table public.club_species enable row level security;

-- Alla klubbmedlemmar kan läsa
create policy "club_species_select"
  on public.club_species for select
  using (
    exists (
      select 1 from public.club_members
      where club_members.club_id = club_species.club_id
        and club_members.user_id = auth.uid()
    )
  );

-- Alla klubbmedlemmar kan lägga till
create policy "club_species_insert"
  on public.club_species for insert
  with check (
    auth.uid() = created_by
    and exists (
      select 1 from public.club_members
      where club_members.club_id = club_species.club_id
        and club_members.user_id = auth.uid()
    )
  );

-- Bara skaparen kan ta bort
create policy "club_species_delete"
  on public.club_species for delete
  using (created_by = auth.uid());
