-- Kontakty v profilu: Instagram, Snapchat a telefon (vše nepovinné).
-- Cizí kontakty jsou vidět jen přes get_matches, tedy až po matchi.
alter table public.profiles
  add column instagram text check (instagram is null or (char_length(instagram) <= 30 and instagram ~ '^[a-z0-9_](\.?[a-z0-9_]+)*$')),
  add column snapchat  text check (snapchat is null or snapchat ~ '^[a-z0-9][a-z0-9._-]{1,13}[a-z0-9]$'),
  add column phone     text check (phone is null or phone ~ '^\+[1-9][0-9]{7,14}$');

-- Kontakty se před uložením srovnají (odkaz / @ / mezery pryč, malá písmena, české číslo dostane +420).
create or replace function public.profiles_validate()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.birthdate > (current_date - interval '18 years')::date then
    raise exception 'Musí ti být alespoň 18 let.' using errcode = 'GU010';
  end if;
  -- fotky smí ležet jen ve vlastní složce uživatele
  if exists (
    select 1 from unnest(new.photos) as p(path)
    where p.path !~ ('^' || new.id::text || '/[A-Za-z0-9_-]+\.(jpe?g|png|webp)$')
  ) then
    raise exception 'Neplatná cesta k fotce.' using errcode = 'GU011';
  end if;

  new.instagram := nullif(btrim(coalesce(new.instagram, '')), '');
  if new.instagram is not null then
    new.instagram := regexp_replace(lower(new.instagram), '^(https?://)?(www\.)?instagram\.com/', '');
    new.instagram := regexp_replace(new.instagram, '^@', '');
    new.instagram := nullif(regexp_replace(new.instagram, '[/?#].*$', ''), '');
    if new.instagram is not null
       and (char_length(new.instagram) > 30 or new.instagram !~ '^[a-z0-9_](\.?[a-z0-9_]+)*$') then
      raise exception 'Neplatné jméno na Instagramu.' using errcode = 'GU017';
    end if;
  end if;

  new.snapchat := nullif(btrim(coalesce(new.snapchat, '')), '');
  if new.snapchat is not null then
    new.snapchat := regexp_replace(lower(new.snapchat), '^(https?://)?(www\.)?snapchat\.com/add/', '');
    new.snapchat := regexp_replace(new.snapchat, '^@', '');
    new.snapchat := nullif(regexp_replace(new.snapchat, '[/?#].*$', ''), '');
    if new.snapchat is not null and new.snapchat !~ '^[a-z0-9][a-z0-9._-]{1,13}[a-z0-9]$' then
      raise exception 'Neplatné jméno na Snapchatu.' using errcode = 'GU018';
    end if;
  end if;

  new.phone := nullif(btrim(coalesce(new.phone, '')), '');
  if new.phone is not null then
    new.phone := regexp_replace(new.phone, '[[:space:]().-]', '', 'g');
    new.phone := regexp_replace(new.phone, '^00', '+');
    if new.phone ~ '^[0-9]{9}$' then
      new.phone := '+420' || new.phone;
    end if;
    if new.phone !~ '^\+[1-9][0-9]{7,14}$' then
      raise exception 'Neplatné telefonní číslo.' using errcode = 'GU019';
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;
