# CONTEXT.updated.md

# Clickeen Platform Context (AI-First)

You are working on **Clickeen**, a SaaS platform. Read this file **first** before any task.

## Platform Positioning
Clickeen is a SaaS platform. Widgets are the first product, but the system is designed as a multi-service architecture: templates, runtime, builder, design system, billing, AI. Widgets are the entry wedge, not the full definition.

## Canonical System Codenames (FROZEN)

### Core Systems:
- **Paris** — Templates
- **Robert** — User & Workspace Management (Auth, roles, invites)
- **Michael** — Backend Data Plane (configs, submissions; Supabase)
- **Venice** — Embed Runtime & Delivery (Shadow DOM runtime, <28KB; includes preview)
- **Atlas** — Config & Cache Layer (edge caching; decouples Venice from Michael)
- **Tokyo** — Billing & Upsell (Stripe integration, entitlements)
- **Oslo** — Design System (tokens, components, motion primitives)
- **Bob** — Widget Builder (embeds Studio shell)
- **Copenhagen** — AI Service (centralized orchestration)

### Supporting Systems:
- **Prague** — Marketplace & Discovery (SEO, gallery)
- **Stockholm** — Growth & Experimentation (A/B tests, flags)
- **Milan** — Localization (i18n)
- **Berlin** — Observability & Security (logs, metrics, rate limiting, Sentry)
- **Geneva** — Schema Registry (validation)
- **Helsinki** — Analytics Warehouse (BI)
- **Lisbon** — Email/Notifications
- **Zurich** — Integrations (webhooks, Zapier)
- **Cairo** — Custom Domains
- **Phoenix** — Event Bus (async messaging; V0 Redis/Vercel KV)
- **Denver** — Asset Storage & CDN (Vercel Blob/Supabase Storage)

### Shared Packages:
- **Studio Shell** — Reusable builder shell (`packages/studio-shell`). Provides slots (left, center, right, template row), topbar chrome, theme/viewport toggles (scoped to center only), collapse, and typed event bus. Distributed as UMD bundle (`studio.js`, `studio.css`) and consumed by Bob, MiniBob, and Dieter. Has no backend logic, no persistence, and no separate deployment.

## Product Architecture Layers
Every system belongs to one of three layers:
1. **Acquisition** (Prague, Stockholm, Site)
2. **Product** (Bob, Paris, Venice, Oslo, Michael, Atlas)
3. **Monetization** (Tokyo, Robert, Copenhagen)

