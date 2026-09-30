-- Odstraní všechna demo data před ostrým spuštěním.
-- 1) Fotky demo účtů smaž v dashboardu (Storage → photos → složky demo uživatelů),
--    přímé mazání ze storage.objects Supabase přes SQL nepovolí.
-- 2) Pak spusť tohle v SQL Editoru:
drop trigger if exists matches_demo_greeting on public.matches;
drop function if exists public.demo_auto_greeting();
drop trigger if exists event_attendees_demo_like on public.event_attendees;
drop function if exists public.demo_auto_like();

-- smazáním účtů se kaskádou smažou profily, swipy, matche i zprávy
delete from auth.users where email like '%@demo.gettogether.test';
