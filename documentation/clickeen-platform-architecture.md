# CLICKEEN Platform Architecture — Phase 1 (Frozen)

This document is the canonical P1 snapshot. It describes what is built, what is out of scope for P1, and the boundaries between surfaces. All AIs and humans must follow this document. Architecture changes require an ADR and doc updates in the same PR.

## System map (P1)

| System (Codename) | Repo Path            | Deploy Surface (Vercel) | Responsibility (P1)                                       | Status |
|---|---|---|---|---|
| **Prague — Marketing Site** | `apps/site`   | `c-keen-site`  | Marketing pages, gallery, static content                 | **Done (P1)** |
| **Studio — Dashboard App**  | `apps/app`    | `c-keen-app`   | Auth flows, basic workspace views, serving Dieter assets | **Done (P1)** |
| **Venice — Embed Runtime**  | `services/embed` | `c-keen-embed` | Public embed runtime (edge), ingest/preview endpoints    | **Done (P1)** |
| **Paris — HTTP API**        | `services/api`   | `c-keen-api`   | Server-secret surface, `GET /api/healthz`, future admin  | **Done (P1, minimal)** |
| **Atlas — Edge Config**     | *(Vercel store)* | N/A            | Config delivery to runtimes (reads only at runtime)      | **Done (P1)** |
| **Phoenix — Idempotency**   | *(policy)*       | N/A            | Option B discipline across mutating endpoints            | **Policy in place** |
| **Oslo**                    | —                | —              | **RETIRED**                                              | **Removed** |

### Phase intents
- **P2** (not in this doc’s scope): billing, richer RBAC, more admin endpoints in Paris, workflows.  
- **P3**: scale/perf features, analytics, extended automation.

## Deploy surfaces

- `apps/site` → **c-keen-site** (Next 14.2.5; static pages + minimal API routes)  
- `apps/app` → **c-keen-app** (Next 14.2.5; middleware for auth; Dieter assets copy-on-build per ADR-005)  
- `services/embed` → **c-keen-embed** (Next 14.2.5; **edge** runtime; public APIs only)  
- `services/api` → **c-keen-api** (Next 14.2.5; **nodejs** runtime; server-secrets boundary)

## Paris — health surface (P1)
- `GET /api/healthz` → `200` with `{ sha, env, up, deps: { supabase, edgeConfig } }`; returns `503` if critical deps fail.  
- Runtime: **nodejs**.  
- **Secrets live here** (server-only).  
- **Edge Config**: read-only at runtime; CI writes only (see ADR-012 note).

## Edge Config (Atlas)
- Reads from runtimes (Embed/App/Site/Api).  
- **Writes** happen in **CI** using `VERCEL_API_TOKEN` + `EDGE_CONFIG_ID`, gated by `INTERNAL_ADMIN_KEY`.  
- Never write from runtime.

## Security boundaries
- Public embed (Venice) never holds server secrets.  
- All privileged operations move to Paris (API).  
- Apps use public keys/anon tokens only in the client; server interactions cross to Paris when secrets are required.

## Observability (P1)
- Health surface in Paris.  
- CI checks: lockfile integrity, Dieter assets, basic doc validation.  
- Add platform logging/metrics in P2.

## Data & auth (P1)
- Supabase public URL + anon key in app/site where needed; JWKS health-probed in Paris.  
- Admin/auth secrets remain in **c-keen-api** only.

## Change control
- Any cross-surface change requires an ADR and doc updates in the same PR.  
- Documentation drift is a P0 incident; fix docs first.

## Appendix: ADR-012 summary (Paris separation)
- **Decision**: Paris is a separate Vercel project to contain secrets and server-only endpoints.  
- **Rationale**: strict boundary between public embeddable code and secret-bearing surfaces.  
- **Health**: dependency-aware healthz.  
- **Edge Config**: runtime read-only; CI-only writes.  
- **Risks**: cold starts, schema drift; mitigated via health checks and docs-as-code.