TXT
# TechPhases.md

**Purpose**  
Authoritative, first-level technical specification for Clickeen across 3 phases. Defines services required per phase, why they exist, what they include at that phase, and the concrete stack choices we’ve already aligned on. This doc is the starting point for roadmapping and scoping.

**Guiding principles**
- **Product-led, self-serve.** No sales-led dependencies in the stack or flows.
- **Modular from day one.** Start unified (modular monolith), split into services only when scale demands it.
- **Size + speed as features.** Embed script budget is hard (see budgets).
- **Security by default.** Postgres RLS, least privilege, token scope + rotation.
- **DX matters.** pnpm workspaces, strict linting, type-safe APIs, one-task-at-a-time execution.
- **No guessing.** If a dependency or design isn’t confirmed here, mark **TBD** and raise before implementation.

---

## Phase 1 — Widgets (Trojan Horse)

**Goal:** Ship first widgets + infra. Prove distribution, self-serve onboarding, and usage capture with a <28KB embed.

### Services in Phase 1 (what & why)

1) **Embed Service**
- **Why:** Core delivery of widgets to any website; single snippet integrates, auto-updates.
- **Scope (P1):**
  - Public **embed loader** (vanilla TS) served via CDN; budget **≤28KB gz** total (loader + minimal runtime).
  - Widget bootstrapper, DOM mounting, attribute/config parsing, feature flags.
  - Versioning (`/embed/v{semver}/loader.js`) and default alias (`/embed/latest/loader.js`).
  - Lightweight, **queue-safe event bus** for widget events (no external deps).
  - Minimal client metrics (load start/end, errors) with **fire-and-forget pixel** endpoint.
- **Tech:** TypeScript, small bundler (**esbuild** or **rollup**, pick smallest bundle), CDN (**Vercel Edge** or **Cloudflare** TBD), Sentry (errors).

2) **Auth & Workspace Service**
- **Why:** Needed to claim widgets, manage ownership, and secure admin UIs.
- **Scope (P1):**
  - Email/password + magic link via **Supabase Auth** (JWT).
  - **Workspaces** (orgs) with ownership; single role (Owner) initially.
  - Basic account settings; RLS enforced on all tenant data.
- **Tech:** Supabase (Postgres + Auth + RLS), Next.js (dashboard).

3) **Usage & Token Service** (**“Dieter” tokens**)
- **Why:** Enforce limits; instrument adoption funnel; secure embed calls.
- **Scope (P1):**
  - Token issuance (workspace-scoped, widget-scoped), rotation, revocation.
  - Rate-limit counters (simple per-token window).
  - Usage counters (views, loads, interactions) aggregated daily.
- **Tech:** Supabase (tables, SQL functions), Edge function(s) for write endpoints.

4) **Billing Service (stub)**
- **Why:** Turn on monetization path without full UI.
- **Scope (P1):**
  - **Stripe** products/prices created; webhook receiver that records customer + subscription rows.
  - No full paywall yet; gated flags available to enable per-workspace.
- **Tech:** Stripe + minimal serverless endpoint, Supabase tables to mirror subscription state.

5) **System UI / Design Tokens (“Dieter”)**
- **Why:** Shared design foundation across dashboard + widgets.
- **Scope (P1):**
  - **System UI font stack** (no Ubuntu/Roboto), light/dark tokens, spacing/typography scales.
  - **SF Symbols** integration (all 6,950 SVGs) under `/tools/sf-symbols/svgs/`.
  - Icon component + zero-maintenance pipeline (indexing by name, tree-shakeable).
- **Tech:** TS/React UI package, CSS vars tokens, PostCSS; icon build script.

6) **Widget(s)**
- **Why:** Real value + distribution.
- **Scope (P1):**
  - First widget(s): **Form widget** (per previous roadmap), plus minimal variants if time.
  - Client-only render with optional SSR stub, themeable via CSS vars from Dieter.
  - No heavy deps; size folded into overall loader budget if embedded, or code-split on demand.
- **Tech:** React (minimal), TS; **no** third-party UI libs.

7) **Drafts + Claim Flow (“Bob”)**
- **Why:** Convert public installs into accounts.
- **Scope (P1):**
  - Anonymous widget draft token created on first load; **claim** flow ties it to a workspace after signup.
  - Rate-limited claim attempts; audit trail (triggers already discussed).
- **Tech:** Supabase tables + triggers (claim audit), simple claim UI in dashboard.

8) **Observability & Health (seed)**
- **Why:** Find issues fast, keep uptime.
- **Scope (P1):**
  - Sentry client/server integration (embed + dashboard).
  - `/healthz` endpoints, uptime pings.
  - Product analytics baseline via **PostHog** in dashboard (not embed).
