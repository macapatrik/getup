-- =====================================================================
-- Administrace pro GetUp tým a „Můj účet“ pro návštěvníky
--
-- admin_* funkce ověřují is_organizer() (jinak GU403). Cizí profily se
-- i tady čtou jen přes security definer funkce – žádné nové select
-- policy na cizí řádky profiles.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Blokace účtů (moderace). Zablokovaný účet nejde vidět v balíčku ani
-- v matchích ostatních a nemůže swipovat, psát ani se připojit k akci.
-- ---------------------------------------------------------------------
create table public.bans (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  reason     text not null default '' check (char_length(reason) <= 500),
  banned_by  uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.bans enable row level security;
revoke all on public.bans from anon, authenticated;

create or replace function public.is_banned(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.bans b where b.user_id = p_user_id);
$$;

create or replace function public.enforce_not_banned()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
begin
  if tg_table_name = 'swipes' then
    v_user := new.swiper_id;
  elsif tg_table_name = 'messages' then
    v_user := new.sender_id;
  else
    v_user := new.user_id;
  end if;

  if public.is_banned(v_user) then
    -- skrytí zablokovaného účtu (admin_set_ban) projít musí
    if tg_table_name = 'event_attendees' and tg_op = 'UPDATE' and not new.visible then
      return new;
    end if;
    raise exception 'Tvůj účet je zablokovaný.' using errcode = 'GU012';
  end if;
  return new;
end;
$$;

create trigger swipes_not_banned before insert on public.swipes
for each row execute function public.enforce_not_banned();
create trigger messages_not_banned before insert on public.messages
for each row execute function public.enforce_not_banned();
create trigger attendees_not_banned before insert or update of visible on public.event_attendees
for each row execute function public.enforce_not_banned();

-- Matche se zablokovaným účtem zmizí ze seznamu (a chat nejde otevřít).
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
    and not exists (select 1 from public.bans b where b.user_id = p.id)
  order by coalesce(lm.created_at, m.created_at) desc;
$$;

-- Nahlášení jde označit jako vyřešené
alter table public.reports
  add column resolved_at timestamptz,
  add column resolved_by uuid references auth.users (id) on delete set null;

-- =====================================================================
-- Administrace
-- =====================================================================
create or replace function public.assert_organizer()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_organizer() then
    raise exception 'Jen pro organizátory.' using errcode = 'GU403';
  end if;
end;
$$;

-- Čísla na přehled
create or replace function public.admin_overview()
returns table (
  users        bigint,
  new_users_7d bigint,
  profiles     bigint,
  events       bigint,
  matches      bigint,
  matches_24h  bigint,
  messages     bigint,
  open_reports bigint,
  banned       bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  return query select
    (select count(*) from auth.users),
    (select count(*) from auth.users u where u.created_at > now() - interval '7 days'),
    (select count(*) from public.profiles),
    (select count(*) from public.events),
    (select count(*) from public.matches),
    (select count(*) from public.matches m where m.created_at > now() - interval '24 hours'),
    (select count(*) from public.messages),
    (select count(*) from public.reports r where r.resolved_at is null),
    (select count(*) from public.bans);
end;
$$;

-- Všechny akce s počty lidí a matchů
create or replace function public.admin_events()
returns table (
  id        uuid,
  name      text,
  venue     text,
  starts_at timestamptz,
  ends_at   timestamptz,
  join_code text,
  attendees bigint,
  matches   bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  return query
    select
      e.id, e.name, e.venue, e.starts_at, e.ends_at, e.join_code,
      (select count(*) from public.event_attendees a where a.event_id = e.id),
      (select count(*) from public.matches m where m.event_id = e.id)
    from public.events e
    order by e.starts_at desc;
end;
$$;

-- Úprava akce (čas v místní zóně jako u create_event)
create or replace function public.admin_update_event(
  p_event_id  uuid,
  p_name      text,
  p_venue     text,
  p_starts_at timestamp,
  p_ends_at   timestamp,
  p_time_zone text default 'Europe/Prague'
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  update public.events e
  set name      = btrim(p_name),
      venue     = btrim(coalesce(p_venue, '')),
      starts_at = p_starts_at at time zone p_time_zone,
      ends_at   = p_ends_at at time zone p_time_zone
  where e.id = p_event_id;
end;
$$;

-- Uživatelé (hledání podle jména nebo e-mailu, stránkování)
create or replace function public.admin_users(p_query text default null, p_limit int default 50, p_offset int default 0)
returns table (
  id              uuid,
  email           text,
  display_name    text,
  age             int,
  gender          public.gender,
  photo           text,
  created_at      timestamptz,
  last_sign_in_at timestamptz,
  events          bigint,
  matches         bigint,
  reports         bigint,
  banned          boolean,
  organizer       boolean,
  total           bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_query text := nullif(btrim(coalesce(p_query, '')), '');
begin
  perform public.assert_organizer();
  return query
    select
      u.id,
      u.email::text,
      p.display_name,
      date_part('year', age(p.birthdate))::int,
      p.gender,
      p.photos[1],
      u.created_at,
      u.last_sign_in_at,
      (select count(*) from public.event_attendees a where a.user_id = u.id),
      (select count(*) from public.matches m where u.id in (m.user_a, m.user_b)),
      (select count(*) from public.reports r where r.reported_id = u.id),
      exists (select 1 from public.bans b where b.user_id = u.id),
      exists (select 1 from public.organizers o where o.user_id = u.id),
      count(*) over ()
    from auth.users u
    left join public.profiles p on p.id = u.id
    where v_query is null
       or u.email ilike '%' || v_query || '%'
       or p.display_name ilike '%' || v_query || '%'
    order by u.created_at desc
    limit least(greatest(coalesce(p_limit, 50), 1), 200)
    offset greatest(coalesce(p_offset, 0), 0);
end;
$$;

-- Detail uživatele. Zprávy z chatů se organizátorům neukazují.
create or replace function public.admin_user(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  perform public.assert_organizer();
  select jsonb_build_object(
    'id', u.id,
    'email', u.email,
    'created_at', u.created_at,
    'last_sign_in_at', u.last_sign_in_at,
    'profile', case when p.id is null then null else jsonb_build_object(
      'display_name', p.display_name,
      'age', date_part('year', age(p.birthdate))::int,
      'gender', p.gender,
      'interested_in', p.interested_in,
      'bio', p.bio,
      'photos', p.photos
    ) end,
    'organizer', exists (select 1 from public.organizers o where o.user_id = u.id),
    'ban', (select jsonb_build_object('reason', b.reason, 'created_at', b.created_at)
            from public.bans b where b.user_id = u.id),
    'stats', jsonb_build_object(
      'likes_given', (select count(*) from public.swipes s where s.swiper_id = u.id and s.liked),
      'likes_received', (select count(*) from public.swipes s where s.swipee_id = u.id and s.liked),
      'matches', (select count(*) from public.matches m where u.id in (m.user_a, m.user_b)),
      'messages', (select count(*) from public.messages msg where msg.sender_id = u.id)
    ),
    'events', coalesce((
      select jsonb_agg(jsonb_build_object('id', e.id, 'name', e.name, 'starts_at', e.starts_at, 'ends_at', e.ends_at, 'visible', a.visible)
                       order by e.starts_at desc)
      from public.event_attendees a
      join public.events e on e.id = a.event_id
      where a.user_id = u.id
    ), '[]'::jsonb),
    'reports', coalesce((
      select jsonb_agg(jsonb_build_object('id', r.id, 'reason', r.reason, 'created_at', r.created_at,
                                          'resolved_at', r.resolved_at, 'reporter', rp.display_name)
                       order by r.created_at desc)
      from public.reports r
      left join public.profiles rp on rp.id = r.reporter_id
      where r.reported_id = u.id
    ), '[]'::jsonb)
  )
  into v_result
  from auth.users u
  left join public.profiles p on p.id = u.id
  where u.id = p_user_id;

  return v_result;
end;
$$;

-- Nahlášení (výchozí jen nevyřešená)
create or replace function public.admin_reports(p_open_only boolean default true)
returns table (
  id              bigint,
  reason          text,
  created_at      timestamptz,
  resolved_at     timestamptz,
  reporter_id     uuid,
  reporter_name   text,
  reported_id     uuid,
  reported_name   text,
  reported_photo  text,
  reported_banned boolean,
  reported_total  bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  return query
    select
      r.id, r.reason, r.created_at, r.resolved_at,
      r.reporter_id, rp.display_name,
      r.reported_id, dp.display_name, dp.photos[1],
      exists (select 1 from public.bans b where b.user_id = r.reported_id),
      (select count(*) from public.reports r2 where r2.reported_id = r.reported_id)
    from public.reports r
    left join public.profiles rp on rp.id = r.reporter_id
    left join public.profiles dp on dp.id = r.reported_id
    where not coalesce(p_open_only, true) or r.resolved_at is null
    order by r.resolved_at is not null, r.created_at desc
    limit 200;
end;
$$;

create or replace function public.admin_resolve_report(p_report_id bigint, p_resolved boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  update public.reports r
  set resolved_at = case when p_resolved then now() end,
      resolved_by = case when p_resolved then auth.uid() end
  where r.id = p_report_id;
end;
$$;

-- Zablokování / odblokování účtu. Organizátora zablokovat nejde.
create or replace function public.admin_set_ban(p_user_id uuid, p_banned boolean, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  if exists (select 1 from public.organizers o where o.user_id = p_user_id) then
    raise exception 'Organizátora nejde zablokovat.' using errcode = 'GU013';
  end if;

  if p_banned then
    insert into public.bans (user_id, reason, banned_by)
    values (p_user_id, left(btrim(coalesce(p_reason, '')), 500), auth.uid())
    on conflict (user_id) do update
      set reason = excluded.reason, banned_by = excluded.banned_by, created_at = now();
    update public.event_attendees a set visible = false where a.user_id = p_user_id;
    update public.reports r
    set resolved_at = now(), resolved_by = auth.uid()
    where r.reported_id = p_user_id and r.resolved_at is null;
  else
    delete from public.bans b where b.user_id = p_user_id;
    update public.event_attendees a set visible = true where a.user_id = p_user_id;
  end if;
end;
$$;

-- Tým (organizátoři)
create or replace function public.admin_organizers()
returns table (user_id uuid, email text, display_name text, photo text, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  return query
    select o.user_id, u.email::text, p.display_name, p.photos[1], o.created_at
    from public.organizers o
    join auth.users u on u.id = o.user_id
    left join public.profiles p on p.id = o.user_id
    order by o.created_at;
end;
$$;

create or replace function public.admin_add_organizer(p_email text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  perform public.assert_organizer();
  select u.id into v_id from auth.users u where lower(u.email) = lower(btrim(p_email));
  if v_id is null then
    raise exception 'Uživatel s tímto e-mailem neexistuje.' using errcode = 'GU014';
  end if;
  insert into public.organizers (user_id) values (v_id) on conflict do nothing;
  delete from public.bans b where b.user_id = v_id;
  return v_id;
end;
$$;

create or replace function public.admin_remove_organizer(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  if p_user_id = auth.uid() then
    raise exception 'Sám sebe odebrat nemůžeš.' using errcode = 'GU015';
  end if;
  delete from public.organizers o where o.user_id = p_user_id;
end;
$$;

-- =====================================================================
-- Můj účet (návštěvník vidí jen svoje data)
-- =====================================================================

-- Čísla na přehled účtu (RLS stačí, běží s právy uživatele)
create or replace function public.my_stats()
returns table (events bigint, likes bigint, passes bigint, matches bigint, messages bigint)
language sql
stable
set search_path = ''
as $$
  select
    (select count(*) from public.event_attendees a where a.user_id = (select auth.uid())),
    (select count(*) from public.swipes s where s.swiper_id = (select auth.uid()) and s.liked),
    (select count(*) from public.swipes s where s.swiper_id = (select auth.uid()) and not s.liked),
    (select count(*) from public.matches m where (select auth.uid()) in (m.user_a, m.user_b)),
    (select count(*) from public.messages msg where msg.sender_id = (select auth.uid()));
$$;

-- Lidé, které jsem lajknul/a (a jestli z toho je match)
create or replace function public.my_likes()
returns table (
  user_id      uuid,
  display_name text,
  age          int,
  photo        text,
  event_name   text,
  liked_at     timestamptz,
  match_id     uuid
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id,
    p.display_name,
    date_part('year', age(p.birthdate))::int,
    p.photos[1],
    e.name,
    s.created_at,
    m.id
  from public.swipes s
  join public.profiles p on p.id = s.swipee_id
  left join public.events e on e.id = s.event_id
  left join public.matches m
    on m.user_a = least(s.swiper_id, s.swipee_id) and m.user_b = greatest(s.swiper_id, s.swipee_id)
  where s.swiper_id = (select auth.uid())
    and s.liked
    and not exists (select 1 from public.bans b where b.user_id = p.id)
  order by s.created_at desc;
$$;

-- Zrušení lajku (jen dokud z něj není match)
create or replace function public.unlike(p_target uuid)
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
  -- stejný zámek jako swipe(), aby se nepotkal se současným lajkem druhé strany
  perform pg_advisory_xact_lock(
    hashtextextended(least(v_uid, p_target)::text || greatest(v_uid, p_target)::text, 0)
  );
  delete from public.swipes s
  where s.swiper_id = v_uid
    and s.swipee_id = p_target
    and s.liked
    and not exists (
      select 1 from public.matches m
      where m.user_a = least(v_uid, p_target) and m.user_b = greatest(v_uid, p_target)
    );
end;
$$;

-- Export všech mých dat (GDPR)
create or replace function public.export_my_data()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Nejsi přihlášený.' using errcode = 'GU401';
  end if;

  return jsonb_build_object(
    'exported_at', now(),
    'account', (
      select jsonb_build_object('id', u.id, 'email', u.email, 'created_at', u.created_at, 'last_sign_in_at', u.last_sign_in_at)
      from auth.users u where u.id = v_uid
    ),
    'profile', (select to_jsonb(p) from public.profiles p where p.id = v_uid),
    'events', coalesce((
      select jsonb_agg(jsonb_build_object('name', e.name, 'venue', e.venue, 'starts_at', e.starts_at,
                                          'joined_at', a.joined_at, 'visible', a.visible) order by a.joined_at)
      from public.event_attendees a join public.events e on e.id = a.event_id
      where a.user_id = v_uid
    ), '[]'::jsonb),
    'swipes', coalesce((
      select jsonb_agg(jsonb_build_object('person', p.display_name, 'liked', s.liked, 'event', e.name, 'at', s.created_at)
                       order by s.created_at)
      from public.swipes s
      left join public.profiles p on p.id = s.swipee_id
      left join public.events e on e.id = s.event_id
      where s.swiper_id = v_uid
    ), '[]'::jsonb),
    'matches', coalesce((
      select jsonb_agg(jsonb_build_object(
        'person', p.display_name,
        'event', e.name,
        'matched_at', m.created_at,
        'messages', coalesce((
          select jsonb_agg(jsonb_build_object(
            'from', case when msg.sender_id = v_uid then 'já' else coalesce(p.display_name, '?') end,
            'body', msg.body,
            'at', msg.created_at) order by msg.id)
          from public.messages msg where msg.match_id = m.id
        ), '[]'::jsonb)
      ) order by m.created_at)
      from public.matches m
      left join public.profiles p on p.id = case when m.user_a = v_uid then m.user_b else m.user_a end
      left join public.events e on e.id = m.event_id
      where v_uid in (m.user_a, m.user_b)
    ), '[]'::jsonb),
    'reports', coalesce((
      select jsonb_agg(jsonb_build_object('reason', r.reason, 'at', r.created_at) order by r.created_at)
      from public.reports r where r.reporter_id = v_uid
    ), '[]'::jsonb),
    'push_devices', (select count(*) from public.push_subscriptions ps where ps.user_id = v_uid)
  );
end;
$$;

-- =====================================================================
-- Oprávnění
-- =====================================================================
revoke execute on function
  public.is_banned(uuid),
  public.enforce_not_banned(),
  public.assert_organizer(),
  public.admin_overview(),
  public.admin_events(),
  public.admin_update_event(uuid, text, text, timestamp, timestamp, text),
  public.admin_users(text, int, int),
  public.admin_user(uuid),
  public.admin_reports(boolean),
  public.admin_resolve_report(bigint, boolean),
  public.admin_set_ban(uuid, boolean, text),
  public.admin_organizers(),
  public.admin_add_organizer(text),
  public.admin_remove_organizer(uuid),
  public.my_stats(),
  public.my_likes(),
  public.unlike(uuid),
  public.export_my_data()
from public, anon, authenticated;

grant execute on function
  public.admin_overview(),
  public.admin_events(),
  public.admin_update_event(uuid, text, text, timestamp, timestamp, text),
  public.admin_users(text, int, int),
  public.admin_user(uuid),
  public.admin_reports(boolean),
  public.admin_resolve_report(bigint, boolean),
  public.admin_set_ban(uuid, boolean, text),
  public.admin_organizers(),
  public.admin_add_organizer(text),
  public.admin_remove_organizer(uuid),
  public.my_stats(),
  public.my_likes(),
  public.unlike(uuid),
  public.export_my_data()
to authenticated;
