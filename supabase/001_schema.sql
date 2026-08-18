-- ============================================================================
-- Family — carnet de voyage familial privé. Schéma Postgres + RLS.
-- À coller et exécuter tel quel dans Supabase → SQL Editor, une seule fois.
-- Idempotent : peut être ré-exécuté sans dupliquer.
--
-- Portée v1 : profils famille, voyages, journées de voyage, médias (photos/
-- vidéos). Les entités "univers enfants" (cartes animaux, quiz, dessin,
-- badges) seront ajoutées dans une migration ultérieure (002_*.sql) une fois
-- la v1 en place.
-- ============================================================================

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- profiles — comptes authentifiés : parents (admins) et autres adultes de la
-- famille. Les enfants n'ont pas de compte séparé en v1 (profil sélectionné
-- côté client sur un appareil déjà connecté par un parent, voir
-- child_profiles) : cet écran simplifié n'a donc pas besoin de RLS propre.
-- ============================================================================

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  avatar_url text,
  role       text not null default 'adulte' check (role in ('parent','adulte')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Rôle pris dans user_metadata.role (défini au moment de l'invite), sinon
-- 'adulte' (le moins privilégié) par sécurité.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'adulte')
  );
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- SECURITY DEFINER : lit profiles en contournant sa propre RLS (évite la
-- récursion "RLS sur profiles qui doit lire profiles"). search_path fixé
-- pour éviter le détournement de privilèges via un search_path contrôlé
-- par l'appelant.
create or replace function public.is_family_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

create or replace function public.is_parent()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'parent');
$$;

grant execute on function public.is_family_member() to authenticated;
grant execute on function public.is_parent() to authenticated;

drop policy if exists "profiles_select_family" on public.profiles;
create policy "profiles_select_family" on public.profiles
  for select to authenticated using (public.is_family_member());

drop policy if exists "profiles_update_own_or_parent" on public.profiles;
create policy "profiles_update_own_or_parent" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_parent())
  with check (id = auth.uid() or public.is_parent());

-- Empêche un compte 'adulte' de s'auto-promouvoir 'parent'.
create or replace function public.prevent_role_self_escalation()
returns trigger language plpgsql as $$
begin
  if new.role <> old.role and not public.is_parent() then
    raise exception 'Seul un parent peut changer un rôle.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_no_self_escalation on public.profiles;
create trigger trg_profiles_no_self_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

-- ============================================================================
-- child_profiles — profils enfants (pas de compte auth séparé en v1).
-- ============================================================================

