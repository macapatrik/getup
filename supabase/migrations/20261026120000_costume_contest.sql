-- Soutěž o nejlepší kostým (Halloween): účastníci akce nahrají fotku kostýmu, tým přihlášky schválí,
-- lidé z akce hlasují (1 hlas na člověka, jde přehodit, dokud hlasování běží). Pořadí vidí jen tým.

alter table public.events
  add column if not exists costume_contest boolean not null default false,
  add column if not exists costume_entries_open boolean not null default false,
  add column if not exists costume_voting_open boolean not null default false;

create table if not exists public.costume_entries (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null default '' check (char_length(title) <= 60),
  photo      text not null,
  status     text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, user_id)
);
create index if not exists costume_entries_event_idx on public.costume_entries (event_id, status);

create table if not exists public.costume_votes (
  event_id   uuid not null references public.events (id) on delete cascade,
  voter_id   uuid not null references auth.users (id) on delete cascade,
  entry_id   uuid not null references public.costume_entries (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, voter_id)
);
create index if not exists costume_votes_entry_idx on public.costume_votes (entry_id);

-- Bez policy: čte a zapisuje se jen přes funkce níže.
alter table public.costume_entries enable row level security;
alter table public.costume_votes enable row level security;

-- Stav soutěže pro přihlášeného účastníka: nastavení, moje přihláška, můj hlas a schválené kostýmy (bez počtu hlasů).
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

-- Přihláška kostýmu (nová, nebo výměna fotky / názvu; po změně čeká znovu na schválení).
create or replace function public.submit_costume_entry(p_event_id uuid, p_photo text, p_title text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'Nejsi přihlášený.' using errcode = 'GU401';
  end if;
  if not exists (select 1 from public.event_attendees a where a.event_id = p_event_id and a.user_id = v_uid) then
    raise exception 'Nejsi na téhle akci.' using errcode = 'GU004';
  end if;
  if not exists (select 1 from public.events e where e.id = p_event_id and e.costume_contest and e.costume_entries_open) then
    raise exception 'Přihlášky do soutěže nejsou otevřené.' using errcode = 'GU030';
  end if;
  if p_photo is null or p_photo !~ ('^' || v_uid::text || '/[A-Za-z0-9_-]+\.(jpe?g|png|webp)$') then
    raise exception 'Neplatná cesta k fotce.' using errcode = 'GU011';
  end if;

  insert into public.costume_entries (event_id, user_id, title, photo)
  values (p_event_id, v_uid, left(btrim(coalesce(p_title, '')), 60), p_photo)
  on conflict (event_id, user_id) do update
    set title = excluded.title, photo = excluded.photo, status = 'pending', updated_at = now()
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.withdraw_costume_entry(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Nejsi přihlášený.' using errcode = 'GU401';
  end if;
  delete from public.costume_entries where event_id = p_event_id and user_id = auth.uid();
end;
$$;

-- Hlas (nebo jeho přehození). Hlasovat smí jen účastník akce s hotovým profilem a fotkou, ne pro sebe.
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

-- Administrace: všechny přihlášky s počtem hlasů; „fresh_votes“ = hlasy z účtů založených méně než den před hlasem (podezřelé).
create or replace function public.admin_costume_entries(p_event_id uuid)
returns table (id uuid, user_id uuid, display_name text, title text, photo text, status text, created_at timestamptz,
               votes bigint, fresh_votes bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  return query
    select c.id, c.user_id, p.display_name, c.title, c.photo, c.status, c.created_at,
      count(v.voter_id),
      count(v.voter_id) filter (where u.created_at > v.created_at - interval '1 day')
    from public.costume_entries c
    left join public.profiles p on p.id = c.user_id
    left join public.costume_votes v on v.entry_id = c.id
    left join auth.users u on u.id = v.voter_id
    where c.event_id = p_event_id
    group by c.id, p.display_name
    order by count(v.voter_id) desc, c.created_at;
end;
$$;

create or replace function public.admin_set_costume_entry_status(p_entry_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  if p_status not in ('pending', 'approved', 'rejected') then
    raise exception 'Neplatný stav.' using errcode = 'GU034';
  end if;
  update public.costume_entries set status = p_status, updated_at = now() where id = p_entry_id;
  -- odmítnutý kostým nemá hlasy (lidé můžou hlasovat znovu)
  if p_status <> 'approved' then
    delete from public.costume_votes where entry_id = p_entry_id;
  end if;
end;
$$;

create or replace function public.admin_set_costume_contest(p_event_id uuid, p_enabled boolean, p_entries_open boolean, p_voting_open boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  update public.events
  set costume_contest = coalesce(p_enabled, false),
      costume_entries_open = coalesce(p_enabled, false) and coalesce(p_entries_open, false),
      costume_voting_open = coalesce(p_enabled, false) and coalesce(p_voting_open, false)
  where id = p_event_id;
end;
$$;

revoke execute on function public.costume_contest(uuid), public.submit_costume_entry(uuid, text, text),
  public.withdraw_costume_entry(uuid), public.cast_costume_vote(uuid, uuid), public.admin_costume_entries(uuid),
  public.admin_set_costume_entry_status(uuid, text), public.admin_set_costume_contest(uuid, boolean, boolean, boolean)
  from public, anon;
grant execute on function public.costume_contest(uuid), public.submit_costume_entry(uuid, text, text),
  public.withdraw_costume_entry(uuid), public.cast_costume_vote(uuid, uuid), public.admin_costume_entries(uuid),
  public.admin_set_costume_entry_status(uuid, text), public.admin_set_costume_contest(uuid, boolean, boolean, boolean)
  to authenticated;
