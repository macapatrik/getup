-- Souhlasy hned po prvním přihlášení (obrazovka /souhlas): podmínky užití včetně moderace a blokace (povinné)
-- a novinky e-mailem (nepovinné, vypíná se v Můj účet). Zvlášť od profilu, protože se souhlasí ještě před jeho
-- vyplněním. Verze podmínek je TERMS_VERSION v src/lib/legal.ts; když se zvýší, aplikace se zeptá znovu.
create table public.consents (
  user_id              uuid primary key references auth.users (id) on delete cascade,
  terms_version        text not null check (char_length(terms_version) between 1 and 40),
  terms_accepted_at    timestamptz not null default now(),
  marketing            boolean not null default false,
  marketing_changed_at timestamptz not null default now()
);

alter table public.consents enable row level security;
revoke all on public.consents from anon, authenticated;
grant select on public.consents to authenticated;

create policy "consents: read own" on public.consents
  for select to authenticated using (user_id = (select auth.uid()));

-- Zápis jen přes funkce, aby časy souhlasů nastavoval server.
create or replace function public.accept_terms(p_version text, p_marketing boolean)
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

  insert into public.consents as c (user_id, terms_version, marketing)
  values (v_uid, p_version, coalesce(p_marketing, false))
  on conflict (user_id) do update
    set terms_version = excluded.terms_version,
        terms_accepted_at = now(),
        marketing_changed_at = case when c.marketing = excluded.marketing then c.marketing_changed_at else now() end,
        marketing = excluded.marketing;
end;
$$;

create or replace function public.set_marketing_consent(p_marketing boolean)
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

  update public.consents
     set marketing = coalesce(p_marketing, false), marketing_changed_at = now()
   where user_id = v_uid and marketing is distinct from coalesce(p_marketing, false);
end;
$$;

-- Export mých dat: navíc souhlasy
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
    'consents', (
      select jsonb_build_object('terms_version', c.terms_version, 'terms_accepted_at', c.terms_accepted_at,
                                'marketing', c.marketing, 'marketing_changed_at', c.marketing_changed_at)
      from public.consents c where c.user_id = v_uid
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

revoke execute on function public.accept_terms(text, boolean), public.set_marketing_consent(boolean) from public, anon;
grant execute on function public.accept_terms(text, boolean), public.set_marketing_consent(boolean) to authenticated;