## Deployments (FROZEN)
- **c-keen-app** (Next.js on Vercel): hosts Bob, Robert UI, Tokyo UI; serves Oslo assets; also serves /dieter/* paths; includes `/public/vendor/studio/` (built Studio bundle).
- **c-keen-embed** (Edge functions on Vercel): hosts Venice runtime and Atlas cache.
- **c-keen-site** (Next.js on Vercel): marketing; hosts Prague gallery; includes `/public/vendor/studio/` (built Studio bundle).
- **Supabase**: Michael (data plane), Robert (auth), Copenhagen (AI functions).  
**Rule:** Only these three Vercel projects exist. Studio Shell is **not** a deployment; it is built and copied into each host’s `/public/vendor/studio/`.

## Critical Rules & Scale Guardrails

### Core Rules
1. **Never** add a 4th Vercel project.  
2. **Venice** script must remain **<28KB gzipped**.  
3. **Preview** belongs to **Venice**; no separate preview service.  
4. **Oslo** is the design system; "Dieter" = Oslo (historical alias).  
5. **Studio** is a standalone shell package; consumed by Bob, MiniBob, and Dieter.  
6. All system name changes require an **ADR**.  
7. All AI calls go through **Copenhagen**.  
8. Deployments are **Git → Vercel** (push to main triggers production).

- **Single source of truth (pnpm):** The root `package.json` `packageManager` field defines the ONLY valid pnpm version. CI/workflows MUST NOT specify a different pnpm version.
- **Pinned Node runtime (20.x):** Deployable packages MUST declare `"engines": { "node": "20.x" }`. CI and Vercel MUST match this runtime.
- **Frozen lockfile is mandatory:** All installs use `pnpm install --frozen-lockfile`. No `--no-frozen-lockfile` fallback is permitted.
- **Copy-on-build for Dieter assets:** Dieter publishes to `dieter/dist/`. During build, assets are COPIED into `apps/app/public/dieter/`. Symlinks are prohibited.
- **Build order (frozen):** `@ck/dieter` → copy assets → `@ck/studio-shell` → `@ck/app`.

### Workflow Triggers
- Changing pnpm or Node requires: update ONLY root `package.json` (`packageManager`, `engines`), add/adjust ADR, and verify CI guards. Do not pin versions in workflow files.

---

# ARCHITECTURE.updated.md

# Clickeen Architecture

## Layers
- **Acquisition**: Prague, Stockholm, Site
- **Product**: Bob, Studio, Paris, Venice, Oslo, Michael, Atlas
- **Monetization**: Tokyo, Robert, Copenhagen

## Shared Packages
- **Studio Shell** (`packages/studio-shell`): reusable builder shell providing slot layout, topbar, template row, theme/viewport toggles, collapse, and event bus. Hosts (Bob, MiniBob, Dieter) mount content into Studio and receive events. Studio has no persistence, no template logic, no preview runtime. It is distributed as a UMD bundle and copied into each host’s `/public/vendor/studio/`.

## Responsibilities
- **Studio owns**: layout slots, topbar chrome, template row container, theme/viewport toggles (scoped to center), panel collapse, event contracts, error throwing on mount conflicts.
- **Hosts own**: panel content, template logic, preview rendering (Venice for Bob/MiniBob), component rendering (Dieter), persistence, network calls, telemetry.

## Flows
- **Bob** mounts Studio, populates template row and left/right panels, injects live preview into center.  
- **MiniBob** mounts Studio, provides lightweight templates and preview.  
- **Dieter** mounts Studio, populates right panel with component catalog, injects variants into center.  
- In all cases, theme and viewport toggles affect only the center canvas, and events propagate via the Studio bus.

---

# README.updated.md

# Clickeen Monorepo

## Overview
Clickeen is a SaaS platform with a pnpm monorepo structure. It contains apps, services, and shared packages.

### Apps
- **apps/app** → c-keen-app (Next.js): main builder app (Bob), user management (Robert UI), billing (Tokyo UI), Dieter assets.
- **apps/site** → c-keen-site (Next.js): marketing site, Prague gallery.
- **services/embed** → c-keen-embed (Edge functions): Venice runtime and Atlas cache.

### Shared Packages
- **packages/studio-shell**: Studio Shell — reusable builder shell exposing `window.Studio` via UMD build. Provides slots, topbar, template row, theme/viewport toggles (scoped to center), collapse, and event bus. Consumed by Bob, MiniBob, Dieter. No deploy. Built with pnpm and copied into each host’s `/public/vendor/studio/`.

## Getting Started
- Install dependencies: `pnpm install --frozen-lockfile`
- Build Studio shell: `pnpm --filter @ck/studio-shell build`
- Start apps: `pnpm dev --filter @ck/app` or `pnpm dev --filter @ck/site`

## Deployment
- Only three Vercel projects: c-keen-app, c-keen-embed, c-keen-site.
- Studio shell has no project; its assets are bundled into each host under `/public/vendor/studio/`.

---

# deployment.updated.md

# Deployment Overview

## Vercel Projects (FROZEN)
- **c-keen-app** → `/apps/app` (Next.js)  
- **c-keen-embed** → `/services/embed` (Edge functions)  
- **c-keen-site** → `/apps/site` (Next.js)  

**Rule:** No additional Vercel projects may be created.

## Studio Shell
- Studio is **not** a Vercel project.  
- It lives in `packages/studio-shell` and builds to UMD bundles (`dist/studio.js`, `dist/studio.css`).  
- Each host app copies these bundles into its own `/public/vendor/studio/` before deployment.  
- This ensures Bob (c-keen-app), MiniBob (c-keen-site), and Dieter each serve Studio assets without creating new deployments.  

## Deployment Flow
1. Developer builds Studio: `pnpm --filter @ck/studio-shell build`.  
2. Copy artifacts into host `/public/vendor/studio/`.  
3. Push to main branch.  
4. Vercel automatically deploys the app, serving Studio assets along with app content.  

---