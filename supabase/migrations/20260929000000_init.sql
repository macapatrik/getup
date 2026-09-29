-- =====================================================================
-- GetUp Match – základní schéma
--
-- Princip: lidé se seznamují jen s ostatními z té samé akce (koncertu).
-- Na akci se dostanou naskenováním QR kódu / zadáním kódu akce.
--
-- Bezpečnost: cizí profily NEJSOU čitelné přímo přes tabulku `profiles`
-- (jen vlastní). Ostatní lidi vidíš pouze přes funkce get_deck / get_matches,
-- které vrací jen bezpečné sloupce (věk místo data narození apod.).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Typy
-- ---------------------------------------------------------------------
create type public.gender as enum ('woman', 'man', 'nonbinary');

-- ---------------------------------------------------------------------
-- Profily
-- ---------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null check (char_length(btrim(display_name)) between 1 and 40),
  birthdate     date not null,
  gender        public.gender not null,
  interested_in public.gender[] not null check (cardinality(interested_in) between 1 and 3),
  bio           text not null default '' check (char_length(bio) <= 500),
  -- cesty k fotkám v bucketu `photos`, první = hlavní fotka
  photos        text[] not null default '{}' check (cardinality(photos) <= 6),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create or replace function public.profiles_validate()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.birthdate > (current_date - interval '18 years')::date then
    raise exception 'Musí ti být alespoň 18 let.' using errcode = 'GU010';
  end if;
  -- fotky smí ležet jen ve vlastní složce uživatele
  if exists (
    select 1 from unnest(new.photos) as p(path)
    where p.path !~ ('^' || new.id::text || '/[A-Za-z0-9_-]+\.(jpe?g|png|webp)$')
  ) then
    raise exception 'Neplatná cesta k fotce.' using errcode = 'GU011';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_validate
before insert or update on public.profiles
for each row execute function public.profiles_validate();

-- ---------------------------------------------------------------------
-- Organizátoři (tým GetUp) – přidávají se ručně přes SQL / dashboard
-- ---------------------------------------------------------------------
create table public.organizers (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_organizer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.organizers o where o.user_id = (select auth.uid()));
$$;

-- ---------------------------------------------------------------------
-- Akce (koncerty, party)
-- ---------------------------------------------------------------------
-- 6znakový kód bez zaměnitelných znaků (0/O, 1/I)
create or replace function public.generate_join_code()
returns text
language sql
volatile
set search_path = ''
as $$
  select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
  from generate_series(1, 6);
$$;

create table public.events (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(btrim(name)) between 1 and 120),
  venue      text not null default '' check (char_length(venue) <= 120),
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  join_code  text not null unique default public.generate_join_code(),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint events_time_order check (ends_at > starts_at)
);

-- Akce je "otevřená" (dá se připojit a swipovat) až do 24 h po jejím konci.
create or replace function public.event_is_open(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.events e
    where e.id = p_event_id and now() <= e.ends_at + interval '24 hours'
  );
$$;

-- ---------------------------------------------------------------------
-- Účastníci akce
-- ---------------------------------------------------------------------
create table public.event_attendees (
  event_id  uuid not null references public.events (id) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  -- false = uživatel se skryl, ostatní ho v balíčku neuvidí
  visible   boolean not null default true,
  joined_at timestamptz not null default now(),
  primary key (event_id, user_id)
);
create index event_attendees_user_idx on public.event_attendees (user_id);

-- ---------------------------------------------------------------------
-- Swipy – jeden záznam na dvojici (kdo koho), napříč akcemi
-- ---------------------------------------------------------------------
create table public.swipes (
  swiper_id  uuid not null references auth.users (id) on delete cascade,
  swipee_id  uuid not null references auth.users (id) on delete cascade,
  event_id   uuid references public.events (id) on delete set null,
  liked      boolean not null,
  created_at timestamptz not null default now(),
  primary key (swiper_id, swipee_id),
  constraint swipes_not_self check (swiper_id <> swipee_id)
);
create index swipes_swipee_liked_idx on public.swipes (swipee_id) where liked;
create index swipes_event_idx on public.swipes (event_id);

