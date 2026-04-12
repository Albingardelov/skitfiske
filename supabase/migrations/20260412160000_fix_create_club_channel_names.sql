-- Kör i SQL Editor om du redan deployat äldre create_club med allmant/rapporter som krockade med UNIQUE(name).
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

  insert into public.channels (club_id, name, label)
  values
    (v_club.id, v_club.id::text || ':allmant', 'Allmänt'),
    (v_club.id, v_club.id::text || ':rapporter', 'Rapporter');

  return v_club;
end;
$$;

grant execute on function public.create_club(text) to authenticated;
