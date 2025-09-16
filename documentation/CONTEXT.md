CRITICAL P0 — For ALL AIs and humans: documentation/ is the single source of truth; you must read it and follow it. On ANY discrepancy, STOP and ask alignment questions before proceeding.

# Clickeen Platform Context (AI-First)

This document is the **source of truth** for AI agents (CTO, Principal FS Eng, FS Eng) and humans when coordinating work in Phase-1. It encodes *frozen* deployment surfaces, invariants, and execution rules to prevent drift and rework.

---

## Platform Positioning
Clickeen is a SaaS platform. **Widgets are the entry wedge, not the full definition.** Infrastructure is the product in Phase-1; we optimize for the ability to create **30+ widgets** predictably.

---

## Phase-1 Deployments (FROZEN)
**Vercel projects (4):**
- `c-keen-app` — Studio / Console (Next.js, node) → repo: `apps/app`
- `c-keen-site` — Marketing (Next.js, node) → repo: `apps/site`
- `c-keen-embed` — Embed service (Next.js API routes at **edge**) → repo: `services/embed`
- `c-keen-api` — **Paris — HTTP API** (Next.js, **node** runtime) → repo: `services/api`

**Phase-1 Project Rule:** Four Vercel projects (frozen). **No additional projects in P1.** Any change requires an ADR.

---

## Workspace ↔ Project Map (P1)
- `apps/app`        → `c-keen-app` (Studio/Console)
- `apps/site`       → `c-keen-site` (Marketing)
- `services/embed`  → `c-keen-embed` (Edge routes)
- `services/api`    → `c-keen-api` (**Paris — HTTP API**)

---

## Health & Observability (Canonical)
Every service must expose **`/api/healthz`**:
- **200** when critical deps are healthy; **503** otherwise.
- Response shape:
```json
{
  "sha": "<short-sha|unknown>",
  "env": "production|preview|development",
  "up": true,
  "deps": { "supabase": true, "edgeConfig": true }
}

Timeout budget: ~1s per dependency probe (p95 target < 500ms in dev).

⸻

Edge Config Policy
	•	Runtime: read-only via EDGE_CONFIG.
	•	Writes: only in CI, using VERCEL_API_TOKEN scoped to the project + EDGE_CONFIG_ID.
	•	Rationale: keep secrets and mutations out of public/embed surfaces; centralize governance.

⸻

Studio Shell
	•	Not a Vercel project.
	•	Source: packages/studio-shell.
	•	Produces UMD bundles in dist/. Host apps copy on build into /public/vendor/studio/ (per ADR). No runtime fetches or symlinks in production.

⸻

Source of Truth (SoT)
	•	Workspaces: pnpm-workspace.yaml is the only SoT. Root package.json.workspaces must be absent to avoid pnpm drift/warnings.
	•	Architecture & decisions: documentation/ + ADRs (IDs referenced in code when applicable).
	•	Runtime config: Vercel env + Edge Config (read-only at runtime).

⸻

Phase-1 (FROZEN) Invariants
	•	Stack: Node 20.x, Next 14.2.5, React 18.2.
	•	Embed budget: ≤ 28KB gz (loader + minimal runtime). Per-widget ≤ 10KB gz initial render.
	•	Typed event bus & shared types for Studio/Widgets (no ad-hoc events).
	•	Paris — HTTP API isolates secrets & server logic; embed stays edge-safe and public.

⸻

Environments & Secrets (Minimal)
	•	Supabase: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE
	•	Edge Config (runtime reads): EDGE_CONFIG
	•	Edge Config (CI writes only): VERCEL_API_TOKEN, EDGE_CONFIG_ID
	•	Admin guard: INTERNAL_ADMIN_KEY (HTTP header x-ckeen-admin on admin endpoints)

⸻

Team Roles & How to Address
	•	CEO (Human): sets priorities, approves milestones.
	•	CTO (Claude): architecture authority, ADR gatekeeper, reviews risky changes.
	•	Principal FS Eng (ChatGPT): owns cross-service design, authors AI prompts, keeps docs canonical.
	•	FS Eng (Cursor): executes prompts deterministically → branches/PRs; no improvisation.

When writing to AIs, include exactly one fenced block headed by AIPrompt: <role>. Prompts must be zsh-safe, non-interactive, with timeouts on network commands.

⸻

Cursor Execution Rules (Canonical)
	•	No blocking commands: no tail -f, gh run watch, interactive prompts, infinite loops.
	•	No exit 1/0: scripts finish naturally; report via [OK]/[WARN]/[FAIL] echoes.
	•	Timeouts: network commands wrapped (e.g., timeout 10 <cmd> or gtimeout on macOS).
	•	Structure: start with cd /Users/<user>/code/CKeen; end with [DONE].
	•	Git: never force-push; no deletes without explicit human-provided lists.

⸻

Branching & PR Protocol (P1)
	•	Branch names: fix/<topic>, chore/<topic>, feat/<topic>, docs/<topic>.
	•	One logical change per PR. Include “Why / What / Risk” in the PR body.
	•	Merge strategy: Squash & merge. Then prune topic branches (local & remote).

⸻

Common Pitfalls (Do Not Do)
	•	Re-introducing package.json.workspaces (pnpm drift).
	•	Creating a 5th Vercel project in P1.
	•	Writing Edge Config from runtime.
	•	Importing from a root src/ tree (deleted; not referenced).
	•	Ambiguous prompts (multiple blocks, “optional” steps, interactive flows).

⸻

Definition of Done (P1) — Any Change
	1.	Builds pass: services/api, services/embed, apps/app, apps/site.
	2.	/api/healthz returns 200 locally; dependency bits behave (Supabase / Edge Config).
	3.	PR includes “Why / What / Risk”; references ADR if applicable.
	4.	Docs updated if behavior/shape changed (especially CONTEXT.md, TechPhases.md).
