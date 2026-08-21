-- ============================================================================
-- Family — "Cherche et trouve" : retrouver un animal sur une photo de voyage.
-- À exécuter après 001_schema.sql. Idempotent.
--
-- Un défi = une photo existante (table media) + un point cible normalisé
-- (0-1 en x/y, indépendant de la résolution/taille d'affichage réelle) +
-- un libellé ("la girafe"). Créé par un parent, joué par toute la famille.
-- ============================================================================

create table if not exists public.find_challenges (
  id            uuid primary key default gen_random_uuid(),
  media_id      uuid not null references public.media(id) on delete cascade,
  target_label  text not null,
  target_x      double precision not null check (target_x between 0 and 1),
  target_y      double precision not null check (target_y between 0 and 1),
  created_at    timestamptz not null default now(),
  created_by    uuid references public.profiles(id)
);
create index if not exists idx_find_challenges_media_id on public.find_challenges(media_id);
alter table public.find_challenges enable row level security;

drop policy if exists "find_challenges_select_family" on public.find_challenges;
create policy "find_challenges_select_family" on public.find_challenges
  for select to authenticated using (public.is_family_member());
drop policy if exists "find_challenges_write_parent" on public.find_challenges;
create policy "find_challenges_write_parent" on public.find_challenges
  for insert to authenticated with check (public.is_parent());
drop policy if exists "find_challenges_delete_parent" on public.find_challenges;
create policy "find_challenges_delete_parent" on public.find_challenges
  for delete to authenticated using (public.is_parent());

-- ============================================================================
-- Fin de la migration 006. Pas de nouveau bucket : réutilise les photos déjà
-- présentes dans le bucket privé "trip-media".
-- ============================================================================
