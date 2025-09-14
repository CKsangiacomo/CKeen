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
**Decision:** The **only** source of pnpm version is `package.json` `packageManager`. Workflows MUST NOT specify a pnpm version. All CI installs use `--frozen-lockfile`. Deployable packages pin Node via `"engines": { "node": "20.x" }`. Implemented at repo root: `pnpm@10.15.1`.
**Consequences:** Deterministic builds across local, CI, and Vercel. CI guardrails fail PRs on version drift.  

## ADR-005 — Dieter Assets: Copy-on-Build (No Symlinks)
**Status:** Accepted (September 11, 2025)  
**Context:** Symlinked assets behaved inconsistently across CI/Vercel and broke static caching.  
**Decision:** Dieter builds artifacts to `dieter/dist/`. A build step copies them to `apps/app/public/dieter/`. Symlinks are not supported. Implemented via `scripts/build-dieter.js` and `scripts/copy-dieter-assets.js`; CI guard ensures no tracked files under `apps/app/public/dieter/`.
**Consequences:** CDN-served static assets, predictable builds, no symlink fragility.

## ADR 06: Modular Monolith First

**Status:** Accepted  
**Date:** 2025-09-11  

### Context
Early designs pushed for microservices from day one. This added unnecessary complexity for a team of two engineers.  

### Decision
We adopt a **modular monolith** for Phase 1. Split off embed as the first microservice only when scale demands it.  

### Consequences
- Simpler development and deployment in early phases.  
- Easier debugging and maintenance.  
- Provides a clean path to split services later without premature overhead.  

---

## ADR 07: Embed Loader Size Constraint

**Status:** Accepted  
**Date:** 2025-09-11  

### Context
The embed loader must be lightweight to ensure adoption and reduce performance penalty.  

### Decision
Hard budget: **28 KB (gzipped)** for the embed loader including runtime and widget bootstrap.  

### Consequences
- Forces careful choice of dependencies.  
- Encourages performance discipline.  
- Excludes heavy frameworks or unused libraries.  

---

## ADR 08: Supabase as Primary Backend

**Status:** Accepted  
**Date:** 2025-09-11  

### Context
We need a backend that is fast to adopt and provides auth, RLS, and Postgres compatibility without heavy ops burden.  

### Decision
Use **Supabase** as the primary backend for Phase 1.  

### Consequences
- Accelerates development.  
- Some vendor lock-in, mitigated by Postgres base.  
- Limits scalability at extreme scale but acceptable for Phase 1.  

---

## ADR 09: Vercel for Hosting

**Status:** Accepted  
**Date:** 2025-09-11  

### Context
We need reliable, zero-maintenance hosting and deployment.  

### Decision
Use **Vercel** for hosting all frontend apps and the embed service in Phase 1.  

### Consequences
- Fast iteration with built-in CI/CD.  
- Higher cost at scale but acceptable trade-off for Phase 1.  
- Future option to self-host if margins require.  

---

## ADR 10: Token-Based Auth

**Status:** Accepted  
**Date:** 2025-09-11  

### Context
We need secure, flexible authentication for widgets and services.  

### Decision
Use **JWT tokens with scoped claims** for widget instances and user access.  

### Consequences
- Enforces least-privilege by scoping tokens to resources.  
- Integrates with Supabase easily.  
- Requires careful key rotation and expiration handling.  

---

## ADR 11: Design Tokens with SF Symbols

**Status:** Accepted  
**Date:** 2025-09-11  

### Context
Consistency in design system is critical. We extracted all 6950 SF Symbols into `/tools/sf-symbols/svgs/` and integrated them into Dieter tokens.  

### Decision
Adopt **system UI font stack** and **SF Symbols** as design token base.  

### Consequences
- Ensures consistency across widgets.  
- Zero-maintenance system icon integration.  
- No external dependency on icon libraries.  

## ADR 12: Scope Discipline and Role Separation

**Status:** Accepted  
**Date:** 2025-09-12  

### Context
Past cycles introduced instability because the principal engineer (GPT) drifted from the agreed scope. Extra scripts (ops/README, CI “house rules”), improper prompting (heredocs, zsh comments), and commits to temporary artifacts (SERVICES_INDEX.md) created noise and rework. Role boundaries also blurred between GPT (principal) and Cursor (execution).

### Decision
- Scope for principal changes is **strictly limited to documentation/** and direct tooling (.github/workflows/docs-check.yml, tools/docs/generate-services.mjs).  
- `SERVICES_INDEX.md` is **temporary output only**. It must never be committed or diff-checked in CI.  
- Prompts for execution must be copy/pasteable bash commands only. No heredocs, no inline `#` comments.  
- Roles are explicit: **GPT = principal (process, design, decisions)**; **Cursor = execution (apply exact instructions)**.  

### Consequences
- Prevents scope drift and CI churn.  
- Keeps repo clean of temporary artifacts.  
- Reduces hours of rework by enforcing clarity on roles and scope.  


## ADR 13: Fix StudioShell Exports and Slot Components
**Date:** 2025-09-14  
**Status:** Accepted  
**Tags:** studio-shell, exports, slots, bugfix

### Context
The `@ck/studio-shell` package was unusable because its public API was empty:
- `src/index.ts` and `src/api/index.ts` contained no exports.  
- `StudioRoot.tsx` defined `StudioShell` but never exported it.  
- Slot components (`Left`, `Canvas`, `Inspector`) were undefined at runtime.  
This caused `/studio` to fail with `type is invalid` errors when rendering `<StudioShell.Left>`.

### Decision
- Add explicit exports to `StudioRoot.tsx`:
  - `export default StudioShell;`
  - `export { StudioShell };`
- Define slot components using `mkSlot`:
  - `const StudioShellLeft = mkSlot('Left');`
  - `const StudioShellCanvas = mkSlot('Canvas');`
  - `const StudioShellInspector = mkSlot('Inspector');`
- Attach slots to `StudioShell` for JSX syntax:
  - `StudioShell.Left = StudioShellLeft;` etc.
- Export slot components as named exports for alternative usage.  
- Update `src/api/index.ts` to re-export all public components.  
- Update `src/index.ts` to barrel-export from `./api`.

### Consequences
- Backward compatibility is preserved (`<StudioShell.Left>` still works).  
- Forward compatibility is improved with named exports (`StudioShellLeft`).  
- Build artifacts (`dist`) now include both default and named exports.  
- Added maintenance cost: slot definitions must be maintained consistently.

### Alternatives Considered
- **Runtime-only property attachment:** Failed due to TypeScript stripping declarations.  
- **Named exports only:** Would break existing usage patterns.  
- **Do nothing:** Left the package broken with missing exports.

### Rationale
This approach balances type safety, runtime correctness, and developer ergonomics:
- Ensures StudioShell works out of the box.  
- Prevents future runtime errors from missing exports.  
- Creates a clear API surface through `api/index.ts`.