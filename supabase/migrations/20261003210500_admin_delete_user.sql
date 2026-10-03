-- Tým GetUp může cizí účet úplně smazat (GDPR žádost, falešný profil). Fotky maže aplikace přes Storage API
-- ještě předtím, profil, swipy, matche a účast na akcích zmizí kaskádou. Organizátora je nutné nejdřív odebrat z týmu.
create or replace function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  if exists (select 1 from public.organizers o where o.user_id = p_user_id) then
    raise exception 'Organizátora nejde smazat, nejdřív ho odeber z týmu.' using errcode = 'GU022';
  end if;
  if not exists (select 1 from auth.users u where u.id = p_user_id) then
    raise exception 'Uživatel neexistuje.' using errcode = 'GU021';
  end if;
  delete from auth.users where id = p_user_id;
end;
$$;

revoke execute on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;
