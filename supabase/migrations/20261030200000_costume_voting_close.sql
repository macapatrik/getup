-- Soutěž o kostým na Halloweenu: v 1:00 (31. 10. 2026, 00:00 UTC) se samo zavře hlasování i přihlášky,
-- pořadí zamrzne a vítěze vyhlašujeme na stagi. Ruční přepínače v administraci fungují dál (jde to otevřít znovu).
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;

select cron.schedule(
  'halloween-2026-zavrit-hlasovani',
  '0 0 31 10 *', -- pg_cron běží v UTC: 00:00 UTC = 1:00 středoevropského času
  $$
    update public.events
       set costume_voting_open = false, costume_entries_open = false
     where id = '2b269fde-f28b-4eea-9cd8-4d513d68f7ac';
    select cron.unschedule('halloween-2026-zavrit-hlasovani');
  $$
);
