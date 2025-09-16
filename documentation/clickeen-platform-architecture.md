# Architecture Overview

- Canonical list → **CONTEXT.md**  
- System docs → **systems/**  
- Deployments → **deployments/**  
- Decisions → **decisions/**

## Critical Paths
1) Widget Creation: Bob → Paris → Michael → Phoenix → Atlas  
2) Widget Display: Venice → Atlas → Michael → (Denver assets)  
3) Analytics: Venice → Berlin → Michael → Helsinki  
4) AI: Bob → Copenhagen → Paris

## Links
- App: https://c-keen-app.vercel.app  
- Embed: https://c-keen-embed.vercel.app  
- Site: https://c-keen-site.vercel.app  
- Dieter components (served by app): https://c-keen-app.vercel.app/dieter/components.html  
- Dieter icons: https://c-keen-app.vercel.app/dieter/icons/

---


## Anon Widget Creation (Production)
- **System user**: Anonymous widgets are owned by a non-interactive system user with fixed UUID `11111111-1111-1111-1111-111111111111`. This user must exist in `auth.users` in each environment.
- **Atomic RPC**: Widget + published instance are created via `public.create_widget_with_instance(name text, config jsonb)` (SECURITY DEFINER). It inserts into `public.widgets` (sets `user_id` to the system user) and `public.widget_instances` (status `published`), then returns `{ public_key, public_id }`.
- **Schema guarantees**:
  - `widgets.user_id` is NOT NULL (enforced).
  - `widget_instances.public_id` is UNIQUE.
  - Compat columns (`allowed_domains text[] default '{}'`, `show_badge boolean default true`, `created_by uuid null`) exist for embed parity.
- **Smoke**: Production smoke creates an anon widget, checks embed headers for that `publicId`, and submits a form via the embed endpoint expecting `{ ok: true }`.

# Clickeen Services Architecture

## Core Systems (Business Critical)

1. **Paris — HTTP API System**  
   - Purpose: Catalog of widget templates.  
   - Location: Supabase (template metadata) + UI in c-keen-app.  
   - Notes: Source for Bob (builder) when creating widgets.  

2. **Robert — User & Workspace Management**  
   - Purpose: Authentication, roles, invites, workspace ownership.  
   - Location: Supabase Auth + c-keen-app UI.  
   - Notes: Central identity layer.  

3. **Michael — Backend Data Plane**  
   - Purpose: Operational data (configs, submissions).  
   - Location: Supabase.  
   - Notes: Does *not* handle metrics or BI.  

4. **Venice — Embed Runtime & Delivery**  
   - Purpose: Shadow DOM runtime (<28KB) that renders widgets on customer sites.  
   - Location: c-keen-embed.  
   - Notes: Includes preview capability.  

5. **Atlas — Config & Cache Layer**  
   - Purpose: Edge cache; decouples Venice from Michael.  
   - Location: c-keen-embed (edge functions, KV).  
   - Notes: Handles cache invalidation events.  

6. **Tokyo — Billing & Upsell**  
   - Purpose: Stripe integration, entitlements, plan upgrades.  
   - Location: Supabase functions + c-keen-app UI.  
   - Notes: Source of truth for entitlements.  

7. **Oslo — Design System**  
   - Purpose: Tokens, components, motion primitives.  
   - Location: `/dieter` in repo; distributed via NPM package.  
   - Notes: Served through c-keen-app (no Vercel project).  

8. **Bob — Widget Builder Service**  
   - Purpose: Builder UI, configuration, live preview, inline editing.  
   - Location: c-keen-app.  
   - Notes: Includes **Studio** (host shell).  

9. **Copenhagen — AI Service**  
   - Purpose: Centralized AI orchestration (prompting, enrichment, scoring).  
   - Location: Supabase edge functions.  
   - Notes: Consumed by Bob and other systems.  

---

## Supporting Systems (Enhancers)

1. **Prague — Marketplace & Discovery**  
   - Purpose: SEO pages, widget gallery.  
   - Location: c-keen-site.  

2. **Stockholm — Growth & Experimentation**  
   - Purpose: A/B testing, feature flags.  
   - Location: GrowthBook/PostHog (external).  

3. **Milan — Localization**  
   - Purpose: Multi-language support.  
   - Location: Shared service (consumed by app + site).  

4. **Berlin — Observability & Security**  
   - Purpose: Logs, platform metrics, rate limiting.  
   - Location: Sentry + Supabase.  

5. **Geneva — Schema Registry**  
   - Purpose: Central validation schemas.  
   - Location: Shared repo service.  

6. **Helsinki — Analytics Warehouse**  
   - Purpose: BI and aggregated insights.  
   - Location: Supabase warehouse or external DW.  
   - Notes: Consumes events from Berlin + Michael.  

7. **Lisbon — Email/Notifications**  
   - Purpose: Outbound email and system notifications.  
   - Location: External provider integration.  

8. **Zurich — Integrations**  
   - Purpose: Third-party integrations (webhooks, Zapier, etc.).  
   - Location: External integrations service.  

9. **Cairo — Custom Domains**  
   - Purpose: Handles domain mapping for customer widgets.  
   - Location: Edge configuration.  

10. **Phoenix — Event Bus**  
    - Purpose: Async messaging system.  
    - V0: Redis Pub/Sub or Vercel KV.  
    - Notes: Emits events like `widget.created`, `plan.upgraded`.  

11. **Denver — Asset Storage & CDN**  
    - Purpose: User-uploaded assets (images, videos).  
    - V0: Vercel Blob or Supabase Storage.  
    - Notes: Serves widget assets via CDN.  

---

## Applications / Deployments

1. **c-keen-site**  
   - Path: `/apps/site`  
   - Purpose: Marketing site.  
   - Hosts: **Prague** marketplace/gallery.  
   - URL: https://c-keen-site.vercel.app  

2. **c-keen-app**  
   - Path: `/apps/app`  
   - Purpose: Dashboard application.  
   - Hosts: **Bob** (builder), **Robert** (auth UI), **Tokyo** (billing UI).  
   - Serves: **Oslo** tokens, components, icons.  
   - Includes: **Studio** at `/studio`.  
   - URL: https://c-keen-app.vercel.app  

3. **c-keen-embed**  
   - Path: `/services/embed`  
   - Purpose: Embed runtime delivery.  
   - Hosts: **Venice** runtime + **Atlas** edge cache.  
   - URL: https://c-keen-embed.vercel.app  

---

## Analytics Boundaries

- **Michael**: Operational data (widget configs, submissions).  
- **Berlin**: Platform metrics and observability (rate limits, logs).  
- **Helsinki**: Aggregated analytics and BI.  

---

## Critical Flows

1. **Widget Creation**  
   User → Bob → Paris → Michael → Phoenix → Atlas.  

2. **Widget Display**  
   End User Site → Venice → Atlas → Michael (fallback) → Denver (assets).  

3. **Analytics**  
   Venice → Berlin (ingestion) → Michael (operational storage) → Helsinki (warehouse).  

---

## Deployment Rules

- **Deployments are Git-triggered**: pushing to GitHub → triggers Vercel builds.  
- Only **3 Vercel projects**: `c-keen-site`, `c-keen-app`, `c-keen-embed`.  
- No new Vercel projects allowed (Oslo, Studio, Dieter are not separate).  
- Supabase handles: Michael, Robert, Tokyo, Copenhagen.  
- External: Sentry (Berlin), GrowthBook/PostHog (Stockholm), Email provider (Lisbon).  
- Edge functions: Atlas, Venice.  

---

## Notes on Recent Issues (Resolved)

- **Frozen Lockfile Failures**: Fixed by enforcing root-level `pnpm-lock.yaml` and overriding install commands in Vercel to resolve lockfile at repo root. Guard scripts added to CI.  
- **Duplicate Studio/Dieter Deploys**: Resolved by deleting `c-keen-dieter` project; Studio and Dieter are served via `c-keen-app`.  
- **Missing `routes-manifest.json` Errors**: Caused by repo-level `vercel.json` misconfig; fixed by removing root `buildCommand` and ensuring per-project `pnpm build`.  
- **Workspace Drift**: Documented in `/docs/DEPLOY.md` and `/docs/SERVICES.md`; rules added to prevent accidental new Vercel projects.  

---

## Phase 1 Deployments (FROZEN)
- Vercel projects: c-keen-app (Studio/Console), c-keen-site (Marketing), c-keen-embed (Edge Embed), c-keen-api (Paris — HTTP API).
- Project count (P1): Four projects — frozen. Any change requires an ADR.

### Health & Observability
- Health endpoint: /api/healthz (200 on success, 503 on dependency failure) with payload:

```
{
  "sha": "<short-sha|unknown>",
  "env": "production|preview|development",
  "up": true,
  "deps": { "supabase": true, "edgeConfig": true }
}
```

- Edge Config: Vercel Edge Config is used for runtime reads. Writes (if needed) are executed in CI using a scoped token (VERCEL_API_TOKEN) and EDGE_CONFIG_ID.

---

# Executive Summary — What’s Built Now (Verified in Repo)
- ✅ **Builds pass** for all 4 surfaces: `services/api` (Paris — HTTP API), `services/embed` (Embed), `apps/app` (Studio/Console), `apps/site` (Marketing).
- ✅ **/api/healthz** implemented with `{sha, env, up, deps:{supabase, edgeConfig}}` and 200/503 semantics in **services/api**.
- ✅ **Edge Config (runtime reads)** integrated (see healthz dep probe); runtime **does not** write.
- ✅ **Dieter design system** pipeline builds and copies assets into host apps.
- ✅ **Studio Shell** exists as a package and is copied into host apps on build (no separate deploy).
- ✅ **Embed service** exposes API routes (cfg/e/form/ingest) and builds successfully.
- ⚠️ **Supabase schema & functions**: contract frozen in docs, but DB artifacts are not verified from repo alone.
- ⚠️ **Event Bus / Telemetry pipeline**: ingest endpoints exist; full pipeline status not verified.
- ⚠️ **Localization**: marketing has localized pages; full i18n across apps is not verified.
- ⛔ **Billing/Entitlements**, **Email/Notifications**, **AI service**, **Integrations**, **Warehouse/BI**: not implemented in repo.

