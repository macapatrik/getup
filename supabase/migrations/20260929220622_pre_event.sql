-- =====================================================================
-- Doba před akcí: počet lidí na akci pro účastníky + push na novou zprávu
-- =====================================================================

-- Kolik lidí je na akcích, na kterých jsem i já (zablokované nepočítáme).
create or replace function public.attendee_counts(p_event_ids uuid[])
returns table (event_id uuid, attendees bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select a.event_id, count(*)
  from public.event_attendees a
  where a.event_id = any (p_event_ids)
    and exists (
      select 1 from public.event_attendees me
      where me.event_id = a.event_id and me.user_id = (select auth.uid())
    )
    and not exists (select 1 from public.bans b where b.user_id = a.user_id)
  group by a.event_id;
$$;

revoke execute on function public.attendee_counts(uuid[]) from public, anon, authenticated;
grant execute on function public.attendee_counts(uuid[]) to authenticated;

-- Nová zpráva → push příjemci (stejný webhook jako u matche, jen cesta /api/push/message).
-- Aplikace upozornění neukáže, když má příjemce ten chat zrovna otevřený (řeší service worker).
create or replace function public.notify_message_push()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url       text;
  v_secret    text;
  v_recipient uuid;
  v_subs      jsonb;
  v_sender    public.profiles;
begin
  select s.decrypted_secret into v_url from vault.decrypted_secrets s where s.name = 'push_webhook_url';
  select s.decrypted_secret into v_secret from vault.decrypted_secrets s where s.name = 'push_webhook_secret';
  if v_url is null or v_secret is null then
    return null;
  end if;

  select case when m.user_a = new.sender_id then m.user_b else m.user_a end
    into v_recipient
  from public.matches m where m.id = new.match_id;
  if v_recipient is null then
    return null;
  end if;

  select jsonb_agg(jsonb_build_object('endpoint', ps.endpoint, 'p256dh', ps.p256dh, 'auth', ps.auth))
    into v_subs
  from public.push_subscriptions ps where ps.user_id = v_recipient;
  if v_subs is null then
    return null;
  end if;

  select p.* into v_sender from public.profiles p where p.id = new.sender_id;

  perform net.http_post(
    url := replace(v_url, '/api/push/match', '/api/push/message'),
    body := jsonb_build_object('notifications', jsonb_build_array(jsonb_build_object(
      'match_id', new.match_id,
      'name', coalesce(v_sender.display_name, 'Někdo'),
      'photo', v_sender.photos[1],
      'body', left(new.body, 140),
      'subscriptions', v_subs
    ))),
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_secret),
    timeout_milliseconds := 10000
  );
  return null;
end;
$$;

revoke execute on function public.notify_message_push() from public, anon, authenticated;

create trigger messages_push
after insert on public.messages
for each row execute function public.notify_message_push();
