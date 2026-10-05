-- Web GetUp (get-up.fun) běží ve stejné aplikaci a čte akce z databáze bez přihlášení.
-- K akci přibývá odkaz na vstupenky, krátký popis a možnost ji na webu skrýt (demo, soukromé akce).

alter table public.events add column if not exists tickets_url text not null default '';
alter table public.events add column if not exists description text not null default '';
alter table public.events add column if not exists hidden boolean not null default false;

comment on column public.events.tickets_url is 'Odkaz na předprodej (Eventlook); prázdný = bez předprodeje';
comment on column public.events.description is 'Krátký popis akce pro web get-up.fun';
comment on column public.events.hidden is 'Neukazovat akci na webu get-up.fun';

update public.events set hidden = true where join_code = 'DEMO26';
update public.events set tickets_url = 'https://www.eventlook.cz/udalosti/tinder-luxouo/' where join_code = 'TINDER26' and tickets_url = '';
update public.events set tickets_url = 'https://www.eventlook.cz/udalosti/halloween-wjcfya/' where join_code = 'HALLO26' and tickets_url = '';

-- Veřejný výpis akcí pro web: i bez přihlášení (anon), bez skrytých a demo akcí, nejnovější první.
create or replace function public.public_events()
returns table (
  id          uuid,
  name        text,
  venue       text,
  starts_at   timestamptz,
  ends_at     timestamptz,
  join_code   text,
  tickets_url text,
  description text
)
language sql
stable
security definer
set search_path = ''
as $$
  select e.id, e.name, e.venue, e.starts_at, e.ends_at, e.join_code, e.tickets_url, e.description
  from public.events e
  where not e.hidden
    and e.join_code <> 'DEMO26'
  order by e.starts_at desc;
$$;

revoke all on function public.public_events() from public;
grant execute on function public.public_events() to anon, authenticated;

-- Administrace: založení a úprava akce i s údaji pro web. Původní verze bez těchto parametrů se jen přejmenují
-- (volání s pojmenovanými parametry by jinak bylo nejednoznačné) a odeberou se jim práva.
alter function public.admin_update_event(uuid, text, text, timestamp, timestamp, text) rename to admin_update_event_old;
alter function public.create_event(text, text, timestamp, timestamp, text) rename to create_event_old;
revoke all on function public.admin_update_event_old(uuid, text, text, timestamp, timestamp, text) from public, anon, authenticated;
revoke all on function public.create_event_old(text, text, timestamp, timestamp, text) from public, anon, authenticated;

create or replace function public.admin_update_event(
  p_event_id    uuid,
  p_name        text,
  p_venue       text,
  p_starts_at   timestamp,
  p_ends_at     timestamp,
  p_time_zone   text default 'Europe/Prague',
  p_tickets_url text default '',
  p_description text default '',
  p_hidden      boolean default false
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_organizer();
  update public.events e
  set name        = btrim(p_name),
      venue       = btrim(coalesce(p_venue, '')),
      starts_at   = p_starts_at at time zone p_time_zone,
      ends_at     = p_ends_at at time zone p_time_zone,
      tickets_url = btrim(coalesce(p_tickets_url, '')),
      description = btrim(coalesce(p_description, '')),
      hidden      = coalesce(p_hidden, false)
  where e.id = p_event_id;
end;
$$;

create or replace function public.create_event(
  p_name        text,
  p_venue       text,
  p_starts_at   timestamp,
  p_ends_at     timestamp,
  p_time_zone   text default 'Europe/Prague',
  p_tickets_url text default '',
  p_description text default '',
  p_hidden      boolean default false
)
returns public.events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.events;
begin
  if not public.is_organizer() then
    raise exception 'Akce můžou zakládat jen organizátoři.' using errcode = 'GU403';
  end if;

  insert into public.events (name, venue, starts_at, ends_at, created_by, tickets_url, description, hidden)
  values (
    btrim(p_name),
    btrim(coalesce(p_venue, '')),
    p_starts_at at time zone p_time_zone,
    p_ends_at at time zone p_time_zone,
    auth.uid(),
    btrim(coalesce(p_tickets_url, '')),
    btrim(coalesce(p_description, '')),
    coalesce(p_hidden, false)
  )
  returning * into v_event;

  return v_event;
end;
$$;

revoke all on function public.admin_update_event(uuid, text, text, timestamp, timestamp, text, text, text, boolean) from public, anon;
revoke all on function public.create_event(text, text, timestamp, timestamp, text, text, text, boolean) from public, anon;
grant execute on function public.admin_update_event(uuid, text, text, timestamp, timestamp, text, text, text, boolean) to authenticated;
grant execute on function public.create_event(text, text, timestamp, timestamp, text, text, text, boolean) to authenticated;
