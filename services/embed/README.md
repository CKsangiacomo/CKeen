# services/embed
# Venice (Embed) — README

Role: Venice is the public, embeddable runtime script that renders Clickeen widgets on customer sites.  
Phase: 1 (frozen).  
Constraints: ≤ 28KB gzip bundle. No AI calls. Privacy-by-default (no PII, IP, UA, or raw URLs collected).

-------------------------------------------------------------------------------
Responsibilities (Phase 1)
-------------------------------------------------------------------------------
- Serve the dynamic loader at `/e/[publicId]` that:
  - Accepts an embed token and a publicId
  - Fetches widget config via Paris: `GET /api/cfg/[publicId]?token=et_xxx`
  - Loads and runs one runtime bundle to render widget(s)
- Emit telemetry to Paris: `POST /api/ingest` using the frozen envelope
- Support Studio preview (config override + typed event bus messaging)

Non-Responsibilities (Phase 1)
- No direct DB access or Supabase client usage
- No submissions handling (use Paris `POST /api/submissions`)
- No billing logic, auth UX, or admin UI
- No AI inference or model downloads

-------------------------------------------------------------------------------
How to Embed
-------------------------------------------------------------------------------
HTML usage (example):

    <script
      src="https://<embed-domain>/e/w_abc123?token=et_XXXX"
      async
    ></script>

Token passing (choose one):
- Querystring: `?token=et_XXXX`
- Attribute on the loader:

    <script
      data-ckeen-token="et_XXXX"
      src="https://<embed-domain>/e/w_abc123"
      async
    ></script>

Loader behavior
1) Resolve token (query or attribute).  
2) Fetch config from Paris:

       GET https://<api-domain>/api/cfg/w_abc123?token=et_XXXX

3) Load one ESM runtime bundle and call `render(...)`.  
4) On token failure: dev → red box error; prod → silent no-op.

-------------------------------------------------------------------------------
Current Repository Paths (Phase 1 reality)
-------------------------------------------------------------------------------
- Loader route (Venice):
  - `services/embed/app/api/e/[publicId]/route.ts`
- Runtime bundle (static ESM):
  - `services/embed/public/embed-bundle.js`
- TEMP ONLY (until Paris is split out):
  - Ingest lives under embed: `services/embed/app/api/ingest/route.ts`
  - After the split, move to: `services/api/app/api/ingest/route.ts`

-------------------------------------------------------------------------------
Config Fetch (Atlas → Michael via Paris)
-------------------------------------------------------------------------------
- Venice calls Paris: `GET /api/cfg/[publicId]?token=et_xxx`
- Paris read path:
  1) Vercel Edge Config (Atlas) lookup by key `atlas:cfg:{public_id}`
  2) On miss, read DB (Michael), return envelope, write-through to Atlas
- Response is a compact JSON envelope: theme, variant, publish hash, widget props (no secrets/PII)

-------------------------------------------------------------------------------
Telemetry (Venice → Paris → Phoenix)
-------------------------------------------------------------------------------
Endpoint: `POST /api/ingest` (Edge runtime)

Envelope (frozen):
- required:
  - `event_name` (string; controlled vocab)
  - `event_id` (uuid string; idempotency key)
  - `ts` (number; ms since epoch)
  - `workspace_id` (uuid string)
  - `widget_id` (uuid string)
- optional:
  - `token_id` (uuid string)
  - `cfg_version` (string)
  - `embed_version` (string)
  - `client_run_id` (uuid string)
  - `page_origin_hash` (string; sha256(origin+path))
  - `payload` (object; non-PII only)

Server-side insert pattern is documented in `documentation/Playbooks.md` (Paris → Phoenix Ingest, Option B / final). Venice must never include PII/IP/UA/raw URLs in telemetry.

-------------------------------------------------------------------------------
Submissions (Paris owns it)
-------------------------------------------------------------------------------
- Venice posts to Paris: `POST /api/submissions`
- Requirements:
  - Use the token from the loader for rate limiting (server enforces via `enforce_submission_rate_limit_by_token_v1`)
  - Store only the validated form JSON (non-PII unless explicitly part of the form feature); DB trigger fills `payload_hash`, `ts_second`
  - No IP/UA/raw URL capture in Venice

-------------------------------------------------------------------------------
Studio Preview & Event Bus (typed)
-------------------------------------------------------------------------------
- Venice supports preview overrides via:
  - `?cfg=<base64>` (Studio may inline a config for live preview)
  - `postMessage` channel for updates: message type prefix `ckeen:preview:*`
- Event bus types live in `packages/shared-types` (WidgetEventEnvelope & Studio bus)
- Widget handles should implement `update(nextCfg)` for hot updates during preview

-------------------------------------------------------------------------------
Runtime Bundle (≤ 28KB) and CI Guard
-------------------------------------------------------------------------------
- Exactly one ESM bundle is shipped (e.g., `public/embed-bundle.js`)
- Keep Venice light: no React, no large UI/runtime libs; prefer vanilla DOM or tiny helpers
- Use tree-shaking; import only Dieter’s static tokens needed for the widget(s)
- Add a CI step (e.g., size-limit) that fails if gzip size > 28KB

Forbidden in the runtime bundle (Phase 1):
- React/Preact/Vue/Solid (any VDOM lib)
- Moment.js / large date libs
- Heavy icon packs (inline only what is used)
- Client-side AI/ML or WASM model weights

-------------------------------------------------------------------------------
Local Dev Quickstart (minimum)
-------------------------------------------------------------------------------
1) Install:

       pnpm install

2) Dev server:

       pnpm --filter services/embed dev

3) Load in a test page (replace with your local dev URLs):

       <script src="http://localhost:3000/e/w_test?token=et_TEST" async></script>

4) Preview mode (optional): add `?cfg=<base64-json>` to the script src for inline config.

5) Smoke telemetry (requires ingest route present):

       curl -sS -X POST http://localhost:3000/api/ingest \
         -H 'content-type: application/json' \
         -d '{"event_name":"widget_loaded","event_id":"11111111-1111-4111-8111-111111111111","ts":1736892345123,"workspace_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","widget_id":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","payload":{"render_ms":42}}'

Expected: `{ "ok": true, "inserted": true }` first call; `{ "ok": true, "inserted": false }` on repeat with same `event_id`.

-------------------------------------------------------------------------------
Design System (Dieter) usage in Venice
-------------------------------------------------------------------------------
- Consume Dieter tokens (generated CSS variables or static maps) at build-time
- Do not ship React components in Venice; Studio uses Dieter components, Venice uses tokens/styles only

-------------------------------------------------------------------------------
Do / Don’t
-------------------------------------------------------------------------------
DO
- Keep the runtime bundle ≤ 28KB gzip and enforce via CI
- Use the tokenized config fetch path and fail safely on token errors
- Emit only the frozen telemetry envelope (no PII)
- Support Studio preview via postMessage and `update(nextCfg)`

DON’T
- Query the database or call Supabase from the client
- Store or transmit IP, UA, or raw URLs
- Add additional runtime bundles or per-widget bundles
- Introduce client-side AI/ML or heavyweight dependencies