-- Smazání účtu musí být potvrzené čerstvým kódem z e-mailu: aplikace před smazáním znovu ověří
-- kód (verifyOtp), čímž vznikne nová session. V JWT je pak v `amr` čas posledního ověření,
-- a ten nesmí být starší než 10 minut. Stará session (třeba zapomenutý přihlášený telefon) účet nesmaže.
-- Původní funkce (ta, co maže řádek v auth.users) zůstává jako delete_account_core bez práv pro uživatele.
alter function public.delete_account() rename to delete_account_core;
revoke execute on function public.delete_account_core() from public, anon, authenticated;

create function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_last_auth bigint;
begin
  if auth.uid() is null then
    raise exception 'Nejsi přihlášený.' using errcode = 'GU401';
  end if;
  if exists (select 1 from public.organizers o where o.user_id = auth.uid()) then
    raise exception 'Organizátor si účet smazat nemůže, nejdřív ho odeberte z týmu.' using errcode = 'GU016';
  end if;

  select max((x->>'timestamp')::bigint) into v_last_auth
  from jsonb_array_elements(coalesce(auth.jwt()->'amr', '[]'::jsonb)) x;
  if v_last_auth is null or v_last_auth < extract(epoch from now())::bigint - 600 then
    raise exception 'Smazání účtu potvrď kódem z e-mailu.' using errcode = 'GU020';
  end if;

  perform public.delete_account_core();
end;
$$;

revoke execute on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
