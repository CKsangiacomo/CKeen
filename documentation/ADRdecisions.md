# ADR-001 Monorepo on pnpm + Turbo

- Decision: single monorepo; pnpm workspaces; Turbo tasks  
- Status: Accepted  
- Consequence: Single root lockfile; installs must run at repo root

# ADR-002 Edge Cache via Atlas

- Decision: Edge KV-backed cache for configs  
- Status: Accepted  
- Consequence: Venice reads from Atlas first; Michael as fallback

# ADR-003 AI Centralization via Copenhagen

- Decision: Single AI gateway (Supabase Edge Functions)  
- Status: Accepted


## ADR-004 — Single Source of Truth for Tool Versions
**Status:** Accepted (September 11, 2025)  
**Context:** CI failed with `ERR_PNPM_BAD_PM_VERSION` due to pnpm version declared both in workflows and `package.json`.  
**Decision:** The **only** source of pnpm version is `package.json` `packageManager`. Workflows MUST NOT specify a pnpm version. All CI installs use `--frozen-lockfile`. Deployable packages pin Node via `"engines": { "node": "20.x" }`.  
**Consequences:** Deterministic builds across local, CI, and Vercel. CI guardrails fail PRs on version drift.  

## ADR-005 — Dieter Assets: Copy-on-Build (No Symlinks)
**Status:** Accepted (September 11, 2025)  
**Context:** Symlinked assets behaved inconsistently across CI/Vercel and broke static caching.  
**Decision:** Dieter builds artifacts to `dieter/dist/`. A build step copies them to `apps/app/public/dieter/`. Symlinks are not supported.  
**Consequences:** CDN-served static assets, predictable builds, no symlink fragility.

## ADR-006 — Supabase as Primary Backend  
**Status:** Accepted (June 2025)  
**Context:** Evaluated alternatives (Postgres self-hosted, Firebase, Planetscale). Need fast iteration with RLS, Auth, and DB in one.  
**Decision:** Supabase selected for Auth, Postgres with RLS, and API.  
**Consequences:** Rapid prototyping, built-in security. Risk of vendor lock-in at scale, mitigated by Postgres compatibility.  

## ADR-007 — Modular Monolith First  
**Status:** Accepted (June 2025)  
**Context:** Start small, avoid over-engineering with early microservices.  
**Decision:** Build as modular monolith, split embed service into its own microservice once scale demands.  
**Consequences:** Faster initial delivery, no premature infra overhead. Clear split path for scaling.  

## ADR-008 — Embed Service Size Budget  
**Status:** Accepted (June 2025)  
**Context:** Widgets must be embeddable on any site. JS payload must remain minimal.  
**Decision:** Hard budget ≤28KB gzipped per embed loader.  
**Consequences:** Strict discipline on dependencies. Forces tree-shaking and lean builds.  

## ADR-009 — Security Baseline  
**Status:** Accepted (June 2025)  
**Context:** Multi-tenant SaaS requires early security model.  
**Decision:** Enforce Row-Level Security, scoped API tokens, audit logs from day one.  
**Consequences:** Higher setup cost, but avoids painful retrofitting later.  

## ADR-010 — Frontend Stack  
**Status:** Accepted (June 2025)  
**Context:** Need modern, flexible frontend stack.  
**Decision:** Next.js + React, deployed via Vercel. Use system font stack and SF Symbols for design tokens.  
**Consequences:** Fast developer experience, consistent design language, built-in SSR.  

## ADR-011 — Growth Model  
**Status:** Accepted (June 2025)  
**Context:** Growth strategy must be encoded into product.  
**Decision:** Every widget follows Free Public → Logged-In → Paid Upsell pattern.  
**Consequences:** Consistent user funnel across all widgets. Predictable CR metrics for forecasting.  