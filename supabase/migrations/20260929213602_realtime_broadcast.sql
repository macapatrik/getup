-- =====================================================================
-- Realtime přes soukromé kanály (škálování na stovky lidí na akci)
--
-- Dřív klient poslouchal změny tabulek (postgres_changes): Realtime musel
-- při každé nové zprávě ověřit RLS zvlášť pro každého připojeného člověka,
-- což při stovkách připojení zprávy zpožďuje. Teď má každý uživatel jeden
-- soukromý kanál `user:<id>` a databáze mu do něj triggerem pošle jen to,
-- co se ho týká (nová zpráva v jeho matchi, nový match). Ověření RLS
-- proběhne jen jednou při připojení ke kanálu.
-- =====================================================================

-- Kdo se smí připojit ke kanálu: jen jeho vlastník (téma `user:<moje id>`).
create policy "realtime: own user channel" on realtime.messages
  for select to authenticated
  using (
    realtime.messages.extension = 'broadcast'
    and realtime.topic() = 'user:' || (select auth.uid())::text
  );

-- Nová zpráva → do kanálu příjemce (odesílatel ji má hned z odpovědi na insert)
create or replace function public.broadcast_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recipient uuid;
begin
  select case when m.user_a = new.sender_id then m.user_b else m.user_a end
    into v_recipient
  from public.matches m where m.id = new.match_id;

  if v_recipient is not null then
    perform realtime.send(
      jsonb_build_object(
        'id', new.id,
        'match_id', new.match_id,
        'sender_id', new.sender_id,
        'body', new.body,
        'created_at', new.created_at
      ),
      'message',
      'user:' || v_recipient::text,
      true
    );
  end if;
  return null;
end;
$$;

-- Nový match → oběma
create or replace function public.broadcast_match()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform realtime.send(jsonb_build_object('match_id', new.id), 'match', 'user:' || new.user_a::text, true);
  perform realtime.send(jsonb_build_object('match_id', new.id), 'match', 'user:' || new.user_b::text, true);
  return null;
end;
$$;

revoke execute on function public.broadcast_message(), public.broadcast_match() from public, anon, authenticated;

create trigger messages_broadcast after insert on public.messages
for each row execute function public.broadcast_message();
create trigger matches_broadcast after insert on public.matches
for each row execute function public.broadcast_match();

-- Sledování změn tabulek už klient nepoužívá.
alter publication supabase_realtime drop table public.messages, public.matches;
