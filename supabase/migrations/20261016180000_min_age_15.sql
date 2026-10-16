-- Aplikace od 15 let. Nezletilí (15–17) a dospělí (18+) se navzájem nevidí ani nemůžou swipovat,
-- takže dospělý nikdy nedostane match ani kontakt na nezletilého a naopak.

-- true, když jsou oba ve stejné věkové skupině (oba pod 18, nebo oba 18+)
create or replace function public.same_age_band(p_a date, p_b date)
returns boolean
language sql
stable
set search_path = ''
as $$
  select (p_a <= (current_date - interval '18 years')::date) = (p_b <= (current_date - interval '18 years')::date);
$$;
revoke execute on function public.same_age_band(date, date) from public, anon;
grant execute on function public.same_age_band(date, date) to authenticated;

do $$
declare src text;
begin
  -- minimální věk 18 -> 15
  src := pg_get_functiondef('public.profiles_validate'::regproc);
  src := replace(src, $q$interval '18 years')::date then
    raise exception 'Musí ti být alespoň 18 let.'$q$, $q$interval '15 years')::date then
    raise exception 'Musí ti být alespoň 15 let.'$q$);
  if src not like '%alespoň 15 let%' then raise exception 'profiles_validate: věková kontrola nenalezena'; end if;
  execute src;

  -- balíček: jen lidé ze stejné věkové skupiny
  src := pg_get_functiondef('public.get_deck'::regproc);
  if src not like '%same_age_band%' then
    src := replace(src, '      and p.id <> v_uid
', '      and p.id <> v_uid
      and public.same_age_band(v_me.birthdate, p.birthdate)
');
    if src not like '%same_age_band%' then raise exception 'get_deck: místo pro věkový filtr nenalezeno'; end if;
    execute src;
  end if;

  -- swipe: odmítne cíl z jiné věkové skupiny (i při ručně poslaném požadavku)
  src := pg_get_functiondef('public.swipe'::regproc);
  if src not like '%same_age_band%' then
    src := replace(src, '  perform pg_advisory_xact_lock(', '  if not exists (
    select 1 from public.profiles me, public.profiles them
    where me.id = v_uid and them.id = p_target
      and public.same_age_band(me.birthdate, them.birthdate)
  ) then
    raise exception ''Tenhle profil už není k dispozici.'' using errcode = ''GU005'';
  end if;

  perform pg_advisory_xact_lock(');
    if src not like '%same_age_band%' then raise exception 'swipe: místo pro věkovou kontrolu nenalezeno'; end if;
    execute src;
  end if;
end $$;
