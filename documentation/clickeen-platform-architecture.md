# Clickeen Platform Architecture (Canonical — Phase 1)

This document is the architectural source of truth for Phase-1. It enumerates all systems, shows **what’s built vs not**, and assigns a **Phase 1/2/3** state per system.

- See **CONTEXT.md** for execution rules and frozen invariants.
- See **Techphases.md** for the roadmap and phase definitions.

---

## Executive Summary — What’s Built Now (Verified in Repo)
- ✅ Builds pass for all 4 deployable surfaces:
  - `services/api` (**Paris — HTTP API**)
  - `services/embed` (Embed/Edge)
  - `apps/app` (Studio/Console)
  - `apps/site` (Marketing)
- ✅ `/api/healthz` implemented in **Paris** with `{sha, env, up, deps:{supabase, edgeConfig}}` and 200/503 semantics.
- ✅ **Edge Config runtime reads** integrated (runtime does not write).
- ✅ **Dieter** design system pipeline builds and copies assets into host apps.
- ✅ **Studio Shell** is a package copied into host apps on build (no separate deploy).
- ✅ **Embed** exposes cfg/e/form/ingest routes and builds.
- ⚠️ **Supabase schema & functions**: contract frozen in docs, but DB artifacts can’t be fully verified from repo alone.
- ⚠️ **Event Bus / Telemetry pipeline**: ingest endpoints exist; full pipeline status not verified.
- ⚠️ **Localization**: marketing has localized pages; full cross-app i18n not verified.
- ⛔ **Billing/Entitlements**, **Email/Notifications**, **AI service**, **Integrations**, **Warehouse/BI**: not implemented in repo.

Legend: ✅ Done · ⚠️ Partial/Unverified · ⛔ Not started

---

## Deployments (P1 — Frozen)
**Vercel projects (4):**
- `c-keen-app` — Studio / Console → repo: `apps/app`
- `c-keen-site` — Marketing → repo: `apps/site`
- `c-keen-embed` — Embed service (Edge routes) → repo: `services/embed`
- `c-keen-api` — **Paris — HTTP API** (Node runtime) → repo: `services/api`

**Rule:** Four projects in P1 (frozen). No additional projects in P1.

---

## System Inventory & Phase Status

States per Phase:
- **DONE** — implemented and verified by repo/builds
- **PARTIAL** — present in repo or defined in docs, but not fully verifiable or feature-complete
- **NOT STARTED** — no implementation in repo

| System (Codename) | Purpose | Repo / Project | P1 | P2 | P3 | Notes |
|---|---|---|---|---|---|---|
| **Paris — HTTP API** | Secure server-side API surface (admin ops, token ops, publish flows) | `services/api` → `c-keen-api` | PARTIAL | DONE | DONE | Healthz & scaffolding verified; admin endpoints expand in P2 |
| **Venice — Embed Service** | Public embed endpoints/runtime at edge | `services/embed` → `c-keen-embed` | PARTIAL | DONE | DONE | cfg/e/form/ingest present; runtime hardening in P2 |
| **Michael — Data Plane (Supabase)** | Configs, submissions, RLS, db functions | Supabase | PARTIAL* | DONE | DONE | *Schema frozen in docs; repo-only verification limited |
| **Oslo — Usage & Token Service** | Token issuance/rotation/revocation, usage metering, basic rate limits | Supabase + Paris (admin) | PARTIAL | DONE | DONE | Contracts frozen; implement admin flows & counters in P2 |
| **Atlas — Edge Config** | Low-latency config distribution | Vercel Edge Config | DONE | DONE | DONE | Runtime reads; CI-only writes |
| **Bob — Studio Builder** | Widget studio UX & shell host | `apps/app` → `c-keen-app` | PARTIAL | DONE | DONE | App builds; builder features expand in P2 |
| **Robert — Auth & Workspaces** | Auth, roles, invites | `apps/app` + Supabase | PARTIAL | DONE | DONE | Auth pages & invites routes exist; enforce policies in P2 |
| **Dieter — Design System** | Tokens, primitives, icons, components | `dieter/` (+ copied to apps) | DONE | DONE | DONE | Pipeline verified; continue a11y & coverage |
| **Studio Shell (pkg)** | Reusable shell; copied on build | `packages/studio-shell` | DONE | DONE | DONE | Not a deploy; copy-on-build |
| **Phoenix — Telemetry/Event Bus** | Ingest, idempotency, rollups | API + DB + jobs | PARTIAL | DONE | DONE | Ingest exists; pipeline build-out in P2 |
| **Berlin — Observability/Security** | Logs, metrics, rate limits | Sentry + Supabase | NOT STARTED | PARTIAL | DONE | Wire Sentry + rate limits in P2 |
| **Helsinki — Analytics Warehouse** | BI/aggregations | Warehouse | NOT STARTED | PARTIAL | DONE | Consume events from Venice → Berlin → Michael |
| **Prague — Marketing/Discovery** | SEO/galleries/landing | `apps/site` → `c-keen-site` | PARTIAL | DONE | DONE | Marketing live; marketplace features P2 |
| **Stockholm — Growth/Flags** | Experimentation, feature flags | External (GB/PostHog) | NOT STARTED | PARTIAL | DONE | Hook into app/embed in P2 |
| **Milan — Localization** | i18n infra & content | Shared + apps/site | PARTIAL | DONE | DONE | /it pages present; unify i18n infra |
| **Geneva — Schema Registry** | Central validation schemas | Shared | NOT STARTED | PARTIAL | DONE | Coalesce zod/json-schema; publish to consumers |
| **Lisbon — Email/Notifications** | Outbound communications | External provider | NOT STARTED | PARTIAL | DONE | System notifications & webhooks |
| **Zurich — Integrations** | 3rd-party hooks/webhooks | Shared | NOT STARTED | PARTIAL | DONE | Zapier/webhooks & sandbox endpoints |
| **Tokyo — Billing/Entitlements** | Plans, usage, limits | Stripe + API | NOT STARTED | PARTIAL | DONE | Enforce plan flags in middleware |
| **Copenhagen — AI** | AI services | API + workers | NOT STARTED | PARTIAL | DONE | Per-widget AI services |
| **Denver — Assets/CDN** | Blob/storage for assets | Vercel Blob/Supabase | NOT STARTED | PARTIAL | DONE | Move repo assets → CDN |

