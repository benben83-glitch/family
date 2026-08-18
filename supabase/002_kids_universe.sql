-- ============================================================================
-- Family — univers enfants v1 : cartes à collectionner (animaux).
-- À exécuter après 001_schema.sql. Idempotent.
--
-- Portée v1 : catalogue de cartes animaux, lien voyage <-> carte ("animaux
-- découverts pendant ce voyage"). La collection est partagée au niveau de la
-- famille (une carte débloquée l'est pour tous les enfants) : les enfants
-- n'ayant pas de compte séparé (voir child_profiles dans 001_schema.sql), il
-- n'y a pas de suivi individuel par enfant en v1. Quiz, memory, dessin,
-- missions et badges viendront dans une migration ultérieure.
-- ============================================================================

-- ============================================================================
-- animal_cards
-- ============================================================================

create table if not exists public.animal_cards (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  species       text,
  habitat       text,
  diet          text not null check (diet in ('carnivore','herbivore','omnivore','piscivore','insectivore','autre')),
  continent     text,
  size_label    text,
  weight_label  text,
  speed_label   text,
  danger_label  text,
  fun_fact      text,
  image         jsonb,
  rarity        text not null default 'commune' check (rarity in ('commune','rare','tres_rare','epique','legendaire')),
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references public.profiles(id)
);
alter table public.animal_cards enable row level security;
drop trigger if exists trg_animal_cards_updated_at on public.animal_cards;
create trigger trg_animal_cards_updated_at before update on public.animal_cards
  for each row execute function public.set_updated_at();

drop policy if exists "animal_cards_select_family" on public.animal_cards;
create policy "animal_cards_select_family" on public.animal_cards
  for select to authenticated using (public.is_family_member());
drop policy if exists "animal_cards_write_parent" on public.animal_cards;
create policy "animal_cards_write_parent" on public.animal_cards
  for insert to authenticated with check (public.is_parent());
drop policy if exists "animal_cards_update_parent" on public.animal_cards;
create policy "animal_cards_update_parent" on public.animal_cards
  for update to authenticated using (public.is_parent()) with check (public.is_parent());
drop policy if exists "animal_cards_delete_parent" on public.animal_cards;
create policy "animal_cards_delete_parent" on public.animal_cards
  for delete to authenticated using (public.is_parent());

-- ============================================================================
-- trip_animal_cards — une carte est "débloquée" dès qu'elle est associée à
-- au moins un voyage.
-- ============================================================================

create table if not exists public.trip_animal_cards (
  trip_id        uuid not null references public.trips(id) on delete cascade,
  animal_card_id uuid not null references public.animal_cards(id) on delete cascade,
  created_at     timestamptz not null default now(),
  primary key (trip_id, animal_card_id)
);
create index if not exists idx_trip_animal_cards_animal_card_id on public.trip_animal_cards(animal_card_id);
alter table public.trip_animal_cards enable row level security;

drop policy if exists "trip_animal_cards_select_family" on public.trip_animal_cards;
create policy "trip_animal_cards_select_family" on public.trip_animal_cards
  for select to authenticated using (public.is_family_member());
drop policy if exists "trip_animal_cards_write_parent" on public.trip_animal_cards;
create policy "trip_animal_cards_write_parent" on public.trip_animal_cards
  for insert to authenticated with check (public.is_parent());
drop policy if exists "trip_animal_cards_delete_parent" on public.trip_animal_cards;
create policy "trip_animal_cards_delete_parent" on public.trip_animal_cards
  for delete to authenticated using (public.is_parent());

-- ============================================================================
-- Storage — artwork des cartes (même politique que trip-media : bucket privé,
-- lecture famille, écriture parent).
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('animal-cards', 'animal-cards', false)
on conflict (id) do nothing;

drop policy if exists "storage_animal_cards_read_family" on storage.objects;
create policy "storage_animal_cards_read_family" on storage.objects
  for select to authenticated
  using (bucket_id = 'animal-cards' and public.is_family_member());

drop policy if exists "storage_animal_cards_write_parent" on storage.objects;
create policy "storage_animal_cards_write_parent" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'animal-cards' and public.is_parent());
drop policy if exists "storage_animal_cards_update_parent" on storage.objects;
create policy "storage_animal_cards_update_parent" on storage.objects
  for update to authenticated
  using (bucket_id = 'animal-cards' and public.is_parent());
drop policy if exists "storage_animal_cards_delete_parent" on storage.objects;
create policy "storage_animal_cards_delete_parent" on storage.objects
  for delete to authenticated
  using (bucket_id = 'animal-cards' and public.is_parent());

-- ============================================================================
-- Fin de la migration 002.
-- ============================================================================
