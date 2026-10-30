-- Soutěž o kostým: živé výsledky pro účastníky akce (hlavní stránka appky). Schválené kostýmy s počtem hlasů,
-- seřazené od nejvíc hlasů. Kdo hlasoval, se neukazuje.
create or replace function public.costume_results(p_event_id uuid)
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
  if not exists (select 1 from public.event_attendees a where a.event_id = p_event_id and a.user_id = v_uid) then
    raise exception 'Nejsi na téhle akci.' using errcode = 'GU004';
  end if;
  select e.* into v_event from public.events e where e.id = p_event_id;

  return jsonb_build_object(
    'enabled', v_event.costume_contest,
    'voting_open', v_event.costume_voting_open,
    'total', (select count(*) from public.costume_votes v
              join public.costume_entries c on c.id = v.entry_id and c.status = 'approved'
              where v.event_id = p_event_id),
    'entries', coalesce((
      select jsonb_agg(jsonb_build_object('id', r.id, 'title', r.title, 'photo', r.photo, 'name', r.display_name, 'votes', r.votes)
                       order by r.votes desc, r.created_at)
      from (
        select c.id, c.title, c.photo, c.created_at, p.display_name, count(v.voter_id) as votes
        from public.costume_entries c
        left join public.profiles p on p.id = c.user_id
        left join public.costume_votes v on v.entry_id = c.id
        where c.event_id = p_event_id and c.status = 'approved'
        group by c.id, p.display_name
      ) r
    ), '[]'::jsonb)
  );
end;
$$;

revoke execute on function public.costume_results(uuid) from public, anon;
grant execute on function public.costume_results(uuid) to authenticated;
