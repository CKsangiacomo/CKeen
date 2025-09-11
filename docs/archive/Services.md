# Clickeen Services Architecture

## Core Systems (Business Critical)

1. **Paris — Templates System**  
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