> Legend: ✅ Done (verified in repo) · ⚠️ Partial/Unverified · ⛔ Not started

---

# System Inventory & Phase Status

**State values per Phase:**  
- **DONE** — implemented and verified by repo/builds  
- **PARTIAL** — present in repo but not function-complete, or verified only in part  
- **NOT STARTED** — no implementation found in repo

> Phase definitions: P1 = frozen infra + core surfaces; P2 = growth/completion of platform flows; P3 = scale/perf/enterprise.

| System (Codename) | Purpose | Repo Path / Project | P1 | P2 | P3 | Notes |
|---|---|---|---|---|---|---|
| **Paris — HTTP API** | Server-side API surface (admin ops, token ops, secure server logic) | `services/api` → `c-keen-api` | PARTIAL | DONE | DONE | Healthz + skeleton verified; expand endpoints/admin ops in P2 |
| **Venice — Embed Service** | Public embed endpoints/runtime at edge | `services/embed` → `c-keen-embed` | PARTIAL | DONE | DONE | cfg/e/form/ingest routes present; runtime hardening in P2 |
| **Michael — Data Plane (Supabase)** | Configs, submissions, RLS, functions | Supabase | PARTIAL* | DONE | DONE | *Schema frozen in docs; repo-only verification limited |
| **Atlas — Edge Config** | Low-latency config distribution | Vercel Edge Config | DONE | DONE | DONE | Runtime reads in P1; CI-only writes policy |
| **Bob — Studio Builder** | Widget studio UX & shell host | `apps/app` → `c-keen-app` | PARTIAL | DONE | DONE | App builds; builder features expand in P2 |
| **Robert — Auth & Workspaces** | Auth, roles, invites | `apps/app` + Supabase | PARTIAL | DONE | DONE | Auth pages and invites routes exist; enforce policies in P2 |
| **Dieter — Design System** | Tokens, primitives, icons, components | `dieter/` (+ copied to apps) | DONE | DONE | DONE | Pipeline verified; a11y & coverage continue |
| **Studio Shell (pkg)** | Reusable shell; copied on build | `packages/studio-shell` | DONE | DONE | DONE | Not a deploy; copy-on-build |
| **Phoenix — Telemetry/Event Bus** | Ingest, idempotency, rollups | API + DB + jobs | PARTIAL | DONE | DONE | Ingest routes present; pipeline build-out in P2 |
| **Berlin — Observability/Security** | Logs, metrics, rate limits | Sentry + Supabase | NOT STARTED | PARTIAL | DONE | Wire Sentry + rate limits beginning in P2 |
| **Helsinki — Analytics Warehouse** | BI/aggregations | Warehouse | NOT STARTED | PARTIAL | DONE | Consume events from Venice → Berlin → Michael |
| **Prague — Marketplace/Discovery** | SEO/galleries | `apps/site` → `c-keen-site` | PARTIAL | DONE | DONE | Marketing live; marketplace features in P2 |
| **Stockholm — Growth/Flags** | Experimentation, feature flags | External (GB/PostHog) | NOT STARTED | PARTIAL | DONE | Hook into app/embed in P2 |
| **Milan — Localization** | i18n infra & content | Shared + apps/site | PARTIAL | DONE | DONE | /it pages present; consolidate i18n infra |
| **Geneva — Schema Registry** | Central validation schemas | Shared | NOT STARTED | PARTIAL | DONE | Coalesce zod/json-schema; publish to consumers |
| **Lisbon — Email/Notifications** | Outbound comms | External provider | NOT STARTED | PARTIAL | DONE | System notifications & webhooks in P2 |
| **Zurich — Integrations** | 3rd-party hooks/webhooks | Shared | NOT STARTED | PARTIAL | DONE | Zapier/webhooks & sandbox endpoints |
| **Tokyo — Billing/Entitlements** | Plans, usage, limits | Stripe + API | NOT STARTED | PARTIAL | DONE | Enforce plan flags in API/middleware |
| **Copenhagen — AI** | AI services | API + workers | NOT STARTED | PARTIAL | DONE | Targeted per-widget AI services in P2 |
| **Denver — Assets/CDN** | Blob/storage for assets | Vercel Blob/Supabase | NOT STARTED | PARTIAL | DONE | Move from repo assets → CDN |

