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

