# RunTrack

Running training tracker with Strava/Garmin sync, FIT/TCX/GPX file import, training plans, and detailed stats. Built as a PWA for mobile-first usage.

<!-- ![RunTrack Screenshot](screenshot.png) -->

## Features

- **Strava & Garmin sync** — OAuth-based activity sync
- **File import** — FIT, TCX, GPX support via drag & drop
- **Training plans** — create and follow structured plans
- **Stats & charts** — weekly/monthly breakdowns with Recharts
- **GPS maps** — activity route visualization with Leaflet
- **PWA** — installable, works offline via Service Worker

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Auth | NextAuth.js v5 (Google, GitHub) |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Maps | Leaflet / react-leaflet |
| PWA | Serwist |
| Validation | Zod |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database ([Neon](https://neon.tech) recommended)
- Strava API app (for sync)

### Setup

```bash
git clone https://github.com/<your-username>/PROGRUN.git
cd PROGRUN
npm install
```

Create a `.env.local` file:

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
```

Push the database schema:

```bash
npx drizzle-kit push
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check |
| `npx drizzle-kit push` | Apply DB schema |
| `npx drizzle-kit generate` | Generate migration |

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Authenticated pages
│   ├── (auth)/         # Login pages
│   └── api/            # API routes
├── components/
│   ├── activity/       # Activity-related components
│   ├── dashboard/      # Dashboard widgets
│   ├── plan/           # Training plan components
│   ├── stats/          # Stats & charts
│   └── ui/             # Shared UI primitives
├── lib/
│   ├── db/
│   │   ├── schema.ts   # Drizzle schema
│   │   └── queries/    # DB query helpers
│   ├── strava/         # Strava OAuth & sync
│   ├── garmin/         # Garmin integration
│   └── ...             # Auth, utils
└── types/
```
