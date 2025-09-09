# Clickeen Platform Context (AI-First)

You are working on **Clickeen**, a widget platform. Read this file **first** before any task.

## Canonical System Codenames (FROZEN)
Core Systems:
- **Paris** — Templates
- **Robert** — User & Workspace Management (Auth, roles, invites)
- **Michael** — Backend Data Plane (configs, submissions; Supabase)
- **Venice** — Embed Runtime & Delivery (Shadow DOM runtime, <28KB; includes preview)
- **Atlas** — Config & Cache Layer (edge caching; decouples Venice from Michael)
- **Tokyo** — Billing & Upsell (Stripe integration, entitlements)
- **Oslo** — Design System (tokens, components, motion primitives)
- **Bob** — Widget Builder (includes Studio layout shell)
- **Copenhagen** — AI Service (centralized orchestration)

Supporting Systems:
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

## Deployments (FROZEN)
- **c-keen-app** (Next.js on Vercel): hosts Bob (Builder & Studio), Robert UI, Tokyo UI; serves Oslo assets; also serves /dieter/* paths.
- **c-keen-embed** (Edge functions on Vercel): hosts Venice runtime and Atlas cache.
- **c-keen-site** (Next.js on Vercel): marketing; hosts Prague gallery.
- **Supabase**: Michael (data plane), Robert (auth), Copenhagen (AI functions).  
**Rule:** Only these three Vercel projects exist.

## Critical Rules
1. **Never** add a 4th Vercel project.  
2. **Venice** script must remain **<28KB gzipped**.  
3. **Preview** belongs to **Venice**; no separate preview service.  
4. **Oslo** is the design system; “Dieter” = Oslo (historical alias).  
5. **Studio** is part of **Bob** (layout shell only).  
6. All system name changes require an **ADR**.  
7. All AI calls go through **Copenhagen**.  
8. Deployments are **Git → Vercel** (push to main triggers production).

## Recent Issues We Solved
- Vercel **frozen lockfile** failures when Root Directory ≠ repo root; fixed by running installs at repo root with `--filter` and enforcing lockfile via `.npmrc`, plus CI verify scripts.
- Next.js builds failing with missing `routes-manifest.json` when Build Command ran from wrong CWD; fixed by using project-local `pnpm build` with correct Root Directory.
- Eliminated rogue **c-keen-dieter** project; Dieter/Oslo served by **c-keen-app** only.

## Workflow Triggers
- New system → add `systems/<tier>/<name>.md`, update ADR if naming/role changes.  
- Deployment config changes → update `deployments/*.md`.  
- Breaking changes → document in `migrations/`.  
- Incidents → update `playbooks/`.

---


