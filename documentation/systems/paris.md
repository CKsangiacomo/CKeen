# System: Paris — HTTP API

## Identity
- Tier: Core
- Purpose: Token issuance (Supabase RPC), submissions (schema+per-token rate limit), telemetry ingest
- Owner: Platform

## Interfaces
- POST /api/tokens/issue
- POST /api/submissions
- POST /api/ingest
- GET  /api/healthz  (dependency health)

## Dependencies
- Supabase (Michael) via RPC
- Vercel Edge Config (read path) via `EDGE_CONFIG`

## Deployment
- Vercel project: **c-keen-api** (Root: `services/api`)

## Rules
- No PII in telemetry payloads
- Server-only secrets scoped to this project