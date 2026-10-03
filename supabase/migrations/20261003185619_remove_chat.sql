-- Konec chatu: po matchi si lidé vymění kontakty (Instagram, Snapchat, telefon).
-- Staré verze funkcí se tu jen přejmenují na *_old a triggery chatu vypnou;
-- samotné odstranění tabulky zpráv a starých funkcí je v supabase/run_manually.sql
-- (nástroj, kterým migrace aplikujeme, neumí spouštět DROP bez potvrzení v dashboardu).
alter table public.matches disable trigger matches_demo_greeting;
alter table public.messages disable trigger messages_push;
alter table public.messages disable trigger messages_broadcast;
alter table public.messages disable trigger messages_not_banned;
revoke all on table public.messages from anon, authenticated;

-- Kontrola blokace už nemusí znát odesílatele zprávy
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

-- Matche: místo poslední zprávy kontakty protějšku
alter function public.get_matches(uuid) rename to get_matches_old;
revoke execute on function public.get_matches_old(uuid) from public, anon, authenticated;
create function public.get_matches(p_match_id uuid default null)
returns table (
  match_id     uuid,
  matched_at   timestamptz,
  event_name   text,
  other_id     uuid,
  display_name text,
  age          int,
  bio          text,
  photos       text[],
  instagram    text,
  snapchat     text,
  phone        text
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
    p.instagram,
    p.snapchat,
    p.phone
  from public.matches m
  join public.profiles p
    on p.id = case when m.user_a = (select auth.uid()) then m.user_b else m.user_a end
  left join public.events e on e.id = m.event_id
  where (select auth.uid()) in (m.user_a, m.user_b)
    and (p_match_id is null or m.id = p_match_id)
    and not exists (select 1 from public.bans b where b.user_id = p.id)
  order by m.created_at desc;
$$;

-- Statistiky bez zpráv
alter function public.my_stats() rename to my_stats_old;
revoke execute on function public.my_stats_old() from public, anon, authenticated;
create function public.my_stats()
returns table (events bigint, likes bigint, passes bigint, matches bigint)
language sql
stable
set search_path = ''
as $$
  select
    (select count(*) from public.event_attendees a where a.user_id = (select auth.uid())),
    (select count(*) from public.swipes s where s.swiper_id = (select auth.uid()) and s.liked),
    (select count(*) from public.swipes s where s.swiper_id = (select auth.uid()) and not s.liked),
    (select count(*) from public.matches m where (select auth.uid()) in (m.user_a, m.user_b));
$$;

alter function public.event_stats(uuid) rename to event_stats_old;
revoke execute on function public.event_stats_old(uuid) from public, anon, authenticated;
create function public.event_stats(p_event_id uuid)
returns table (attendees bigint, visible_attendees bigint, swipes bigint, likes bigint, matches bigint)
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
    (select count(*) from public.matches m where m.event_id = p_event_id);
end;
$$;

alter function public.admin_overview() rename to admin_overview_old;
revoke execute on function public.admin_overview_old() from public, anon, authenticated;
create function public.admin_overview()
returns table (
  users        bigint,
  new_users_7d bigint,
  profiles     bigint,
  with_contact bigint,
  events       bigint,
  matches      bigint,
  matches_24h  bigint,
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
    (select count(*) from public.profiles p where coalesce(p.instagram, p.snapchat, p.phone) is not null),
    (select count(*) from public.events),
    (select count(*) from public.matches),
    (select count(*) from public.matches m where m.created_at > now() - interval '24 hours'),
    (select count(*) from public.reports r where r.resolved_at is null),
    (select count(*) from public.bans);
end;
$$;

-- Detail uživatele pro tým: profil i s kontakty, bez počtu zpráv
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
      'photos', p.photos,
      'instagram', p.instagram,
      'snapchat', p.snapchat,
      'phone', p.phone
    ) end,
    'organizer', exists (select 1 from public.organizers o where o.user_id = u.id),
    'ban', (select jsonb_build_object('reason', b.reason, 'created_at', b.created_at)
            from public.bans b where b.user_id = u.id),
    'stats', jsonb_build_object(
      'likes_given', (select count(*) from public.swipes s where s.swiper_id = u.id and s.liked),
      'likes_received', (select count(*) from public.swipes s where s.swipee_id = u.id and s.liked),
      'matches', (select count(*) from public.matches m where u.id in (m.user_a, m.user_b))
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

-- Export mých dat (GDPR) bez zpráv; u matche kontakty protějšku, které jsem viděl/a
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
        'instagram', p.instagram,
        'snapchat', p.snapchat,
        'phone', p.phone,
        'event', e.name,
        'matched_at', m.created_at
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

-- Oprávnění nových funkcí
revoke execute on function
  public.get_matches(uuid),
  public.my_stats(),
  public.event_stats(uuid),
  public.admin_overview(),
  public.admin_user(uuid),
  public.export_my_data()
from public, anon;
grant execute on function
  public.get_matches(uuid),
  public.my_stats(),
  public.event_stats(uuid),
  public.admin_overview(),
  public.admin_user(uuid),
  public.export_my_data()
to authenticated;