> Where a field shows **PARTIAL*** with an asterisk, it means **defined/frozen in docs** and **partially reflected in code**, but not fully verifiable from repo alone (e.g., DB migrations).

---

## System Notes (Developer-Oriented Detail)

### Paris — HTTP API
- **Runtime:** Node (Next.js app routes)  
- **Endpoints:** `/api/healthz` (dependency-aware), admin/secure endpoints expanded in P2  
- **Dependencies:** Supabase (Michael), Edge Config (Atlas)  
- **Security:** `INTERNAL_ADMIN_KEY` for admin ops; no runtime Edge Config writes

### Venice — Embed Service
- **Runtime:** Edge (Next.js app routes)  
- **Endpoints (present):** `/api/cfg/[publicId]`, `/api/e/[publicId]`, `/api/form/[publicId]`, `/api/ingest`  
- **Budgets:** Loader/runtime ≤ 28KB gz (P1), per-widget ≤ 10KB gz initial  
- **Config Source:** Atlas (Edge Config), fallback to Michael on publish

### Michael — Data Plane (Supabase)
- **Tables/Functions:** Frozen in TechPhases.md (tokens, submissions, rate limiting)  
- **Idempotency:** Phoenix Option B (DB uniqueness)  
- **RLS:** Required; no PII in telemetry

