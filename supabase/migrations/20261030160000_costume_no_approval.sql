-- Soutěž o kostým bez schvalování: kostým se v galerii ukáže hned po nahrání a fotku už nejde vyměnit ani stáhnout.
-- Tým během večera kontroluje a podvodníky vyřadí (admin_set_costume_entry_status → 'rejected', hlasy pro ně zmizí).

create or replace function public.submit_costume_entry(p_event_id uuid, p_photo text, p_title text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'Nejsi přihlášený.' using errcode = 'GU401';
  end if;
  if not exists (select 1 from public.event_attendees a where a.event_id = p_event_id and a.user_id = v_uid) then
    raise exception 'Nejsi na téhle akci.' using errcode = 'GU004';
  end if;
  if not exists (select 1 from public.events e where e.id = p_event_id and e.costume_contest and e.costume_entries_open) then
    raise exception 'Přihlášky do soutěže nejsou otevřené.' using errcode = 'GU030';
  end if;
  if p_photo is null or p_photo !~ ('^' || v_uid::text || '/[A-Za-z0-9_-]+\.(jpe?g|png|webp)$') then
    raise exception 'Neplatná cesta k fotce.' using errcode = 'GU011';
  end if;
  -- Jedna přihláška napořád (i po vyřazení týmem).
  if exists (select 1 from public.costume_entries c where c.event_id = p_event_id and c.user_id = v_uid) then
    raise exception 'Kostým už máš přihlášený.' using errcode = 'GU039';
  end if;

  insert into public.costume_entries (event_id, user_id, title, photo, status)
  values (p_event_id, v_uid, left(btrim(coalesce(p_title, '')), 60), p_photo, 'approved')
  returning id into v_id;
  return v_id;
end;
$$;

-- Stáhnout kostým už nejde (fotka se nesmí měnit); vyřadit ho může jen tým.
create or replace function public.withdraw_costume_entry(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'Kostým už máš přihlášený.' using errcode = 'GU039';
end;
$$;
