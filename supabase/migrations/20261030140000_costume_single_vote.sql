-- Soutěž o kostým bez kódu z klubu: hlasovat může každý připojený k akci (odkaz z QR kódu na Instagramu a plakátech),
-- ale jen jednou a napořád. Hlas je uložený u účtu, takže smazání cookies nepomůže; podvodné účty tým maže ručně
-- (smazáním účtu zmizí kaskádou i jeho hlas). Tabulky z odbavení v klubu zůstávají, jen je hlasování nevyžaduje.

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

  -- Jeden hlas napořád: druhý pokus (i na jiný kostým) skončí chybou.
  insert into public.costume_votes (event_id, voter_id, entry_id) values (p_event_id, v_uid, p_entry_id)
  on conflict (event_id, voter_id) do nothing;
  if not found then
    raise exception 'Už jsi hlasoval/a.' using errcode = 'GU038';
  end if;
end;
$$;

-- Administrace: kdo hlasoval a pro koho, s profilovou fotkou (kontrola, že má každý fotku v kostýmu).
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
    select v.voter_id, p.display_name, p.photos[1], coalesce(nullif(c.title, ''), 'Bez názvu'), v.created_at, u.created_at
    from public.costume_votes v
    join public.costume_entries c on c.id = v.entry_id
    left join public.profiles p on p.id = v.voter_id
    left join auth.users u on u.id = v.voter_id
    where v.event_id = p_event_id
    order by v.created_at desc;
end;
$$;

revoke execute on function public.admin_costume_voters(uuid) from public, anon;
grant execute on function public.admin_costume_voters(uuid) to authenticated;
