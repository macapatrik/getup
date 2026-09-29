-- =====================================================================
-- Push upozornění (Web Push) na nový match
--
-- Zařízení si odběr uloží přes RPC save_push_subscription. Když vznikne
-- match, trigger pošle přes pg_net webhook do Next.js (/api/push/match)
-- a ten upozornění rozešle. Adresu a tajný klíč webhooku drží Vault:
--
--   select vault.create_secret('https://<domena>/api/push/match', 'push_webhook_url');
--   select vault.create_secret('<PUSH_WEBHOOK_SECRET z Vercelu>', 'push_webhook_secret');
--
-- Dokud tajemství chybí (např. lokální vývoj), trigger nic neposílá.
-- =====================================================================

create table public.push_subscriptions (
  -- Adresa push služby prohlížeče (Apple, Google, Mozilla, Microsoft)
  endpoint   text primary key check (
    char_length(endpoint) <= 1000
    and endpoint ~ '^https://([a-z0-9-]+\.)*(push\.apple\.com|googleapis\.com|mozilla\.com|mozaws\.net|notify\.windows\.com)/'
  ),
  user_id    uuid not null references auth.users (id) on delete cascade,
  p256dh     text not null check (char_length(p256dh) between 1 and 200),
  auth       text not null check (char_length(auth) between 1 and 100),
  created_at timestamptz not null default now()
);
create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "push: read own" on public.push_subscriptions
  for select to authenticated using (user_id = (select auth.uid()));
create policy "push: delete own" on public.push_subscriptions
  for delete to authenticated using (user_id = (select auth.uid()));

revoke all on public.push_subscriptions from anon, authenticated;
grant select, delete on public.push_subscriptions to authenticated;

-- Uložení odběru. Když se na stejném zařízení přihlásí jiný účet,
-- odběr přejde na něj – upozornění tak nechodí předchozímu uživateli.
create or replace function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Nejsi přihlášený.' using errcode = 'GU401';
  end if;

  insert into public.push_subscriptions (endpoint, user_id, p256dh, auth)
  values (p_endpoint, auth.uid(), p_p256dh, p_auth)
  on conflict (endpoint) do update
    set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth, created_at = now();
end;
$$;

-- Úklid odběrů, které push služba odmítla (zařízení upozornění vypnulo).
-- Volá ho /api/push/match se stejným tajným klíčem, jaký dostal ve webhooku.
create or replace function public.prune_push_subscriptions(p_secret text, p_endpoints text[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_secret text;
begin
  select s.decrypted_secret into v_secret from vault.decrypted_secrets s where s.name = 'push_webhook_secret';
  if v_secret is null or p_secret is distinct from v_secret then
    raise exception 'Na tohle nemáš oprávnění.' using errcode = 'GU403';
  end if;

  delete from public.push_subscriptions where endpoint = any (p_endpoints);
end;
$$;

-- Webhook po vzniku matche. Upozornění dostane ten, kdo zrovna neswipoval
-- (swipující vidí match hned v aplikaci). Bez přihlášeného uživatele oba.
create or replace function public.notify_match_push()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url    text;
  v_secret text;
  v_items  jsonb;
begin
  select s.decrypted_secret into v_url from vault.decrypted_secrets s where s.name = 'push_webhook_url';
  select s.decrypted_secret into v_secret from vault.decrypted_secrets s where s.name = 'push_webhook_secret';
  if v_url is null or v_secret is null then
    return new;
  end if;

  select jsonb_agg(jsonb_build_object(
           'match_id', new.id,
           'name', p.display_name,
           'photo', p.photos[1],
           'event', e.name,
           'subscriptions', subs.list))
    into v_items
  from (values (new.user_a, new.user_b), (new.user_b, new.user_a)) as pair (recipient, other)
  join public.profiles p on p.id = pair.other
  left join public.events e on e.id = new.event_id
  cross join lateral (
    select jsonb_agg(jsonb_build_object('endpoint', ps.endpoint, 'p256dh', ps.p256dh, 'auth', ps.auth)) as list
    from public.push_subscriptions ps
    where ps.user_id = pair.recipient
  ) subs
  where pair.recipient is distinct from auth.uid()
    and subs.list is not null;

  if v_items is not null then
    perform net.http_post(
      url := v_url,
      body := jsonb_build_object('notifications', v_items),
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_secret),
      timeout_milliseconds := 10000
    );
  end if;
  return new;
end;
$$;

create trigger matches_push
after insert on public.matches
for each row execute function public.notify_match_push();

revoke execute on function
  public.save_push_subscription(text, text, text),
  public.prune_push_subscriptions(text, text[]),
  public.notify_match_push()
from public, anon, authenticated;
grant execute on function public.save_push_subscription(text, text, text) to authenticated;
grant execute on function public.prune_push_subscriptions(text, text[]) to anon, authenticated;
