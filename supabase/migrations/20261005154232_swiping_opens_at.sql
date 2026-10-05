-- Pozastavení swipování: tým nastaví, odkdy jde swipovat (výchozí 16. 10. 2026 00:00 české zóny).
-- Do té doby get_deck a swipe odmítnou (GU025) a aplikace místo balíčku ukáže kartu s datem otevření.
create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
create policy "app_settings: read" on public.app_settings for select to authenticated using (true);
grant select on public.app_settings to authenticated;

insert into public.app_settings (key, value)
values ('swiping_opens_at', to_jsonb((timestamp '2026-10-16 00:00' at time zone 'Europe/Prague')::text))
on conflict (key) do update set value = excluded.value, updated_at = now();

-- Odkdy jde swipovat (null = hned)
create or replace function public.swiping_opens_at()
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select nullif(s.value #>> '{}', '')::timestamptz from public.app_settings s where s.key = 'swiping_opens_at';
$$;

-- Nastavení týmem: čas v zadané zóně, null = otevřít hned
create or replace function public.admin_set_swiping_opens_at(p_local timestamp, p_time_zone text default 'Europe/Prague')
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  insert into public.app_settings (key, value)
  values ('swiping_opens_at', coalesce(to_jsonb((p_local at time zone p_time_zone)::text), 'null'::jsonb))
  on conflict (key) do update set value = excluded.value, updated_at = now();
end;
$$;

revoke execute on function public.swiping_opens_at(), public.admin_set_swiping_opens_at(timestamp, text) from public, anon;
grant execute on function public.swiping_opens_at(), public.admin_set_swiping_opens_at(timestamp, text) to authenticated;

-- Balíček karet: navíc kontrola, že je swipování otevřené
create or replace function public.get_deck(p_event_id uuid, p_limit integer default 20)
returns table (id uuid, display_name text, age integer, gender public.gender, bio text, photos text[])
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_me  public.profiles;
begin
  if not exists (
    select 1 from public.event_attendees a
    where a.event_id = p_event_id and a.user_id = v_uid
  ) then
    raise exception 'Nejsi na téhle akci.' using errcode = 'GU004';
  end if;
  if not public.event_is_open(p_event_id) then
    raise exception 'Tahle akce už skončila.' using errcode = 'GU003';
  end if;
  if now() < coalesce(public.swiping_opens_at(), now()) then
    raise exception 'Swipování se otevře %.', to_char(public.swiping_opens_at() at time zone 'Europe/Prague', 'DD. MM. YYYY HH24:MI') using errcode = 'GU025';
  end if;

  select p.* into v_me from public.profiles p where p.id = v_uid;
  if not found then
    raise exception 'Nejdřív si vyplň profil.' using errcode = 'GU001';
  end if;

  return query
    select
      p.id,
      p.display_name,
      date_part('year', age(p.birthdate))::int,
      p.gender,
      p.bio,
      p.photos
    from public.event_attendees a
    join public.profiles p on p.id = a.user_id
    where a.event_id = p_event_id
      and a.visible
      and p.id <> v_uid
      and cardinality(p.photos) > 0
      and p.gender = any (v_me.interested_in)
      and v_me.gender = any (p.interested_in)
      and not exists (
        select 1 from public.swipes s
        where s.swiper_id = v_uid and s.swipee_id = p.id
      )
      and not exists (
        select 1 from public.matches m
        where m.user_a = least(v_uid, p.id) and m.user_b = greatest(v_uid, p.id)
      )
      and not exists (
        select 1 from public.reports r
        where (r.reporter_id = v_uid and r.reported_id = p.id)
           or (r.reporter_id = p.id and r.reported_id = v_uid)
      )
    order by random()
    limit least(greatest(coalesce(p_limit, 20), 1), 50);
end;
$$;

-- Swipe: navíc kontrola, že je swipování otevřené
create or replace function public.swipe(p_event_id uuid, p_target uuid, p_liked boolean)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_match uuid;
begin
  if v_uid is null then
    raise exception 'Nejsi přihlášený.' using errcode = 'GU401';
  end if;
  if p_target is null or p_target = v_uid then
    raise exception 'Tenhle profil už není k dispozici.' using errcode = 'GU005';
  end if;
  if not public.event_is_open(p_event_id) then
    raise exception 'Tahle akce už skončila.' using errcode = 'GU003';
  end if;
  if now() < coalesce(public.swiping_opens_at(), now()) then
    raise exception 'Swipování se otevře %.', to_char(public.swiping_opens_at() at time zone 'Europe/Prague', 'DD. MM. YYYY HH24:MI') using errcode = 'GU025';
  end if;
  if not exists (
    select 1 from public.event_attendees a
    where a.event_id = p_event_id and a.user_id = v_uid
  ) then
    raise exception 'Nejsi na téhle akci.' using errcode = 'GU004';
  end if;
  if not exists (
    select 1 from public.event_attendees a
    where a.event_id = p_event_id and a.user_id = p_target and a.visible
  ) then
    raise exception 'Tenhle profil už není k dispozici.' using errcode = 'GU005';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(least(v_uid, p_target)::text || greatest(v_uid, p_target)::text, 0)
  );

  insert into public.swipes (swiper_id, swipee_id, event_id, liked)
  values (v_uid, p_target, p_event_id, p_liked)
  on conflict (swiper_id, swipee_id) do nothing;

  if exists (
       select 1 from public.swipes s
       where s.swiper_id = v_uid and s.swipee_id = p_target and s.liked
     )
     and exists (
       select 1 from public.swipes s
       where s.swiper_id = p_target and s.swipee_id = v_uid and s.liked
     )
  then
    insert into public.matches (user_a, user_b, event_id)
    values (least(v_uid, p_target), greatest(v_uid, p_target), p_event_id)
    on conflict on constraint matches_pair do nothing
    returning id into v_match;
  end if;

  return v_match;
end;
$$;
