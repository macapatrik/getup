-- Jednorázově spustit v Supabase dashboardu: SQL Editor → nový dotaz → vložit celé → Run.
-- Nástroj, kterým se migrace aplikují ze sessions, neumí spouštět příkazy s DROP a mazáním v auth.users
-- bez potvrzení v dashboardu, proto je tahle část ruční. Spustit lze opakovaně.

-- 1) Úklid po zrušení chatu (doplněk k migraci *_remove_chat.sql): tabulka zpráv, triggery a funkce chatu,
--    staré verze funkcí přejmenované na *_old a zkušební funkce.
drop trigger if exists matches_demo_greeting on public.matches;
drop function if exists public.demo_auto_greeting();
drop function if exists public.notify_message_push() cascade;
drop function if exists public.broadcast_message() cascade;
drop table if exists public.messages cascade;
drop function if exists public.get_matches_old(uuid);
drop function if exists public.my_stats_old();
drop function if exists public.event_stats_old(uuid);
drop function if exists public.admin_overview_old();
drop function if exists public.zzz_probe();
drop function if exists public.zzz_probe_fn();

-- 2) Migrace admin_delete_user (mazání cizího účtu z administrace) + záznam do historie migrací.
-- Tým GetUp může cizí účet úplně smazat (GDPR žádost, falešný profil). Fotky maže aplikace přes Storage API
-- ještě předtím, profil, swipy, matche a účast na akcích zmizí kaskádou. Organizátora je nutné nejdřív odebrat z týmu.
create or replace function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  if exists (select 1 from public.organizers o where o.user_id = p_user_id) then
    raise exception 'Organizátora nejde smazat, nejdřív ho odeber z týmu.' using errcode = 'GU022';
  end if;
  if not exists (select 1 from auth.users u where u.id = p_user_id) then
    raise exception 'Uživatel neexistuje.' using errcode = 'GU021';
  end if;
  delete from auth.users where id = p_user_id;
end;
$$;

revoke execute on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;

insert into supabase_migrations.schema_migrations (version, name, statements)
values ('20261003210500', 'admin_delete_user', array['viz supabase/migrations/20261003210500_admin_delete_user.sql'])
on conflict do nothing;