-- ---------------------------------------------------------------------
-- Matche – user_a < user_b, takže dvojice je vždy jen jednou
-- ---------------------------------------------------------------------
create table public.matches (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid not null references auth.users (id) on delete cascade,
  user_b     uuid not null references auth.users (id) on delete cascade,
  event_id   uuid references public.events (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint matches_ordered check (user_a < user_b),
  constraint matches_pair unique (user_a, user_b)
);
create index matches_user_b_idx on public.matches (user_b);
create index matches_event_idx on public.matches (event_id);

create or replace function public.is_match_participant(p_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.matches m
    where m.id = p_match_id and (select auth.uid()) in (m.user_a, m.user_b)
  );
$$;

-- ---------------------------------------------------------------------
-- Zprávy
-- ---------------------------------------------------------------------
create table public.messages (
  id         bigint generated always as identity primary key,
  match_id   uuid not null references public.matches (id) on delete cascade,
  sender_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body       text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index messages_match_created_idx on public.messages (match_id, created_at);

-- ---------------------------------------------------------------------
-- Nahlášení (moderace)
-- ---------------------------------------------------------------------
create table public.reports (
  id          bigint generated always as identity primary key,
  reporter_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reported_id uuid not null references auth.users (id) on delete cascade,
  reason      text not null check (char_length(btrim(reason)) between 1 and 1000),
  created_at  timestamptz not null default now(),
  constraint reports_not_self check (reporter_id <> reported_id)
);
create index reports_reported_idx on public.reports (reported_id);

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles        enable row level security;
alter table public.organizers      enable row level security;
alter table public.events          enable row level security;
alter table public.event_attendees enable row level security;
alter table public.swipes          enable row level security;
alter table public.matches         enable row level security;
alter table public.messages        enable row level security;
alter table public.reports         enable row level security;

-- profiles: jen vlastní řádek
create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles: insert own" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- organizers: vidím jen, jestli jsem organizátor já
create policy "organizers: read own" on public.organizers
  for select to authenticated using (user_id = (select auth.uid()));

-- events: vidí je účastníci a organizátoři; spravují je organizátoři
create policy "events: read as attendee or organizer" on public.events
  for select to authenticated using (
    (select public.is_organizer())
    or exists (
      select 1 from public.event_attendees a
      where a.event_id = events.id and a.user_id = (select auth.uid())
    )
  );
create policy "events: organizers insert" on public.events
  for insert to authenticated with check ((select public.is_organizer()));
create policy "events: organizers update" on public.events
  for update to authenticated
  using ((select public.is_organizer())) with check ((select public.is_organizer()));
create policy "events: organizers delete" on public.events
  for delete to authenticated using ((select public.is_organizer()));

-- event_attendees: vidím / mažu (opuštění akce) jen své záznamy.
-- Připojení jde jen přes join_event(), změna viditelnosti přes set_event_visibility().
create policy "attendees: read own" on public.event_attendees
  for select to authenticated using (user_id = (select auth.uid()));
create policy "attendees: leave" on public.event_attendees
  for delete to authenticated using (user_id = (select auth.uid()));

-- swipes: jen vlastní (nikdo nevidí, kdo ho lajknul). Zápis jen přes swipe().
create policy "swipes: read own" on public.swipes
  for select to authenticated using (swiper_id = (select auth.uid()));

-- matches: vidí a ruší (unmatch) jen účastníci
create policy "matches: read as participant" on public.matches
  for select to authenticated using ((select auth.uid()) in (user_a, user_b));
create policy "matches: unmatch" on public.matches
  for delete to authenticated using ((select auth.uid()) in (user_a, user_b));

-- messages: jen účastníci matche
create policy "messages: read as participant" on public.messages
  for select to authenticated using (public.is_match_participant(match_id));
create policy "messages: send as participant" on public.messages
  for insert to authenticated with check (
    sender_id = (select auth.uid()) and public.is_match_participant(match_id)
  );

-- reports: kdokoli může nahlásit, číst je můžou organizátoři
create policy "reports: create" on public.reports
  for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy "reports: organizers read" on public.reports
  for select to authenticated using ((select public.is_organizer()));

-- =====================================================================
-- RPC funkce (volané z aplikace přes supabase.rpc)
-- Chybové kódy GUxxx mapuje frontend na české hlášky (src/lib/errors.ts).
-- =====================================================================

-- Připojení k akci podle kódu z QR
create or replace function public.join_event(p_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_event public.events;
begin
  if v_uid is null then
    raise exception 'Nejsi přihlášený.' using errcode = 'GU401';
  end if;
  if not exists (select 1 from public.profiles p where p.id = v_uid) then
    raise exception 'Nejdřív si vyplň profil.' using errcode = 'GU001';
  end if;

  select e.* into v_event from public.events e where e.join_code = upper(btrim(p_code));
  if not found then
    raise exception 'Akce s tímto kódem neexistuje.' using errcode = 'GU002';
  end if;
  if now() > v_event.ends_at + interval '24 hours' then
    raise exception 'Tahle akce už skončila.' using errcode = 'GU003';
  end if;

  insert into public.event_attendees (event_id, user_id)
  values (v_event.id, v_uid)
  on conflict do nothing;

  return v_event.id;
end;
$$;

-- Skrýt / zobrazit se ostatním na akci
create or replace function public.set_event_visibility(p_event_id uuid, p_visible boolean)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.event_attendees
  set visible = p_visible
  where event_id = p_event_id and user_id = (select auth.uid());
$$;

-- Balíček karet: lidé ze stejné akce, kteří odpovídají preferencím (oboustranně)
create or replace function public.get_deck(p_event_id uuid, p_limit int default 20)
returns table (
  id           uuid,
  display_name text,
  age          int,
  gender       public.gender,
  bio          text,
  photos       text[]
)
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

-- Swipe. Vrací id matche, pokud právě vznikl (oba se lajkli), jinak null.
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

  -- Zámek na dvojici: když se dva lajknou ve stejnou chvíli, match vznikne vždy.
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

-- Moje matche (nebo jeden konkrétní) s profilem protějšku a poslední zprávou
create or replace function public.get_matches(p_match_id uuid default null)
returns table (
  match_id        uuid,
  matched_at      timestamptz,
  event_name      text,
  other_id        uuid,
  display_name    text,
  age             int,
  bio             text,
  photos          text[],
  last_message    text,
  last_message_at timestamptz,
  last_sender_id  uuid
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    m.id,
    m.created_at,
    e.name,
    p.id,
    p.display_name,
    date_part('year', age(p.birthdate))::int,
    p.bio,
    p.photos,
    lm.body,
    lm.created_at,
    lm.sender_id
  from public.matches m
  join public.profiles p
    on p.id = case when m.user_a = (select auth.uid()) then m.user_b else m.user_a end
  left join public.events e on e.id = m.event_id
  left join lateral (
    select msg.body, msg.created_at, msg.sender_id
    from public.messages msg
    where msg.match_id = m.id
    order by msg.created_at desc, msg.id desc
    limit 1
  ) lm on true
  where (select auth.uid()) in (m.user_a, m.user_b)
    and (p_match_id is null or m.id = p_match_id)
  order by coalesce(lm.created_at, m.created_at) desc;
$$;

-- Vytvoření akce organizátorem (čas zadaný v místní časové zóně)
create or replace function public.create_event(
  p_name      text,
  p_venue     text,
  p_starts_at timestamp,
  p_ends_at   timestamp,
  p_time_zone text default 'Europe/Prague'
)
returns public.events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.events;
begin
  if not public.is_organizer() then
    raise exception 'Akce můžou zakládat jen organizátoři.' using errcode = 'GU403';
  end if;

  insert into public.events (name, venue, starts_at, ends_at, created_by)
  values (
    btrim(p_name),
    btrim(coalesce(p_venue, '')),
    p_starts_at at time zone p_time_zone,
    p_ends_at at time zone p_time_zone,
    auth.uid()
  )
  returning * into v_event;

  return v_event;
end;
$$;

-- Statistiky akce pro organizátory
create or replace function public.event_stats(p_event_id uuid)
returns table (attendees bigint, visible_attendees bigint, swipes bigint, likes bigint, matches bigint, messages bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_organizer() then
    raise exception 'Jen pro organizátory.' using errcode = 'GU403';
  end if;

  return query select
    (select count(*) from public.event_attendees a where a.event_id = p_event_id),
    (select count(*) from public.event_attendees a where a.event_id = p_event_id and a.visible),
    (select count(*) from public.swipes s where s.event_id = p_event_id),
    (select count(*) from public.swipes s where s.event_id = p_event_id and s.liked),
    (select count(*) from public.matches m where m.event_id = p_event_id),
    (select count(*) from public.messages msg
       join public.matches m on m.id = msg.match_id
      where m.event_id = p_event_id);
end;
$$;

-- Smazání účtu (GDPR). Fotky maže klient přes Storage API ještě předtím.
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Nejsi přihlášený.' using errcode = 'GU401';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

-- =====================================================================
-- Oprávnění – nic pro anonymní uživatele, RLS řeší zbytek
-- =====================================================================
revoke all on public.profiles, public.organizers, public.events, public.event_attendees,
  public.swipes, public.matches, public.messages, public.reports from anon;

grant select, insert, update         on public.profiles        to authenticated;
grant select                         on public.organizers      to authenticated;
grant select, insert, update, delete on public.events          to authenticated;
grant select, delete                 on public.event_attendees to authenticated;
grant select                         on public.swipes          to authenticated;
grant select, delete                 on public.matches         to authenticated;
grant select, insert                 on public.messages        to authenticated;
grant select, insert                 on public.reports         to authenticated;

revoke execute on all functions in schema public from public, anon;
grant execute on function
  public.is_organizer(),
  public.is_match_participant(uuid),
  public.event_is_open(uuid),
  public.join_event(text),
  public.set_event_visibility(uuid, boolean),
  public.get_deck(uuid, int),
  public.swipe(uuid, uuid, boolean),
  public.get_matches(uuid),
  public.create_event(text, text, timestamp, timestamp, text),
  public.event_stats(uuid),
  public.delete_account()
to authenticated;

-- =====================================================================
-- Storage: bucket na fotky (každý smí zapisovat jen do složky se svým id)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "photos: read own" on storage.objects
  for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "photos: upload own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "photos: update own" on storage.objects
  for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "photos: delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- =====================================================================
-- Realtime: nové zprávy a matche (Realtime respektuje RLS)
-- =====================================================================
alter publication supabase_realtime add table public.messages, public.matches;
