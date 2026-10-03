-- DEMO: když se k akci připojí skutečný návštěvník, kompatibilní demo účty z té akce ho rovnou lajknou
-- (promo profily s raw_user_meta_data.promo vždy, k nim náhodně další), takže po swipnutí doprava vznikne match.
-- Jen pro ukázky – před ostrým spuštěním odstraň (viz cleanup.sql).
create or replace function public.demo_auto_like()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me public.profiles;
begin
  if exists (select 1 from auth.users u where u.id = new.user_id and u.email like '%@demo.gettogether.test') then
    return new;
  end if;
  select p.* into v_me from public.profiles p where p.id = new.user_id;
  if not found then
    return new;
  end if;

  -- Promo profily (raw_user_meta_data.promo) lajknou vždy, k nim až tři další demo účty náhodně.
  insert into public.swipes (swiper_id, swipee_id, event_id, liked)
  select p.id, new.user_id, new.event_id, true
  from public.event_attendees a
  join public.profiles p on p.id = a.user_id
  join auth.users u on u.id = p.id
  where a.event_id = new.event_id
    and u.email like '%@demo.gettogether.test'
    and p.gender = any (v_me.interested_in)
    and v_me.gender = any (p.interested_in)
  order by (coalesce(u.raw_user_meta_data->>'promo', '') = 'true') desc, random()
  limit 10
  on conflict do nothing;
  return new;
end;
$$;

revoke execute on function public.demo_auto_like() from public, anon, authenticated;

drop trigger if exists event_attendees_demo_like on public.event_attendees;
create trigger event_attendees_demo_like
after insert on public.event_attendees
for each row execute function public.demo_auto_like();