- **Tech:** Sentry SDKs, PostHog web snippet (dashboard only).

---

### Phase 1 Stack (confirmed + used)

- **Language:** TypeScript everywhere.
- **Frontend/Dashboard:** React + **Next.js** (already present), minimal server actions or API routes.
- **Embed Loader/Runtime:** Vanilla TS + minimal React (only where needed), esbuild/rollup bundling.
- **Package/Workspace:** **pnpm** workspaces (6 projects noted). Lockfile committed.
- **Database:** **Supabase Postgres** (+ Auth, Realtime optional later).
- **Auth:** Supabase Auth (JWT) with RLS for multi-tenant isolation.
- **Billing:** Stripe (webhook → Supabase).
- **Analytics:** PostHog (dashboard), tiny pixel endpoint for embed.
- **Error Monitoring:** Sentry (embed + dashboard).
- **Design System:** Dieter tokens + SF Symbols SVG set, system UI font stack.
- **Hosting/CDN:** Vercel (frozen for Phase 1).
- **CI/CD:** Git provider **+ GitHub Actions** (TBD exact jobs); Supabase CLI for migrations.
- **Lint/Format/Test:** ESLint (strict), Prettier, **Vitest** (unit), **Playwright** (smoke) — adopt incrementally.

---

### Phase 1 Data Model (first cut)

Core tables (Supabase/Postgres):
- `users` (auth-linked profile)
- `workspaces` (tenant)
- `workspace_members` (P1 may be implicit Owner only)
- `widgets` (definition metadata)
- `widget_instances` (deployed unit; anonymous until claim)
- `widget_claim_audit` (attempts + triggers; **rate-limit trigger present**)
- `embed_tokens` (workspace/widget scoped; status, scopes, last_rotated_at)
- `usage_counters_daily` (per token/widget/day: views, loads, interactions)
- `stripe_customers`, `stripe_subscriptions` (mirror Stripe state; stub in P1)

**RLS:**  
- All tenant data is **workspace-scoped** with `workspace_id` FK.  
- Policies: `auth.uid()` must map to a member of the workspace (Owner role P1).

---

### Phase 1 Security Baseline

- **RLS enabled by default** on all tenant tables; deny-all + explicit allow policies.
- **Embed tokens**: random, 128-bit (min), scoped to widget/workspace; rotate via dashboard.
- **Rate limiting**: per token for write endpoints; exponential backoff after failures.
- **CSP**: strict in dashboard (`script-src 'self'` + Sentry/PostHog domains). Embed publishes a safe list in docs.
- **PII**: avoid storing in embed events; only aggregate counters.
- **Secrets**: .env via Vercel/Cloudflare secrets; never in repo.

---

### Phase 1 Performance/Size Budgets

- **Embed loader total** (loader + minimal runtime): **≤28KB gz** (Venice target).
- **Per-widget incremental** (lazy chunk): **≤10KB gz** initial render.
- **Load time**: first byte ≤100ms at edge; TTI < 1s on 4G for simple widget.
- **Third-party deps**: zero unless absolutely necessary; no UI frameworks.

**CI enforcement:**  
- `size-limit`/bundlesize checks on embed output.  
- Lint rule preventing accidental imports (e.g., lodash full).  
- PR fails if budgets exceeded.

---

## Phase 2 — Low-Cost SaaS for SMBs

**Goal:** Layer broader SaaS capabilities on top of widget footprint. Multi-user, integrations, real billing. Keep self-serve simplicity.

### Services in Phase 2 (evolutions/new)

1) **Embed Service (evolve)**
- Advanced analytics (CTR, conversion events), A/B hooks, perf tuning per widget.
- Cached config manifests at edge; per-workspace feature flags.

2) **Auth & Workspace (evolve)**
- Roles & permissions (Owner, Admin, Member).
- Multiple workspaces per user; invitations; basic audit log.

3) **Usage & Token (evolve)**
- Event-level logs (append-only table) with rollups to daily aggregates.
- Tiered quotas; soft-then-hard limit behavior; usage UI.

4) **Billing (full)**
- Self-serve subscriptions in-app, upgrade/downgrade, proration, dunning.
- Per-workspace plan entitlements → feature gating via server flags.
- Invoices + receipts via Stripe Customer Portal.

5) **Integration Service (new)**
- First-party connectors: Google (OAuth), Slack (webhooks), Stripe (billing already), email (TBD: Resend/Sendgrid).
- Webhooks for outbound events (workspace-scoped signing secret).

