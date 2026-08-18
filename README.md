# Family — carnet de voyage familial privé

Application privée pour conserver et partager les souvenirs de voyage de la famille : voyages, journal de bord jour par jour, photos/vidéos, et carte du monde. Voir aussi `CONTENT_TO_VALIDATE.md` (si présent) et le cahier des charges d'origine pour la vision complète (univers enfants : cartes d'animaux, quiz, atelier dessin, badges — à venir dans une itération suivante).

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4
- Supabase (auth + Postgres + Storage) — projet dédié, séparé de tout autre projet
- Next.js 16 casse pas mal de conventions connues (params/searchParams toujours des Promises, `proxy.ts` au lieu de `middleware.ts`, etc.) — voir `AGENTS.md` avant de modifier le code.

## Mise en route

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, exécuter `supabase/001_schema.sql` puis `supabase/002_kids_universe.sql` (dans cet ordre), tels quels.
3. Dans **Authentication → Add user**, créer le premier compte avec `user_metadata` :
   ```json
   { "role": "parent", "full_name": "Prénom Nom" }
   ```
   (rôle `parent` = peut créer des voyages, ajouter des photos/journées ; `adulte` = lecture seule.)
4. Copier `.env.example` vers `.env.local` et renseigner `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API).
5. `npm install && npm run dev`, puis se connecter sur `/login` avec le compte créé à l'étape 3.

## État actuel (v1)

Fait :
- Authentification Supabase, tout le site est privé (redirection vers `/login` sinon).
- Profils famille (`profiles`, rôles parent/adulte) + profils enfants (`child_profiles`, sans compte séparé pour l'instant).
- Accueil avec entrées visuelles et derniers souvenirs.
- Nos voyages : liste, création (parents), page détail avec couverture, résumé, upload photos/vidéos et journal jour par jour.
- Carte du monde interactive (vrais contours des continents, zoom/déplacement, pays colorés) avec les voyages positionnés dessus.
- Suppression de photos/vidéos (avec confirmation) et agrandissement plein écran.
- Univers enfants (v1) : « Club des Explorateurs », sélecteur de profil enfant (sans compte séparé, mémorisé localement), catalogue de cartes animaux avec rareté, cartes verrouillées/débloquées selon les voyages, page détail par carte, gestion des cartes par les parents.

Pas encore fait (prochaines itérations, voir cahier des charges) :
- Quiz, atelier dessin, memory, missions, badges/trophées (univers enfants, suite).
- Suivi individuel par enfant (actuellement la collection de cartes est partagée au niveau de la famille, pas par enfant — pas de compte séparé pour les enfants).
- Édition des voyages et journées, favoris, organisation des photos par lieu/personne/activité.
- PWA / application mobile.
