CRITICAL P0 — documentation/ is the single source of truth for all AI & human work. You MUST read and follow it. If you see discrepancies, STOP and ask for alignment.

# CONTEXT

This repo is the monorepo for **CLICKEEN (SaaS)**. The documentation in this folder governs how humans and AIs work. If any code, script, or comment conflicts with documentation/, the docs win. Ask for alignment before proceeding.

## Codename map (FROZEN for Phase 1)
- **Paris — HTTP API** (`services/api`, Vercel project **c-keen-api**)  
- **Venice — Embed Runtime** (`services/embed`, Vercel project **c-keen-embed**)  
- **Studio — Dashboard App** (`apps/app`, Vercel project **c-keen-app**)  
- **Prague — Marketing Site** (`apps/site`, Vercel project **c-keen-site**)  
- **Atlas — Edge Config** (Vercel Edge Config store, read from runtime; writes: **CI-only**)  
- **Phoenix — Idempotency** (Option B; enforced where applicable)  
- **Oslo — RETIRED** (do not reintroduce; remove stale references when found)

## Phase status (P1 frozen)
**Built in P1**
- `apps/site` (Prague) — marketing pages + gallery
- `apps/app` (Studio) — auth flows, basic workspace/views
- `services/embed` (Venice) — public embed runtime + preview and ingest endpoints
- `services/api` (Paris) — health surface; server-secret–bounded project for future admin/secure endpoints
- Atlas — Edge Config **read-only at runtime**; **writes only from CI** gated by `INTERNAL_ADMIN_KEY`

**Not built in P1 (do not start without ADR)**
- Billing & subscriptions
- Workflow automation
- Fine-grained RBAC beyond what exists
- Runtime Edge Config writes (must stay CI-only)

## Rules of engagement (for all AIs & humans)
1. **Read documentation/** first. If unclear, **ask**; do not guess.  
2. **No placeholders.** If a value is unknown, stop and request it.  
3. **Service boundaries are hard:** embed ≠ api ≠ app ≠ site.  
4. **Secrets live only** in **c-keen-api** (server surface).  
5. **CI-only** writes to Edge Config; runtime is **read-only**.  
6. When changing behavior or surface area, land an **ADR** and update docs in the same PR.

## Where things live
- **Monorepo**: pnpm workspaces + Turbo (root `package.json` is the SoT)  
- **Deploy projects (Vercel)**:  
  - `c-keen-site` → `apps/site`  
  - `c-keen-app` → `apps/app`  
  - `c-keen-embed` → `services/embed`  
  - `c-keen-api` → `services/api`  
- **Edge Config**: store = **Atlas** (reads at runtime; writes via CI)

## Canonical docs (start here)
- `documentation/Techphases.md` — frozen P1 scope & phase gates  
- `documentation/clickeen-platform-architecture.md` — system map & responsibilities  
- `documentation/ADRdecisions.md` — authoritative decisions (incl. ADR-012)  
- `documentation/verceldeployments.md` — env/keys per project

> If you encounter an **“Oslo”** reference, remove it and align the doc to the **Paris — HTTP API** model (ADR-012).
### Note on Claude Code (local CLI)
Claude Code is installed and authenticated on the CEO’s machine.  
It is **NOT part of the standard process**. Cursor AI remains the primary Full Stack Engineer for local repo operations.  
Claude Code may only be used if explicitly required to unblock Cursor or perform local edits.  
