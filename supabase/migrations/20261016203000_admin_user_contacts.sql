-- Kontakty (Instagram, Snapchat, telefon) pro seznam uživatelů v administraci; e-mail se v seznamu už neukazuje.
create or replace function public.admin_user_contacts(p_ids uuid[])
returns table (id uuid, instagram text, snapchat text, phone text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  return query
    select p.id, p.instagram, p.snapchat, p.phone
    from public.profiles p
    where p.id = any (coalesce(p_ids, '{}'::uuid[]));
end;
$$;
revoke execute on function public.admin_user_contacts(uuid[]) from public, anon;
grant execute on function public.admin_user_contacts(uuid[]) to authenticated;
