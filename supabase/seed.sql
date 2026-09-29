-- Demo akce pro lokální vývoj – připojíš se kódem DEMO26 nebo přes /j/DEMO26
insert into public.events (name, venue, starts_at, ends_at, join_code)
values ('GetUp Demo Party', 'Praha', now() - interval '1 hour', now() + interval '30 days', 'DEMO26')
on conflict (join_code) do nothing;
