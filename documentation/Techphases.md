Title: TechPhases.md — Finalized (Phase 1) — Oslo removed — Phoenix Idempotency = Option B
Status: FROZEN (P1). This document is the single source of truth. Any change requires an ADR and reviewer sign-off.

──────────────────────────────────────────────────────────────────────────────
0) Summary / Final Decisions
──────────────────────────────────────────────────────────────────────────────
- Services, embed budget (<28KB), and DB Contract (tables, functions, RLS) are frozen and executable.
- Oslo: fully removed (no service, no DB artifacts required).
- Atlas: Vercel Edge Config (primary). Vercel KV not required in P1.
- SECURITY DEFINER code: SET search_path = public, extensions (explicit).
- Phoenix idempotency: CHOSEN = Option B (DB-enforced uniqueness with ON CONFLICT DO NOTHING).
  Rationale: simpler, reliable under parallelism, better observability in P1 volumes.

──────────────────────────────────────────────────────────────────────────────
1) P1 DB Contract — Authoritative Extract (Executable)
──────────────────────────────────────────────────────────────────────────────
1.1 Extensions & search_path
- pgcrypto installed; all SECURITY DEFINER functions and triggers must include:
  SET search_path = public, extensions
- Do not assume implicit extension visibility in public.

1.2 Tables (New / Renamed)
- embed_tokens (renamed from historical oslo_tokens; NOTE: Oslo artifacts are NOT required)
  Columns (authoritative):
    id (uuid or existing pk type),
    widget_instance_id uuid (FK → public.widget_instances(id) ON DELETE CASCADE),
    token text (prefixed "et_"),
    expires_at timestamptz,
    created_at timestamptz,
    created_by uuid,
    rotated_at timestamptz.
  RLS:
    ENABLED. Deny-all baseline.
    SELECT allowed only for members of the owning workspace via join: widget_instances → widgets → workspace_members.
    INSERT/UPDATE/DELETE only via SECURITY DEFINER RPCs (see §1.5).

- submission_rate_window
  Purpose: per-token minute buckets for request limiting.
  Primary key: (token_id uuid, bucket_start timestamptz).
  Retention: pruned hourly via pg_cron (if available) calling prune_submission_rate_windows_v1.

- Agency billing support:
  billing_accounts (owner_user_id) and billing_account_workspaces (mapping).
  RLS:
    billing_accounts: owner-only RW.
    billing_account_workspaces: read allowed if (owner) OR (member of that mapped workspace); write owner-only.

1.3 Modified Tables
- events, usage_events — privacy envelope fields (no PII):
    event_id uuid, cfg_version text, embed_version text, client_run_id uuid, page_origin_hash text.

- widget_submissions — guardrails:
  Columns: payload_hash text, ts_second timestamptz.
  Constraint: widget_submissions_payload_max32kb → pg_column_size(payload) <= 32768.
  Index: (widget_id, ts_second, payload_hash) for dedupe/lookup.

1.4 Trigger Implementation (authoritative; applied)
- Function:
    CREATE OR REPLACE FUNCTION public.widget_submissions_fill_derived_v1()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, extensions
    AS $$
    BEGIN
      NEW.payload_hash := encode(digest(NEW.payload::text, 'sha256'), 'hex');
      NEW.ts_second    := date_trunc('second', NEW.ts);
      RETURN NEW;
    END;
    $$;
- Trigger:
    DROP TRIGGER IF EXISTS widget_submissions_fill_derived_trg ON public.widget_submissions;
    CREATE TRIGGER widget_submissions_fill_derived_trg
    BEFORE INSERT OR UPDATE ON public.widget_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.widget_submissions_fill_derived_v1();

1.5 Functions (Signatures are frozen)
- Tokens:
    issue_embed_token_v1(widget_instance_id uuid, ttl_minutes int, created_by uuid default null) → public.embed_tokens
    issue_embed_token_for_public_id_v1(public_id text, ttl_minutes int, created_by uuid default null) → public.embed_tokens
    rotate_embed_token_v1(token_id uuid, ttl_minutes int) → public.embed_tokens
    revoke_embed_token_v1(token_id uuid) → void
    get_token_id_from_string_v1(token text) → uuid
- Submissions & Rate limiting:
    enforce_submission_rate_limit_v1(token_id uuid, now timestamptz default now(), limit int default 60) → void
    enforce_submission_rate_limit_by_token_v1(token text, now timestamptz default now(), limit int default 60) → void
    prune_submission_rate_windows_v1(p_older_than interval default '1 hour') → void
    widget_submissions_fill_derived_v1() → trigger
