-- ============================================================================
-- Family — atelier dessin.
-- À exécuter après 001_schema.sql. Idempotent.
--
-- Contrairement aux voyages/cartes/albums (écriture réservée aux parents),
-- les dessins sont pensés pour être créés directement par les enfants sur un
-- appareil partagé déjà connecté (compte parent OU adulte) : l'écriture est
-- donc ouverte à tout membre de la famille, pas seulement aux parents.
-- ============================================================================

create table if not exists public.drawings (
  id                uuid primary key default gen_random_uuid(),
  child_profile_id  uuid references public.child_profiles(id) on delete set null,
  trip_id           uuid references public.trips(id) on delete set null,
  title             text,
  storage_path      text not null,
  created_at        timestamptz not null default now(),
  created_by        uuid references public.profiles(id)
);
create index if not exists idx_drawings_trip_id on public.drawings(trip_id);
alter table public.drawings enable row level security;

drop policy if exists "drawings_select_family" on public.drawings;
create policy "drawings_select_family" on public.drawings
  for select to authenticated using (public.is_family_member());
drop policy if exists "drawings_write_family" on public.drawings;
create policy "drawings_write_family" on public.drawings
  for insert to authenticated with check (public.is_family_member());
drop policy if exists "drawings_delete_family" on public.drawings;
create policy "drawings_delete_family" on public.drawings
  for delete to authenticated using (public.is_family_member());

-- ============================================================================
-- Storage — bucket privé, lecture/écriture pour tout membre de la famille
-- (même logique que la table : les enfants dessinent sur un appareil déjà
-- connecté, pas besoin d'être parent).
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('drawings', 'drawings', false)
on conflict (id) do nothing;

drop policy if exists "storage_drawings_read_family" on storage.objects;
create policy "storage_drawings_read_family" on storage.objects
  for select to authenticated
  using (bucket_id = 'drawings' and public.is_family_member());

drop policy if exists "storage_drawings_write_family" on storage.objects;
create policy "storage_drawings_write_family" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'drawings' and public.is_family_member());
drop policy if exists "storage_drawings_delete_family" on storage.objects;
create policy "storage_drawings_delete_family" on storage.objects
  for delete to authenticated
  using (bucket_id = 'drawings' and public.is_family_member());

-- ============================================================================
-- Fin de la migration 005.
-- ============================================================================