create table if not exists public.child_profiles (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  avatar_emoji text not null default '🧒',
  birth_date  date,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.child_profiles enable row level security;
drop trigger if exists trg_child_profiles_updated_at on public.child_profiles;
create trigger trg_child_profiles_updated_at before update on public.child_profiles
  for each row execute function public.set_updated_at();

drop policy if exists "child_profiles_select_family" on public.child_profiles;
create policy "child_profiles_select_family" on public.child_profiles
  for select to authenticated using (public.is_family_member());
drop policy if exists "child_profiles_write_parent" on public.child_profiles;
create policy "child_profiles_write_parent" on public.child_profiles
  for insert to authenticated with check (public.is_parent());
drop policy if exists "child_profiles_update_parent" on public.child_profiles;
create policy "child_profiles_update_parent" on public.child_profiles
  for update to authenticated using (public.is_parent()) with check (public.is_parent());
drop policy if exists "child_profiles_delete_parent" on public.child_profiles;
create policy "child_profiles_delete_parent" on public.child_profiles
  for delete to authenticated using (public.is_parent());

-- ============================================================================
-- trips — un voyage. latitude/longitude servent au pin sur la carte du monde.
-- ============================================================================

create table if not exists public.trips (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  country       text not null,
  city          text,
  cover_image   jsonb,
  start_date    date not null,
  end_date      date,
  summary       text,
  latitude      double precision not null,
  longitude     double precision not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references public.profiles(id)
);
alter table public.trips enable row level security;
drop trigger if exists trg_trips_updated_at on public.trips;
create trigger trg_trips_updated_at before update on public.trips
  for each row execute function public.set_updated_at();

drop policy if exists "trips_select_family" on public.trips;
create policy "trips_select_family" on public.trips
  for select to authenticated using (public.is_family_member());
drop policy if exists "trips_write_parent" on public.trips;
create policy "trips_write_parent" on public.trips
  for insert to authenticated with check (public.is_parent());
drop policy if exists "trips_update_parent" on public.trips;
create policy "trips_update_parent" on public.trips
  for update to authenticated using (public.is_parent()) with check (public.is_parent());
drop policy if exists "trips_delete_parent" on public.trips;
create policy "trips_delete_parent" on public.trips
  for delete to authenticated using (public.is_parent());

-- ============================================================================
-- trip_days — timeline jour par jour d'un voyage.
-- ============================================================================

create table if not exists public.trip_days (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references public.trips(id) on delete cascade,
  day_number  int not null,
  date        date,
  title       text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (trip_id, day_number)
);
create index if not exists idx_trip_days_trip_id on public.trip_days(trip_id);
alter table public.trip_days enable row level security;
drop trigger if exists trg_trip_days_updated_at on public.trip_days;
create trigger trg_trip_days_updated_at before update on public.trip_days
  for each row execute function public.set_updated_at();

drop policy if exists "trip_days_select_family" on public.trip_days;
create policy "trip_days_select_family" on public.trip_days
  for select to authenticated using (public.is_family_member());
drop policy if exists "trip_days_write_parent" on public.trip_days;
create policy "trip_days_write_parent" on public.trip_days
  for insert to authenticated with check (public.is_parent());
drop policy if exists "trip_days_update_parent" on public.trip_days;
create policy "trip_days_update_parent" on public.trip_days
  for update to authenticated using (public.is_parent()) with check (public.is_parent());
drop policy if exists "trip_days_delete_parent" on public.trip_days;
create policy "trip_days_delete_parent" on public.trip_days
  for delete to authenticated using (public.is_parent());

-- ============================================================================
-- media — photos et vidéos d'un voyage, éventuellement rattachées à un jour.
-- storage_path pointe vers le bucket privé "trip-media" (jamais d'URL
-- publique directe, voir policies storage plus bas).
-- ============================================================================

create table if not exists public.media (
  id            uuid primary key default gen_random_uuid(),
  trip_id       uuid not null references public.trips(id) on delete cascade,
  trip_day_id   uuid references public.trip_days(id) on delete set null,
  type          text not null check (type in ('photo','video')),
  storage_path  text not null,
  caption       text,
  is_favorite   boolean not null default false,
  taken_at      timestamptz,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  created_by    uuid references public.profiles(id)
);
create index if not exists idx_media_trip_id on public.media(trip_id);
create index if not exists idx_media_trip_day_id on public.media(trip_day_id);
alter table public.media enable row level security;

drop policy if exists "media_select_family" on public.media;
create policy "media_select_family" on public.media
  for select to authenticated using (public.is_family_member());
drop policy if exists "media_write_parent" on public.media;
create policy "media_write_parent" on public.media
  for insert to authenticated with check (public.is_parent());
drop policy if exists "media_update_parent" on public.media;
create policy "media_update_parent" on public.media
  for update to authenticated using (public.is_parent()) with check (public.is_parent());
drop policy if exists "media_delete_parent" on public.media;
create policy "media_delete_parent" on public.media
  for delete to authenticated using (public.is_parent());

-- ============================================================================
-- Storage — bucket privé (pas de lecture publique/anonyme : accès uniquement
-- via URL signée générée côté serveur pour un membre de la famille connecté).
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('trip-media', 'trip-media', false)
on conflict (id) do nothing;

drop policy if exists "storage_trip_media_read_family" on storage.objects;
create policy "storage_trip_media_read_family" on storage.objects
  for select to authenticated
  using (bucket_id = 'trip-media' and public.is_family_member());

drop policy if exists "storage_trip_media_write_parent" on storage.objects;
create policy "storage_trip_media_write_parent" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'trip-media' and public.is_parent());
drop policy if exists "storage_trip_media_update_parent" on storage.objects;
create policy "storage_trip_media_update_parent" on storage.objects
  for update to authenticated
  using (bucket_id = 'trip-media' and public.is_parent());
drop policy if exists "storage_trip_media_delete_parent" on storage.objects;
create policy "storage_trip_media_delete_parent" on storage.objects
  for delete to authenticated
  using (bucket_id = 'trip-media' and public.is_parent());

-- ============================================================================
-- Fin du schéma v1. Étape suivante : créer le premier compte dans
-- Authentication → Add user, avec user_metadata { "role": "parent" }.
-- ============================================================================
