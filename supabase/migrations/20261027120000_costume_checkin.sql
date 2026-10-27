-- Soutěž o kostým: hlasovat smí jen ten, kdo je fyzicky v klubu. V klubu běží na obrazovce stránka z administrace
-- s 6místným kódem (a QR kódem), který se mění každých 5 minut; kdo ho zadá, je „odbavený“ a může hlasovat.
-- Na jednom zařízení se odbaví jen jeden účet (proti hlasování z více účtů), po 8 špatných kódech je konec.

-- Tajemství pro kódy je mimo tabulku events, protože tu účastníci akce smí číst.
create table if not exists public.costume_secrets (
  event_id uuid primary key references public.events (id) on delete cascade,
  secret   text not null default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
);

create table if not exists public.costume_checkins (
  event_id      uuid not null references public.events (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  device        text not null,
  checked_in_at timestamptz not null default now(),
  primary key (event_id, user_id),
  unique (event_id, device)
);

create table if not exists public.costume_checkin_failures (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id  uuid not null references auth.users (id) on delete cascade,
  failed   int not null default 0,
  last_at  timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- Bez policy: čte a zapisuje se jen přes funkce níže.
alter table public.costume_secrets enable row level security;
alter table public.costume_checkins enable row level security;
alter table public.costume_checkin_failures enable row level security;

-- Kód pro 5minutové okno (číslo okna = unixový čas / 300).
create or replace function public.costume_code(p_secret text, p_window bigint)
returns text
language sql
immutable
set search_path = ''
as $$
  select lpad(((('x' || substr(md5(p_secret || ':' || p_window), 1, 12))::bit(48)::bigint) % 1000000)::text, 6, '0');
$$;

-- Odbavení v klubu. Vrací 'ok' | 'wrong' (špatný nebo prošlý kód) | 'locked' (moc pokusů) | 'device' (zařízení už má jiný účet).
-- Špatný pokus se musí uložit, proto se tady nevyhazuje výjimka (ta by zápis vrátila zpět).
create or replace function public.costume_check_in(p_event_id uuid, p_code text, p_device text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_event public.events;
  v_secret text;
  v_window bigint := floor(extract(epoch from now()) / 300)::bigint;
  v_failed int;
begin
  if v_uid is null then
    raise exception 'Nejsi přihlášený.' using errcode = 'GU401';
  end if;
  if not exists (select 1 from public.event_attendees a where a.event_id = p_event_id and a.user_id = v_uid) then
    raise exception 'Nejsi na téhle akci.' using errcode = 'GU004';
  end if;
  select e.* into v_event from public.events e where e.id = p_event_id;
  if not v_event.costume_contest then
    raise exception 'Hlasování není otevřené.' using errcode = 'GU031';
  end if;
  if now() < v_event.starts_at - interval '1 hour'
     or now() > coalesce(v_event.ends_at, v_event.starts_at + interval '8 hours') + interval '1 hour' then
    raise exception 'Kód z klubu platí jen během akce.' using errcode = 'GU035';
  end if;
  if p_device is null or p_device !~ '^[A-Za-z0-9-]{16,64}$' then
    raise exception 'Neplatné zařízení.' using errcode = 'GU036';
  end if;
  if exists (select 1 from public.costume_checkins c where c.event_id = p_event_id and c.user_id = v_uid) then
    return 'ok';
  end if;

  select f.failed into v_failed from public.costume_checkin_failures f where f.event_id = p_event_id and f.user_id = v_uid;
  if coalesce(v_failed, 0) >= 8 then
    return 'locked';
  end if;

  select s.secret into v_secret from public.costume_secrets s where s.event_id = p_event_id;
  if v_secret is null
     or btrim(coalesce(p_code, '')) not in (public.costume_code(v_secret, v_window), public.costume_code(v_secret, v_window - 1)) then
    insert into public.costume_checkin_failures (event_id, user_id, failed) values (p_event_id, v_uid, 1)
    on conflict (event_id, user_id) do update set failed = public.costume_checkin_failures.failed + 1, last_at = now();
    return 'wrong';
  end if;

  if exists (select 1 from public.costume_checkins c where c.event_id = p_event_id and c.device = p_device) then
    return 'device';
  end if;
  insert into public.costume_checkins (event_id, user_id, device) values (p_event_id, v_uid, p_device)
  on conflict do nothing;
  return 'ok';
end;
$$;

-- Hlasovat smí jen odbavený (navíc k původním podmínkám).
create or replace function public.cast_costume_vote(p_event_id uuid, p_entry_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Nejsi přihlášený.' using errcode = 'GU401';
  end if;
  if not exists (select 1 from public.event_attendees a where a.event_id = p_event_id and a.user_id = v_uid) then
    raise exception 'Nejsi na téhle akci.' using errcode = 'GU004';
  end if;
  if not exists (select 1 from public.events e where e.id = p_event_id and e.costume_contest and e.costume_voting_open) then
    raise exception 'Hlasování není otevřené.' using errcode = 'GU031';
  end if;
  if not exists (select 1 from public.costume_checkins c where c.event_id = p_event_id and c.user_id = v_uid) then
    raise exception 'Hlasovat můžeš jen v klubu.' using errcode = 'GU037';
  end if;
  if not exists (select 1 from public.profiles p where p.id = v_uid and cardinality(p.photos) > 0) then
    raise exception 'Nejdřív si vyplň profil.' using errcode = 'GU001';
  end if;
  if not exists (select 1 from public.costume_entries c where c.id = p_entry_id and c.event_id = p_event_id and c.status = 'approved') then
    raise exception 'Tenhle kostým v soutěži není.' using errcode = 'GU032';
  end if;
  if exists (select 1 from public.costume_entries c where c.id = p_entry_id and c.user_id = v_uid) then
    raise exception 'Pro sebe hlasovat nejde.' using errcode = 'GU033';
  end if;

  insert into public.costume_votes (event_id, voter_id, entry_id) values (p_event_id, v_uid, p_entry_id)
  on conflict (event_id, voter_id) do update set entry_id = excluded.entry_id, created_at = now();
end;
$$;

-- Stav soutěže pro účastníka: navíc „checked_in“ (jestli už zadal kód z klubu).
create or replace function public.costume_contest(p_event_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_event public.events;
begin
  if v_uid is null then
    raise exception 'Nejsi přihlášený.' using errcode = 'GU401';
  end if;
  select e.* into v_event from public.events e where e.id = p_event_id;
  if not found then
    raise exception 'Akce neexistuje.' using errcode = 'GU024';
  end if;
  if not exists (select 1 from public.event_attendees a where a.event_id = p_event_id and a.user_id = v_uid) then
    raise exception 'Nejsi na téhle akci.' using errcode = 'GU004';
  end if;

  return jsonb_build_object(
    'enabled', v_event.costume_contest,
    'entries_open', v_event.costume_entries_open,
    'voting_open', v_event.costume_voting_open,
    'checked_in', exists (select 1 from public.costume_checkins c where c.event_id = p_event_id and c.user_id = v_uid),
    'my_entry', (
      select jsonb_build_object('id', c.id, 'title', c.title, 'photo', c.photo, 'status', c.status)
      from public.costume_entries c where c.event_id = p_event_id and c.user_id = v_uid
    ),
    'my_vote', (select v.entry_id from public.costume_votes v where v.event_id = p_event_id and v.voter_id = v_uid),
    'entries', coalesce((
      select jsonb_agg(jsonb_build_object('id', c.id, 'title', c.title, 'photo', c.photo, 'name', p.display_name, 'mine', c.user_id = v_uid)
                       order by md5(c.id::text || v_uid::text))
      from public.costume_entries c
      left join public.profiles p on p.id = c.user_id
      where c.event_id = p_event_id and c.status = 'approved'
    ), '[]'::jsonb)
  );
end;
$$;

-- Administrace: aktuální kód na obrazovku v klubu, kdy se změní, a kolik lidí je odbavených.
create or replace function public.admin_costume_checkin_code(p_event_id uuid)
returns table (code text, changes_at timestamptz, checked_in bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window bigint := floor(extract(epoch from now()) / 300)::bigint;
  v_secret text;
begin
  perform public.assert_organizer();
  insert into public.costume_secrets (event_id) values (p_event_id) on conflict do nothing;
  select s.secret into v_secret from public.costume_secrets s where s.event_id = p_event_id;
  return query
    select public.costume_code(v_secret, v_window),
      to_timestamp((v_window + 1) * 300),
      (select count(*) from public.costume_checkins c where c.event_id = p_event_id);
end;
$$;

revoke execute on function public.costume_code(text, bigint) from public, anon, authenticated;
revoke execute on function public.costume_check_in(uuid, text, text), public.admin_costume_checkin_code(uuid) from public, anon;
grant execute on function public.costume_check_in(uuid, text, text), public.admin_costume_checkin_code(uuid) to authenticated;
