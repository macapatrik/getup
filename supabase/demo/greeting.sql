-- DEMO: když vznikne match s demo účtem (@demo.gettogether.test), demo účet hned napíše první zprávu.
-- Jen pro ukázky – před ostrým spuštěním odstraň (viz cleanup.sql).
create or replace function public.demo_auto_greeting()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_demo uuid;
  v_greetings text[] := array[
    'Ahoj! 👋 Taky se těšíš na Halloween v K2?',
    'Čau! Konečně match 😄 Kde tě na akci najdu?',
    'Hej! Pojď na drink k baru, první kolo platím 🍹',
    'Ahoj 🙂 Za co jdeš na Halloween? Já mám kostým hotový už od srpna 🎃'
  ];
begin
  select u.id into v_demo
  from auth.users u
  where u.id in (new.user_a, new.user_b) and u.email like '%@demo.gettogether.test'
  limit 1;

  if v_demo is not null then
    insert into public.messages (match_id, sender_id, body)
    values (new.id, v_demo, v_greetings[1 + floor(random() * array_length(v_greetings, 1))::int]);
  end if;
  return new;
end;
$$;

revoke execute on function public.demo_auto_greeting() from public, anon, authenticated;

drop trigger if exists matches_demo_greeting on public.matches;
create trigger matches_demo_greeting
after insert on public.matches
for each row execute function public.demo_auto_greeting();