6) **Workflow/Orchestration (new)**
- Lightweight automations: triggers (usage thresholds, form submission), actions (email, Slack, webhook).
- Rate-limited, retried delivery; dead-letter logging.

7) **Observability & Health (expand) – “Berlin”**
- SLOs + error budgets; alerting (PagerDuty **TBD**).
- Centralized logs (supabase logs + dashboard viewer); Sentry release health.

8) **Docs/Dev Portal (new)**
- Public docs for embed, tokens, webhooks, API keys; examples.

---

### Phase 2 Stack Additions

- **OAuth** (Google) via NextAuth **TBD** or Supabase OAuth providers.
- **Email** provider **TBD** (Resend/SendGrid) with domain auth.
- **Job/Queue**: lightweight queue **TBD** (Cloudflare Queues or simple cron + table outbox).
- **API Keys** for server-to-server integrations (separate from embed tokens).
- **Docs site**: Docusaurus or Next.js app route; lives in `apps/docs`.

---

### Phase 2 Data Model (additions)

- `roles` / `workspace_members` (role column)
- `events_raw` (append-only usage stream), `usage_rollups_daily`
- `api_keys` (hashed), `webhook_endpoints`, `webhook_deliveries`
- `integrations` (per provider), `oauth_connections`
- `audit_logs`

**RLS:**  
- Extended to role checks. Webhook deliveries exposed via signed URL, not public.

---

### Phase 2 Security

- **API keys** hashed + prefix displayed once; rotate/revoke.
- **Webhook signatures** (HMAC-SHA256 with per-endpoint secret).
- **Audit log** of security events (role changes, token rotations).
- **Secrets**: per-env isolation; least-privileged service keys.

---

### Phase 2 Performance

- Keep embed budgets; offload heavy analytics to event stream/rollups.
- Edge config manifests served from KV/edge cache (**TBD**: Vercel Edge Config or Cloudflare KV).

---

## Phase 3 — Enterprise Platform

**Goal:** Enterprise-grade features at a fraction of legacy cost while preserving product-led simplicity.

### Services in Phase 3 (evolutions/new)

1) **Embed Service (enterprise)**
- Per-tenant isolation toggles; SLA monitoring dashboards; signed config manifests.
- Region routing / data residency **TBD** (if required).

2) **Auth & Workspace (enterprise)**
- **SSO/SAML**, **SCIM** provisioning, granular permissions, full audit trails.
- Suspensions, legal holds, export tooling.

3) **Usage & Token (enterprise)**
- Cross-service metering + consolidated enterprise reporting.
- Contractual quota enforcement; overage reporting.

4) **Billing (enterprise)**
- Custom contracts (manual adjustments), seat-based pricing support.
- Invoicing net terms; tax/VAT compliance (Stripe Tax).

5) **Integration Service (deep)**
- Salesforce/HubSpot connectors, advanced mapping + backfill jobs.
- Signed inbound API for partners.

6) **Workflow/Orchestration (advanced)**
- Multi-step, conditional automations; replay; idempotency keys.
- Visual run history with redelivery.

7) **Observability & Health (mature)**
- Error budgets per tier, tenant-level dashboards, synthetic tests per region.
- Incident playbooks.

8) **Compliance & Security (new)**
- SOC 2 readiness controls, DPA/GPDR features (export/delete), data retention policies.
- KMS/At-Rest encryption posture documentation (Supabase/PG native).

---

### Phase 3 Stack Additions (TBD until contracted)

- **SSO/SAML** (WorkOS or custom SAML), **SCIM** (WorkOS or custom).
- **Data residency** options (multi-project Supabase, region pinning).
- **Advanced queue** if needed (e.g., Cloudflare Queues, Upstash Kafka **TBD**).

---

### Phase 3 Data Model (additions)

- `enterprise_accounts`, `contracts`, `seats`
- `saml_connections`, `scim_provisioning`
- `compliance_artifacts`, `retention_policies`
- `incident_reports`

**RLS:**  
- Auditable admin overrides with justification logs.

---

## Repository & Workspace Structure (baseline)

/apps
  /dashboard           # Next.js app (admin UI)
  /embed-service       # Embed endpoints + static loader builds
  /docs                # Public docs (P2+)
/packages
  /ui-dieter           # Design tokens, primitives, theme
  /embed-runtime       # Loader + runtime (vanilla TS + tiny React where needed)
  /icons               # SF Symbols wrapper components + build scripts
  /analytics-client    # Tiny client for pixel posting (used by embed)
