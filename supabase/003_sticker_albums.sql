-- ============================================================================
-- Family — album de stickers façon Panini.
-- À exécuter après 001_schema.sql et 002_kids_universe.sql. Idempotent.
--
-- Distinct des animal_cards (002) : ici pas de fiche animalière ni de lien
-- avec les voyages, juste des pages à thème (décor : savane, forêt
-- amazonienne...) avec des emplacements vides que la famille remplit
-- elle-même avec ses propres images (PNG/JPEG) au fil du temps.
-- ============================================================================

-- ============================================================================
-- sticker_albums — une page/thème d'album.
-- ============================================================================

create table if not exists public.sticker_albums (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  description       text,
  background_image  jsonb,
  slot_count        int not null check (slot_count between 1 and 100),
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid references public.profiles(id)
);
alter table public.sticker_albums enable row level security;
drop trigger if exists trg_sticker_albums_updated_at on public.sticker_albums;
create trigger trg_sticker_albums_updated_at before update on public.sticker_albums
  for each row execute function public.set_updated_at();

drop policy if exists "sticker_albums_select_family" on public.sticker_albums;
create policy "sticker_albums_select_family" on public.sticker_albums
  for select to authenticated using (public.is_family_member());
drop policy if exists "sticker_albums_write_parent" on public.sticker_albums;
create policy "sticker_albums_write_parent" on public.sticker_albums
  for insert to authenticated with check (public.is_parent());
drop policy if exists "sticker_albums_update_parent" on public.sticker_albums;
create policy "sticker_albums_update_parent" on public.sticker_albums
  for update to authenticated using (public.is_parent()) with check (public.is_parent());
drop policy if exists "sticker_albums_delete_parent" on public.sticker_albums;
create policy "sticker_albums_delete_parent" on public.sticker_albums
  for delete to authenticated using (public.is_parent());

-- ============================================================================
-- sticker_slots — emplacements numérotés d'un album, vides jusqu'à ce
-- qu'une image y soit déposée.
-- ============================================================================

create table if not exists public.sticker_slots (
  id           uuid primary key default gen_random_uuid(),
  album_id     uuid not null references public.sticker_albums(id) on delete cascade,
  slot_number  int not null,
  label        text,
  image        jsonb,
  filled_at    timestamptz,
  created_at   timestamptz not null default now(),
  unique (album_id, slot_number)
);
create index if not exists idx_sticker_slots_album_id on public.sticker_slots(album_id);
alter table public.sticker_slots enable row level security;

drop policy if exists "sticker_slots_select_family" on public.sticker_slots;
create policy "sticker_slots_select_family" on public.sticker_slots
  for select to authenticated using (public.is_family_member());
drop policy if exists "sticker_slots_write_parent" on public.sticker_slots;
create policy "sticker_slots_write_parent" on public.sticker_slots
  for insert to authenticated with check (public.is_parent());
drop policy if exists "sticker_slots_update_parent" on public.sticker_slots;
create policy "sticker_slots_update_parent" on public.sticker_slots
  for update to authenticated using (public.is_parent()) with check (public.is_parent());
drop policy if exists "sticker_slots_delete_parent" on public.sticker_slots;
create policy "sticker_slots_delete_parent" on public.sticker_slots
  for delete to authenticated using (public.is_parent());

-- ============================================================================
-- Storage — décors d'album + images des stickers (même politique que les
-- autres buckets : privé, lecture famille, écriture parent).
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('sticker-albums', 'sticker-albums', false)
on conflict (id) do nothing;

drop policy if exists "storage_sticker_albums_read_family" on storage.objects;
create policy "storage_sticker_albums_read_family" on storage.objects
  for select to authenticated
  using (bucket_id = 'sticker-albums' and public.is_family_member());

drop policy if exists "storage_sticker_albums_write_parent" on storage.objects;
create policy "storage_sticker_albums_write_parent" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'sticker-albums' and public.is_parent());
drop policy if exists "storage_sticker_albums_update_parent" on storage.objects;
create policy "storage_sticker_albums_update_parent" on storage.objects
  for update to authenticated
  using (bucket_id = 'sticker-albums' and public.is_parent());
drop policy if exists "storage_sticker_albums_delete_parent" on storage.objects;
create policy "storage_sticker_albums_delete_parent" on storage.objects
  for delete to authenticated
  using (bucket_id = 'sticker-albums' and public.is_parent());

-- ============================================================================
-- Fin de la migration 003.
-- ============================================================================