> **PARTIAL*** with asterisk = defined/frozen in docs and partially reflected in code, but not fully verifiable from repo alone (e.g., DB migrations).

---

## System Notes (Developer-Oriented)

### Paris — HTTP API
- **Runtime:** Node (Next.js app routes)
- **Endpoints:** `/api/healthz` (dependency-aware), admin/secure endpoints (P2)
- **Dependencies:** Supabase (Michael), Edge Config (Atlas)
- **Security:** `INTERNAL_ADMIN_KEY` for admin ops; **no runtime Edge Config writes**

### Venice — Embed Service
- **Runtime:** Edge (Next.js app routes)
- **Endpoints:** `/api/cfg/[publicId]`, `/api/e/[publicId]`, `/api/form/[publicId]`, `/api/ingest`
- **Budgets:** Loader/runtime ≤ **28KB gz** (P1); per-widget ≤ **10KB gz**
- **Config:** Read from Edge Config (Atlas), publish via Paris

### Oslo — Usage & Token Service
- **Scope:** Issue/rotate/revoke tokens; maintain usage counters and light rate-limits
- **Surface:** Admin ops via **Paris**; persistence in **Supabase**
- **Rules:** Tokens are scoped & rotatable; counters idempotent; no PII in metrics

### Michael — Data Plane (Supabase)
- **Tables/Functions:** tokens, submissions, rate limiting (frozen in TechPhases)
- **Idempotency:** Phoenix Option B (DB uniqueness)
- **RLS:** Required; no PII in telemetry

### Atlas — Edge Config
- **Policy:** Runtime reads only (`EDGE_CONFIG`); writes in CI with `VERCEL_API_TOKEN` + `EDGE_CONFIG_ID`
- **Health:** Probed by Paris `/api/healthz`

### Bob / Robert — Studio + Auth/Workspaces
- **App:** `apps/app` builds; auth pages (login/magic/confirm) & invite routes exist
- **Studio Shell:** copied UMD bundles into `/public/vendor/studio/` on build

### Dieter — Design System
- **Assets:** Tokens, icons, primitives; pipeline builds and copies to host apps
- **A11y:** conventions enforced; coverage ongoing

### Phoenix — Telemetry
- **Ingest:** via Venice and/or Paris; DB idempotency enforced
- **Rollups:** job/cron in P2

### Berlin/Helsinki (Observability/BI)
- **Start:** wire Sentry; define rate limits; export events to warehouse in P2
- **PII:** none; only hashed origins

### Prague/Stockholm/Milan (Marketing/Growth/i18n)
- **Prague:** marketplace pages P2
- **Stockholm:** feature flags integration P2
- **Milan:** unify i18n across apps

### Lisbon/Zurich/Tokyo/Copenhagen/Denver
- **P2:** initial integrations (email, webhooks, billing scaffolding, AI services, CDN)

---

## Verification Notes
- “DONE” is based on **present code + passing builds**.
- DB/infra not represented in the monorepo are marked **PARTIAL*** unless verified elsewhere.

