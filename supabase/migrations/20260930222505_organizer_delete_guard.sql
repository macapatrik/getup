-- Organizátor (tým GetUp) si nemůže smazat účet: smazáním by přišel i o přístup do administrace.
-- Nejdřív ho musí někdo z týmu odebrat (admin_remove_organizer).
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Nejsi přihlášený.' using errcode = 'GU401';
  end if;
  if exists (select 1 from public.organizers o where o.user_id = auth.uid()) then
    raise exception 'Organizátor si účet smazat nemůže, nejdřív ho odeberte z týmu.' using errcode = 'GU016';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
