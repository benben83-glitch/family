# Family — carnet de voyage familial privé

Application privée pour conserver et partager les souvenirs de voyage de la famille : voyages, journal de bord jour par jour, photos/vidéos, et carte du monde. Voir aussi `CONTENT_TO_VALIDATE.md` (si présent) et le cahier des charges d'origine pour la vision complète (univers enfants : cartes d'animaux, quiz, atelier dessin, badges — à venir dans une itération suivante).

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4
- Supabase (auth + Postgres + Storage) — projet dédié, séparé de tout autre projet
- Next.js 16 casse pas mal de conventions connues (params/searchParams toujours des Promises, `proxy.ts` au lieu de `middleware.ts`, etc.) — voir `AGENTS.md` avant de modifier le code.

## Mise en route

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, exécuter `supabase/001_schema.sql` tel quel.
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
- Carte du monde basique (positionnement par latitude/longitude, sans fond de carte illustré).

Pas encore fait (prochaines itérations, voir cahier des charges) :
- Univers enfants : cartes à collectionner, quiz, atelier dessin, memory, missions, badges.
- Sélecteur de profil enfant côté interface (actuellement uniquement des comptes parent/adulte).
- Édition/suppression des voyages et médias, favoris, organisation par lieu/personne/activité.
- PWA / application mobile.
