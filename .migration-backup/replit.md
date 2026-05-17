# GTA 6 Countdown

A graphically styled countdown website to the GTA 6 release on November 19, 2026, with a purple/pink neon aesthetic, animated countdown timer, and custom GTA VI logo.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (artifacts/gta6-countdown)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/gta6-countdown/src/pages/home.tsx` — main countdown page
- `artifacts/gta6-countdown/src/index.css` — all styles (neon purple/pink theme)
- `artifacts/gta6-countdown/public/media/gta6-logo.svg` — GTA VI logo (SVG)

## Product

A single-page countdown site for GTA 6. Features:
- Live countdown timer (days/hours/minutes/seconds) to November 19, 2026
- Custom GTA VI logo with neon glow and floating animation
- Purple/pink/magenta color palette with grid overlay and noise texture
- Glitch effect on the logo every few seconds
- "Created by Rashica07" footer credit bar

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
