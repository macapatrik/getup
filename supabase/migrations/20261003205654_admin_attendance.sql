-- Tým GetUp může uživatele ručně přidat na akci nebo z ní odebrat (detail uživatele v administraci).
create or replace function public.admin_set_attendance(p_user_id uuid, p_event_id uuid, p_present boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  if not exists (select 1 from public.profiles p where p.id = p_user_id) then
    raise exception 'Uživatel nemá profil.' using errcode = 'GU023';
  end if;
  if not exists (select 1 from public.events e where e.id = p_event_id) then
    raise exception 'Akce neexistuje.' using errcode = 'GU024';
  end if;

  if p_present then
    insert into public.event_attendees (event_id, user_id, visible)
    values (p_event_id, p_user_id, true)
    on conflict do nothing;
  else
    delete from public.event_attendees a where a.event_id = p_event_id and a.user_id = p_user_id;
  end if;
end;
$$;

revoke execute on function public.admin_set_attendance(uuid, uuid, boolean) from public, anon;
grant execute on function public.admin_set_attendance(uuid, uuid, boolean) to authenticated;
