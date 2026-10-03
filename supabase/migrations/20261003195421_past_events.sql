-- Historie akcí GetUp pro každého přihlášeného: proběhlé akce bez kódu pro připojení
-- (tabulka events je jinak čitelná jen účastníkům a organizátorům). Demo akce se neukazuje.
create or replace function public.past_events()
returns table (id uuid, name text, venue text, starts_at timestamptz, ends_at timestamptz, attended boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select e.id, e.name, e.venue, e.starts_at::timestamptz, e.ends_at::timestamptz,
         exists (select 1 from public.event_attendees a where a.event_id = e.id and a.user_id = (select auth.uid()))
  from public.events e
  where e.ends_at < now()
    and e.join_code <> 'DEMO26'
  order by e.starts_at desc;
$$;

revoke execute on function public.past_events() from public, anon;
grant execute on function public.past_events() to authenticated;
