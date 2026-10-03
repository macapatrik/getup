-- Tým GetUp může upravit profil kteréhokoli uživatele (jméno, texty, kontakty, fotky),
-- aby šlo cokoli opravit nebo odstranit. Podmínky užití to popisují v části „Moderace a správa účtů“.

-- Fotky: organizátoři smí zapisovat a mazat v kterékoli složce bucketu photos.
create policy "photos: organizers manage" on storage.objects
  for all to authenticated
  using (bucket_id = 'photos' and (select public.is_organizer()))
  with check (bucket_id = 'photos' and (select public.is_organizer()));

-- Uložení profilu za uživatele (vytvoří ho, když ještě nemá). Kontroly dělá trigger profiles_validate.
create or replace function public.admin_update_profile(p_user_id uuid, p_profile jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  if not exists (select 1 from auth.users u where u.id = p_user_id) then
    raise exception 'Uživatel neexistuje.' using errcode = 'GU021';
  end if;

  insert into public.profiles (id, display_name, birthdate, gender, interested_in, bio, photos, instagram, snapchat, phone)
  values (
    p_user_id,
    p_profile->>'display_name',
    (p_profile->>'birthdate')::date,
    (p_profile->>'gender')::public.gender,
    (select coalesce(array_agg(x.value::public.gender), '{}') from jsonb_array_elements_text(coalesce(p_profile->'interested_in', '[]'::jsonb)) as x(value)),
    coalesce(p_profile->>'bio', ''),
    (select coalesce(array_agg(x.value), '{}') from jsonb_array_elements_text(coalesce(p_profile->'photos', '[]'::jsonb)) as x(value)),
    p_profile->>'instagram',
    p_profile->>'snapchat',
    p_profile->>'phone'
  )
  on conflict (id) do update set
    display_name  = excluded.display_name,
    birthdate     = excluded.birthdate,
    gender        = excluded.gender,
    interested_in = excluded.interested_in,
    bio           = excluded.bio,
    photos        = excluded.photos,
    instagram     = excluded.instagram,
    snapchat      = excluded.snapchat,
    phone         = excluded.phone;
end;
$$;

revoke execute on function public.admin_update_profile(uuid, jsonb) from public, anon;
grant execute on function public.admin_update_profile(uuid, jsonb) to authenticated;

-- Detail uživatele pro tým: navíc datum narození (kvůli úpravě profilu)
create or replace function public.admin_user(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  perform public.assert_organizer();
  select jsonb_build_object(
    'id', u.id,
    'email', u.email,
    'created_at', u.created_at,
    'last_sign_in_at', u.last_sign_in_at,
    'profile', case when p.id is null then null else jsonb_build_object(
      'display_name', p.display_name,
      'birthdate', p.birthdate,
      'age', date_part('year', age(p.birthdate))::int,
      'gender', p.gender,
      'interested_in', p.interested_in,
      'bio', p.bio,
      'photos', p.photos,
      'instagram', p.instagram,
      'snapchat', p.snapchat,
      'phone', p.phone
    ) end,
    'organizer', exists (select 1 from public.organizers o where o.user_id = u.id),
    'ban', (select jsonb_build_object('reason', b.reason, 'created_at', b.created_at)
            from public.bans b where b.user_id = u.id),
    'stats', jsonb_build_object(
      'likes_given', (select count(*) from public.swipes s where s.swiper_id = u.id and s.liked),
      'likes_received', (select count(*) from public.swipes s where s.swipee_id = u.id and s.liked),
      'matches', (select count(*) from public.matches m where u.id in (m.user_a, m.user_b))
    ),
    'events', coalesce((
      select jsonb_agg(jsonb_build_object('id', e.id, 'name', e.name, 'starts_at', e.starts_at, 'ends_at', e.ends_at, 'visible', a.visible)
                       order by e.starts_at desc)
      from public.event_attendees a
      join public.events e on e.id = a.event_id
      where a.user_id = u.id
    ), '[]'::jsonb),
    'reports', coalesce((
      select jsonb_agg(jsonb_build_object('id', r.id, 'reason', r.reason, 'created_at', r.created_at,
                                          'resolved_at', r.resolved_at, 'reporter', rp.display_name)
                       order by r.created_at desc)
      from public.reports r
      left join public.profiles rp on rp.id = r.reporter_id
      where r.reported_id = u.id
    ), '[]'::jsonb)
  )
  into v_result
  from auth.users u
  left join public.profiles p on p.id = u.id
  where u.id = p_user_id;

  return v_result;
end;
$$;
