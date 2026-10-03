-- Úklid po zrušení chatu (doplněk k migraci *_remove_chat.sql).
-- Spusť jednou v Supabase dashboardu: SQL Editor → nový dotaz → Run.
-- Smaže tabulku zpráv (všechny zprávy byly jen z demo účtů), triggery a funkce chatu
-- a staré verze funkcí, které migrace jen přejmenovala na *_old.
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