- Usage policy:
    No daily counters table in P1. KPIs computed from events/usage_events and monthly rollups.

1.6 Privacy (hard rules)
- No PII, IP, UA, or raw URLs in telemetry.
- page_origin_hash = sha256(origin + path) computed client-side or at ingest; only the hash is stored.
- Errors logged as codes/phase; no stack traces or user-provided secrets in payload.

1.7 Back-Compat (Oslo)
- Authoritative position: There are no required Oslo DB objects in P1.
- If any legacy env still has public.oslo_tokens view or oslo_* functions, schedule removal via short ADR; they are not part of the P1 contract.

1.8 DB Contract Versioning and Metadata
- Version table:
    CREATE TABLE IF NOT EXISTS public.db_contract_version (
      version int PRIMARY KEY,
      applied_at timestamptz DEFAULT now()
    );
- Current marker (idempotent):
    INSERT INTO public.db_contract_version (version)
    VALUES (1)
    ON CONFLICT (version) DO NOTHING;
- Metadata (optional, recommended):
    CREATE TABLE IF NOT EXISTS public.db_contract_metadata (
      key text PRIMARY KEY,
      value text NOT NULL,
      updated_at timestamptz DEFAULT now()
    );
    INSERT INTO public.db_contract_metadata (key, value)
    VALUES ('contract_version', '1')
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = now();

1.9 Indexes (must exist)
- events_event_id_unique_idx on public.events(event_id) UNIQUE WHERE event_id IS NOT NULL  [Option B contract]
- usage_events_event_id_idx on public.usage_events(event_id) (non-unique is acceptable in P1)
- widget_submissions_dedupe_idx on public.widget_submissions(widget_id, ts_second, payload_hash)

1.10 pg_cron (if available) — pruning schedule (idempotent example)
- Install if available:
    CREATE EXTENSION IF NOT EXISTS pg_cron;
- Schedule hourly prune with 1-hour retention (tunable):
    SELECT cron.schedule(
      'prune-rate-windows-hourly',
      '0 * * * *',
      'SELECT public.prune_submission_rate_windows_v1(interval ''1 hour'');'
    );

──────────────────────────────────────────────────────────────────────────────
2) Services Map (Phase 1 minimal set = 8 services)
──────────────────────────────────────────────────────────────────────────────
S1. Venice — Embed/runtime
- Single <28KB script; fetch config by token/public_id; render widgets.
- Emits telemetry envelope; posts submissions.
- No AI calls; privacy by default.

S2. Studio — Builder App
- Typed event bus; author/preview/publish widget instances (public_id).
- Displays usage/limits; agency workspace switching; Stripe handoffs (Tokyo).

S3. Paris — HTTP API (Vercel API routes/serverless)
- Token issuance (calls Supabase RPCs).
- Submissions endpoint: validate schema; enforce per-token rate limit; insert.
- Telemetry ingest: accept envelope; forward to Phoenix.

S4. Michael — Data plane (Supabase Postgres + RLS)
- Authoritative store; RPCs; RLS policies. (See §1.)

S5. Phoenix — Telemetry ingest & usage pipeline
- At-least-once ingestion; DB-enforced idempotent insert (Option B).
- Enrich; compute rollups; feed Tokyo as needed.

S6. Tokyo — Billing & entitlements
- Stripe subscriptions on billing_accounts; enforce plan features/limits; webhooks update flags.

S7. Atlas — Edge config distribution
- Vercel Edge Config (read-mostly, low-latency).
- Serve config by public_id; invalidate on publish/rotate; fallback to Michael via Paris.

S8. Dieter — Design System
- Tokens, primitives, components, icons; a11y guarantees; per-widget light/dark toggle.

──────────────────────────────────────────────────────────────────────────────
3) Non-Goals (Phase 1)
──────────────────────────────────────────────────────────────────────────────
- No AI calls from Venice.
- No cross-tenant analytics UIs. No enterprise SSO.
- No "daily counters" tables.
- No external preview microservice.

──────────────────────────────────────────────────────────────────────────────
4) Event Taxonomy & Phoenix Ingest (Phase 1)
──────────────────────────────────────────────────────────────────────────────
4.1 Envelope (required)
- event_name (controlled vocab), event_id (uuidv4), ts (ms epoch),
  workspace_id, widget_id, token_id,
  cfg_version, embed_version, client_run_id, page_origin_hash,
  payload (optional JSON; non-PII).

