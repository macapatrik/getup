-- Soutěž o kostým: každý má 3 hlasy (každý pro jiný kostým) a může je během hlasování přehazovat.
-- Hlas se odebírá remove_costume_vote; když tým kostým vyřadí, hlasy pro něj zmizí a voliči je můžou dát jinam.

alter table public.costume_votes drop constraint if exists costume_votes_pkey;
alter table public.costume_votes add primary key (event_id, voter_id, entry_id);
create index if not exists costume_votes_voter_idx on public.costume_votes (event_id, voter_id);

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
  if exists (select 1 from public.costume_votes v where v.event_id = p_event_id and v.voter_id = v_uid and v.entry_id = p_entry_id) then
    return; -- pro tenhle kostým už hlas má
  end if;
  -- zámek na voliče, ať dvě rychlá klepnutí najednou nepřelezou 3 hlasy
  perform pg_advisory_xact_lock(hashtext(p_event_id::text || v_uid::text));
  if (select count(*) from public.costume_votes v where v.event_id = p_event_id and v.voter_id = v_uid) >= 3 then
    raise exception 'Máš už všechny 3 hlasy.' using errcode = 'GU038';
  end if;

  insert into public.costume_votes (event_id, voter_id, entry_id) values (p_event_id, v_uid, p_entry_id)
  on conflict do nothing;
end;
$$;

-- Odebrání hlasu (ať ho jde dát jinému kostýmu), jen dokud hlasování běží.
create or replace function public.remove_costume_vote(p_event_id uuid, p_entry_id uuid)
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
  if not exists (select 1 from public.events e where e.id = p_event_id and e.costume_contest and e.costume_voting_open) then
    raise exception 'Hlasování není otevřené.' using errcode = 'GU031';
  end if;
  delete from public.costume_votes where event_id = p_event_id and voter_id = v_uid and entry_id = p_entry_id;
end;
$$;

-- Stav soutěže: navíc „my_votes“ (pole kostýmů, pro které hlasuju) a „votes_left“; „my_vote“ zůstává kvůli starším verzím.
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
  v_votes jsonb;
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
  select coalesce(jsonb_agg(v.entry_id order by v.created_at), '[]'::jsonb) into v_votes
  from public.costume_votes v where v.event_id = p_event_id and v.voter_id = v_uid;

  return jsonb_build_object(
    'enabled', v_event.costume_contest,
    'entries_open', v_event.costume_entries_open,
    'voting_open', v_event.costume_voting_open,
    'checked_in', exists (select 1 from public.costume_checkins c where c.event_id = p_event_id and c.user_id = v_uid),
    'my_entry', (
      select jsonb_build_object('id', c.id, 'title', c.title, 'photo', c.photo, 'status', c.status)
      from public.costume_entries c where c.event_id = p_event_id and c.user_id = v_uid
    ),
    'my_vote', v_votes -> 0,
    'my_votes', v_votes,
    'votes_max', 3,
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

-- Administrace: jeden řádek na voliče, „voted_for“ = jeho kostýmy (až 3) oddělené čárkou.
create or replace function public.admin_costume_voters(p_event_id uuid)
returns table (user_id uuid, display_name text, photo text, voted_for text, voted_at timestamptz, account_created_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  return query
    select v.voter_id, p.display_name, p.photos[1],
      string_agg(coalesce(nullif(c.title, ''), 'Bez názvu'), ', ' order by v.created_at),
      max(v.created_at), u.created_at
    from public.costume_votes v
    join public.costume_entries c on c.id = v.entry_id
    left join public.profiles p on p.id = v.voter_id
    left join auth.users u on u.id = v.voter_id
    where v.event_id = p_event_id
    group by v.voter_id, p.display_name, p.photos, u.created_at
    order by max(v.created_at) desc;
end;
$$;

revoke execute on function public.remove_costume_vote(uuid, uuid) from public, anon;
grant execute on function public.remove_costume_vote(uuid, uuid) to authenticated;
