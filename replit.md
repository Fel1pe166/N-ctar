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
- Routes: `/me`, `/plans`, `/ads` CRUD, `/ads/:id/view`, `/ads/:id/click`, `/dashboard/summary`, `/dashboard/timeseries`, `/payment/checkout`, `/notifications/feed`, `/feed` (public marketplace, optional `?category=`), `/pix/config`, `/payments` (POST create + GET own), `/admin/payments`, `/admin/payments/:id/approve|reject`
- **PIX manual flow**: `PIX_KEY` env var → public QR via `api.qrserver.com`. Users upload comprovante (data URL stored in `payments.proofUrl`, max ~4.5MB). Status: `pending → approved | rejected`. Approving updates user plan + adsLimit.
- **Admin role**: `ADMIN_EMAIL` env var. `ensureUser` sets `users.role='admin'` when Clerk email matches (case-insensitive). `requireAdmin` middleware in `lib/admin.ts`. UI shows extra "Admin" nav entry in DashboardShell sidebar + MobileDrawer.
- Ads have `imageUrl` + `category` (15 fixed categories: Discord, WhatsApp, Facebook, Site, Twitter, Pinterest, Instagram, Kwai, TikTok, Cursos, Shopee, Spotify, Aliexpress, Telegram, Design)
- Frontend `/` is the public `MarketplaceHome` (feed grid 1/2/3/4, hero search + dark `CategoryDropdown`, animated chips). Logged-in users access `/dashboard` via header/drawer.
- `CategoryDropdown` (light/dark variants): vertical fade+slide menu, single-select, active = yellow #FFD700 + glow, hover = translate-x.
- Create-ad modal: white SaaS card with large inputs, yellow focus ring, light category dropdown, image URL field, gradient yellow→orange "Publicar anúncio" button with shimmer sweep.
- Plan limits enforced server-side in `lib/userPlan.ts`; ensureUser bootstraps a Clerk user into local DB on first authenticated request

### DB schema (lib/db/src/schema)
- `users` (id, clerkId, email, plan, createdAt)
- `ads` (id, userId, title, description, link, views, clicks, createdAt)
- `ad_events` (id, adId, type, ts) — for timeseries
