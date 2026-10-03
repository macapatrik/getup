-- V aplikaci jsou jen dvě možnosti pohlaví (žena, muž). Hodnota 'nonbinary' v enumu public.gender
-- zůstává (Postgres hodnoty z enumu neumí odebrat), ale profily ji používat nesmí.
alter table public.profiles
  add constraint profiles_gender_binary
  check (gender in ('woman', 'man') and not ('nonbinary' = any (interested_in)));
