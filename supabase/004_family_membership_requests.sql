-- ============================================================================
-- Family — demandes d'adhésion en libre-service (lien public + approbation).
-- À exécuter après 001_schema.sql. Idempotent.
--
-- Ajoute un statut pending/active sur profiles : un compte créé via /signup
-- reste "pending" (aucun accès aux données famille via RLS) jusqu'à ce
-- qu'un parent l'approuve depuis /famille.
-- ============================================================================

alter table public.profiles add column if not exists status text not null default 'active' check (status in ('pending','active'));

-- Rôle ET statut pris dans user_metadata (défini au moment de l'inscription) :
-- une inscription libre-service passe status='pending' via les options du
-- signUp() côté client ; un compte créé depuis le dashboard Supabase (sans
-- métadonnées) reste 'active' comme avant, pour ne pas casser le flux
-- d'ajout manuel existant.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role, status)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'adulte'),
    coalesce(new.raw_user_meta_data->>'status', 'active')
  );
  return new;
end;
$$;

-- is_family_member()/is_parent() excluent désormais les comptes "pending" :
-- un compte en attente n'a accès à aucune donnée famille tant qu'il n'est
-- pas approuvé.
create or replace function public.is_family_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'active');
$$;

create or replace function public.is_parent()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'parent' and status = 'active');
$$;

-- Un compte pending doit pouvoir lire sa PROPRE ligne (pour afficher "en
-- attente d'approbation"), et un parent doit voir les profils pending des
-- autres (pour les approuver) : is_family_member() seul ne suffit plus ici.
drop policy if exists "profiles_select_family" on public.profiles;
drop policy if exists "profiles_select_own_or_family" on public.profiles;
create policy "profiles_select_own_or_family" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_family_member());

-- Empêche un compte pending de s'auto-approuver en modifiant son propre
-- statut (le trigger existant prevent_role_self_escalation ne protège que
-- la colonne role, pas status).
create or replace function public.prevent_status_self_escalation()
returns trigger language plpgsql as $$
begin
  if new.status <> old.status and auth.uid() is not null and not public.is_parent() then
    raise exception 'Seul un parent peut approuver un compte.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_no_status_self_escalation on public.profiles;
create trigger trg_profiles_no_status_self_escalation
  before update on public.profiles
  for each row execute function public.prevent_status_self_escalation();

-- Permet à un parent de rejeter une demande (supprime juste la ligne
-- profiles ; le compte auth.users orphelin reste inoffensif : sans ligne
-- profiles, requireFamilyProfile() renvoie vers /login).
drop policy if exists "profiles_delete_parent" on public.profiles;
create policy "profiles_delete_parent" on public.profiles
  for delete to authenticated using (public.is_parent() and id <> auth.uid());

-- ============================================================================
-- Fin de la migration 004.
-- ============================================================================