4.2 Rules
- At-least-once delivery tolerated.
- Dedupe must rely on event_id (DB unique, Option B).
- No PII in payload.

4.3 Phoenix insert pattern (Option B, authoritative)
- DDL (migration delta to align staging/prod):
    CREATE UNIQUE INDEX IF NOT EXISTS events_event_id_unique_idx
      ON public.events(event_id)
      WHERE event_id IS NOT NULL;
- Insert:
    INSERT INTO public.events (
      event_id, event_name, ts, workspace_id, widget_id, token_id,
      cfg_version, embed_version, client_run_id, page_origin_hash, payload
    )
    VALUES ($1, $2, to_timestamp($3/1000.0), $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
    ON CONFLICT (event_id) DO NOTHING
    RETURNING event_id;  -- NULL return == duplicate observed

──────────────────────────────────────────────────────────────────────────────
5) Studio Event Bus — P1 types (minimum)
──────────────────────────────────────────────────────────────────────────────
- Package: packages/shared-types/src/studioBus.ts
- Types:
    export type WidgetEventName =
      | 'widget_loaded'
      | 'widget_rendered'
      | 'interaction'
      | 'submission_ok'
      | 'submission_err'
      | 'error_embed'
      | 'error_backend';
    export interface WidgetEventEnvelope<T = unknown> {
      event_name: WidgetEventName;
      event_id: string;       // uuid
      ts: number;             // ms epoch
      workspace_id: string;   // uuid
      widget_id: string;      // uuid
      token_id?: string;      // uuid
      cfg_version?: string;
      embed_version?: string;
      client_run_id?: string; // uuid per page view
      page_origin_hash?: string; // sha256(origin+path)
      payload?: T;            // non-PII
    }
    export type StudioEvent =
      | { type: 'widget:selected'; widgetId: string }
      | { type: 'preview:state'; route: string }
      | { type: 'variant:toggle'; widgetId: string; variant: string; enabled: boolean };
    export interface StudioEventBus {
      emit(event: StudioEvent): void;
      on<T extends StudioEvent>(handler: (event: T) => void): () => void;
    }

──────────────────────────────────────────────────────────────────────────────
6) Design Moat (Operationalized)
──────────────────────────────────────────────────────────────────────────────
- Dieter governs theming primitives, per-widget Light/Dark toggle in Builder/runtime, motion, spacing, iconography with parity across Studio/Embed.
- Accessibility: Focus order, ARIA roles, minimum contrast enforced by tokens.
- Non-negotiables:
  • Embed UI must pass a11y lint rule set in CI.
  • Studio “instant onboarding”: empty states and first-run flows must be self-explanatory.

──────────────────────────────────────────────────────────────────────────────
7) Agency Use Case (Phase 1)
──────────────────────────────────────────────────────────────────────────────
- Model: One billing account can pay for multiple client workspaces.
- DB: billing_accounts + billing_account_workspaces (see §1). RLS ensures isolation.
- Studio: Agency users switch workspaces and see aggregate usage (server-computed; no cross-workspace reads without membership).

──────────────────────────────────────────────────────────────────────────────
8) Distribution, Observability, CI
──────────────────────────────────────────────────────────────────────────────
- Hosting: Vercel (3 projects: Studio, API, Embed). Edge functions where justified.
- Monorepo: pnpm; packages include studio, api, embed, design-system, shared-types, telemetry.
- CI: typecheck, unit tests, bundle size guard (≤28KB gzip for embed), lint, SQL migrations on staging, smoke tests.
- Observability (min viable): API 2xx/4xx/5xx by route; ingestion success/error; DB function exceptions (proname); deploy markers; rollup freshness.

──────────────────────────────────────────────────────────────────────────────
9) Migration & Rollback Policy
──────────────────────────────────────────────────────────────────────────────
- All DB changes land as versioned SQL migrations.
- Rollback is additive-first (views/shims) → deprecation ADR → removal after one stable release.
- DB Contract version: DB_CONTRACT_VERSION = 1 (2025-09-14); persisted in public.db_contract_version and mirrored in public.db_contract_metadata(key='contract_version').

──────────────────────────────────────────────────────────────────────────────
10) Documentation Artifacts
──────────────────────────────────────────────────────────────────────────────
- Commit sanitized schema snapshots (DDL only) under:
  documentation/db/snapshots/schema-<env>-<YYYY-MM-DD>.sql
- This TechPhases.md remains the source of truth; dumps are reference-only.