/services              # (optional) splitouts post-P1 if needed
/tools
  /sf-symbols/svgs     # 6,950 SVGs (extracted)
  /scripts             # repo scripts (release, size checks, etc.)

**pnpm**  
- Commit `pnpm-lock.yaml`.  
- Install policy:
  - First time: `pnpm install --no-frozen-lockfile` → commit lockfile
  - CI/local thereafter: `pnpm install --frozen-lockfile`

**NPM scripts (examples)**  
- `build`: typecheck + build all packages/apps  
- `lint`, `format`, `test`, `test:e2e`  
- `sizecheck`: run bundle size checks on embed output

---

## CI/CD (minimum viable)

**P1 pipelines**
- **PR:** typecheck, lint, unit tests, **sizecheck** (embed budgets), preview deploy.
- **Main merge:** build + deploy; run supabase migrations using **Supabase CLI**; smoke checks.
- **Keys/Secrets:** stored per-env (no repo).

**Release/versioning**
- Semantic versions for **embed runtime**.  
- `latest` alias always points to most recent stable; pin via `vX.Y.Z` when needed.  
- Release notes auto-posted to `documentation/CHANGELOG.md`.

---

## Acceptance criteria per Phase

**Phase 1**
- Embed loader ≤28KB gz; first widget ships and renders across 3 test CMSs.
- Anonymous draft → claim flow works; workspace created and owns widget.
- Usage counters increment; basic dashboard view shows last 7 days.
- Sentry shows errors; health checks green; PostHog events flowing (dashboard only).
- Stripe webhooks create subscription rows (behind feature flags).

**Phase 2**
- Multi-user roles; invitations; audit log for role changes.
- Billing fully self-serve; plan entitlements gate features.
- Integrations: Google OAuth + Slack webhook live; webhook signatures verified.
- Workflows: one trigger → one action with retries + run history.
- Docs site live with token/API/webhook sections.

**Phase 3**
- SSO/SAML + SCIM for at least one IdP; audit log meets enterprise bar.
- Consolidated usage & contract quotas; enterprise invoices.
- Deep CRM integration (Salesforce/HubSpot) with backfill job and mapping UI.
- Compliance controls: data export/delete, retention policies, incident report templates.

---

## Open decisions (raise before implementation)

- **Hosting target** for prod: Vercel vs Cloudflare (cost vs DX).  
- **Edge config store** for per-workspace manifests: Vercel Edge Config vs Cloudflare KV.  
- **Job/Queue** provider (P2): Cloudflare Queues vs DB-backed outbox.  
- **Email** provider (P2): Resend vs SendGrid.  
- **SSO/SAML/SCIM** vendor (P3): WorkOS vs custom.

---

## Non-goals (for now)

- On-prem deployments.  
- Native mobile SDKs.  
- Heavy analytics in the embed (keep it lean; aggregate server-side).

---

## Appendix — Table & Policy Sketches (P1)

**Example: `embed_tokens`**
- `id (uuid)`, `workspace_id`, `widget_id`, `token (hashed)`, `scopes text[]`, `status enum(active,revoked)`, `created_at`, `last_rotated_at`
- **Policy:** token readable only via server; embed receives opaque public token not stored in DB as plaintext.

**Example: `usage_counters_daily`**
- `(date, workspace_id, widget_id, token_id) → views, loads, interactions`
- **Policy:** select restricted to workspace members.

**RLS default**
```sql
-- deny all
alter table ... enable row level security;
create policy deny_all on ... for all using (false);

-- allow workspace members
create policy tenant_read on ... for select using (
  exists (
    select 1 from workspace_members m
    where m.workspace_id = ...workspace_id and m.user
### Phase 1 Deployments (FROZEN)

- **Vercel projects (4):**
  - `c-keen-app` — Studio/Console (Next.js)
  - `c-keen-site` — Marketing site (Next.js)
  - `c-keen-embed` — Embed service at edge (Next.js / edge routes)
  - `c-keen-api` — **Paris — HTTP API** (Next.js / node runtime)
- **Rule:** No additional projects in P1 (frozen).
- **Edge Config:** **Vercel Edge Config** in P1 (runtime read-only). Any writes are performed in CI using a scoped `VERCEL_API_TOKEN` with `EDGE_CONFIG_ID`.

#### Health endpoint spec (all services)

Each service must expose `/api/healthz` returning 200 on pass and 503 if a critical dependency fails. The response MUST include the following shape:

```json
{
  "sha": "<short-sha|unknown>",
  "env": "production|preview|development",
  "up": true,
  "deps": { "supabase": true, "edgeConfig": true }
}
