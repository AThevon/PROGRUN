@AGENTS.md

# RunTrack (PROGRUN)

App Next.js de suivi d'entraînement running avec sync Strava/Garmin et import de fichiers FIT.

## Stack
- Next.js 16 (App Router) + React 19
- TypeScript
- Drizzle ORM + PostgreSQL (Neon)
- NextAuth.js v5 (Google, GitHub)
- Tailwind CSS v4
- Recharts (graphiques)
- Leaflet / react-leaflet (cartes GPS)
- Serwist (PWA / Service Worker)
- Zod (validation)

## Commandes
- `npm run dev` — serveur de dev
- `npm run build` — build production
- `npm run lint` — ESLint
- `npx tsc --noEmit` — type-check
- `npx drizzle-kit push` — appliquer le schema DB
- `npx drizzle-kit generate` — générer une migration

## Règles

### Base de données
- Le schema est dans `src/lib/db/schema.ts` (Drizzle ORM)
- Après modification du schema, une migration Drizzle est nécessaire
- Les queries sont dans `src/lib/db/queries/` — utiliser les helpers Drizzle (`eq`, `and`, `gte`...) plutôt que `sql` raw

### OAuth / Strava / Garmin
- Les tokens Garmin sont dans la table `users` ; les tokens Strava passent par la table `accounts` (NextAuth)
- Toujours vérifier `res.ok` avant de parser les réponses des API externes
- Le flux OAuth Strava utilise un paramètre `state` CSRF stocké en cookie

### Structure
- `src/app/(app)/` — pages authentifiées
- `src/app/(auth)/` — pages login
- `src/app/api/` — routes API
- `src/components/` — composants React (par domaine : `activity/`, `dashboard/`, `plan/`, `stats/`, `ui/`)
- `src/lib/` — logique métier, DB, auth, utils
- `src/lib/strava/` — sync et OAuth Strava
- `src/lib/garmin/` — intégration Garmin
- `src/lib/db/queries/` — queries DB (activities, plans, records, stats)
