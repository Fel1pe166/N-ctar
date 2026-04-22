# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Néctar Agency (artifacts/nectar-agency)

Premium PT-BR ad platform with dark gamer aesthetic (black + neon yellow).

- **Frontend**: React + Vite + Wouter + TanStack Query + Tailwind 4 + Recharts
- **Auth**: Clerk (whitelabel modal sign-in/up + dedicated `/sign-in` `/sign-up` pages)
- **Pages**: `/` Landing, `/dashboard`, `/ads`, `/ads/:id`, `/a/:id` public ad page, `/plans`, `/sign-in`, `/sign-up`
- **Global overlays**: animated particles backdrop, sales-feed notifications (bottom-left), Discord-style support chat (bottom-right)
- **Plans**: Free, Básico, Médio, Avançado, Ilimitado — checkout is a stub that instantly upgrades the user (Mercado Pago to be wired later)
- **Ad tracking**: anonymous `POST /ads/:id/view` and `/click` increment counters; CTR computed in API

### Backend (artifacts/api-server)
- Routes: `/me`, `/plans`, `/ads` CRUD, `/ads/:id/view`, `/ads/:id/click`, `/dashboard/summary`, `/dashboard/timeseries`, `/payment/checkout`, `/notifications/feed`
- Plan limits enforced server-side in `lib/userPlan.ts`; ensureUser bootstraps a Clerk user into local DB on first authenticated request

### DB schema (lib/db/src/schema)
- `users` (id, clerkId, email, plan, createdAt)
- `ads` (id, userId, title, description, link, views, clicks, createdAt)
- `ad_events` (id, adId, type, ts) — for timeseries
