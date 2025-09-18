# Phase-1 Acceptance Checklist (Frozen)
- [ ] Embed loader (loader + minimal runtime) ≤ **28KB gz**.
- [ ] First widget renders across **3 CMSs**.
- [ ] **Draft→Claim** flow: anonymous draft created on first load; claim ties widget to workspace; **rate-limited** audit entries exist.
- [ ] **Usage counters (daily)** increment (views, loads, interactions) with a 7-day dashboard view.
- [ ] **Sentry** reporting in **embed + app**; **PostHog** in **app only**.
- [ ] **Paris** `/api/healthz` returns `{ sha, env, up, deps: { supabase, edgeConfig } }` with 200 on pass and 503 on dependency failure.
- [ ] **Edge Config**: **read-only at runtime**, writes **CI-only**.
- [ ] Root `package.json` defines `packageManager=pnpm@10.*`; deployables declare `"engines": { "node": "20.x" }`.
- [ ] **Dieter** assets copied to `apps/app/public/dieter/` (no symlinks).