### Atlas — Edge Config
- **Policy:** Runtime reads only (`EDGE_CONFIG`); writes via CI (`VERCEL_API_TOKEN`, `EDGE_CONFIG_ID`)  
- **Health:** probed in `/api/healthz` of Paris

### Bob / Robert — Studio + Auth/Workspaces
- **App:** `apps/app` (Next.js) builds; auth routes present (login/magic/confirm); invites routes exist  
- **Studio Shell:** copied UMD bundles into `/public/vendor/studio/` on build

### Dieter — Design System
- **Assets:** Tokens, icons SVG pipeline verified; copy into apps on build  
- **A11y:** conventions enforced; continue coverage

### Phoenix — Telemetry
- **Ingest:** via Venice and/or Paris; enforce DB idempotency  
- **Rollups:** implement job/cron in P2

### Berlin/Helsinki (Observability/BI)
- **Start:** wire Sentry; define rate limits; event export to warehouse in P2  
- **PII:** none; only hashed origins

### Prague/Stockholm/Milan (Marketing/Growth/i18n)
- **Prague:** marketplace pages in P2  
- **Stockholm:** feature flags integration in P2  
- **Milan:** unify i18n config across apps

### Lisbon/Zurich/Tokyo/Copenhagen/Denver
- **P2:** initial integrations (email, webhooks, billing scaffolding, AI services, CDN)

---

## Verification Notes
- “DONE” status is based on **present code + passing builds**.  
- DB/infra not represented in the monorepo (e.g., Supabase SQL) are marked **PARTIAL*** unless verified elsewhere.

