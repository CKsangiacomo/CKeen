<!-- =============================== -->
<!-- File: debugging.updated.md -->
<!-- =============================== -->

# Debugging Playbook

## General
1. Verify Node 20.x and pnpm are installed.
2. Run `pnpm install --frozen-lockfile` at repo root.
3. Confirm you are working in the correct Vercel project for the affected app.
4. Use `pnpm -r build` to ensure all packages compile before local runs.

## Studio Shell Issues

### Studio assets not loading
**Symptoms:** Builder screens are blank; console shows 404 for Studio files.  
**Checks:**
- Host serves:
  - `/vendor/studio/studio.css`
  - `/vendor/studio/studio.js`
- Verify 200 responses in DevTools → Network.
- Confirm build step was run: `pnpm --filter @ck/studio-shell build` and artifacts were copied to host `/public/vendor/studio/`.

**Fixes:**
- Rebuild Studio package and re-copy `dist/*` to the host’s `/public/vendor/studio/`.
- Redeploy the host app (push to main / trigger Vercel deployment).

---

### `studio:ready` never fires
**Symptoms:** Host code waiting on `Studio.ready()` hangs or events never appear.  
**Checks:**
- Ensure `<script src="/vendor/studio/studio.js"></script>` is included exactly once and after DOM (or use `defer`).
- Required slot IDs are present in the host DOM:
  - `#slot-templateRow` (optional: auto-hides when empty)
  - `#slot-left`
  - `#slot-center` (must contain `#centerCanvas`)
  - `#slot-right`
- From console: `await window.Studio?.ready()` — should resolve with current state.

**Fixes:**
- Load Studio script earlier (with `defer`) or call host init after `Studio.ready()`.
- Add missing slots; ensure `#centerCanvas` exists inside `#slot-center`.

---

### Theme / viewport not applying
**Symptoms:** Toggling light/dark or desktop/mobile has no visual effect.  
**Checks:**
- Preview content is nested inside **`#centerCanvas`** (not elsewhere).
- DevTools: `#centerCanvas` has classes:
  - `.studio-theme-light` or `.studio-theme-dark`
  - `.studio-viewport-desktop` or `.studio-viewport-mobile`

**Fixes:**
- Move preview container inside `#centerCanvas`.
- Ensure host did not override or remove Studio-applied classes.

---

### Mount / unmount errors
**Symptoms:** Exceptions like “Slot center already occupied” or “Cannot unmount empty slot”.  
**Why:** Studio **throws** on slot conflicts by design.  
**Fixes:**
- Always `unmount(slot)` before re-`mount(slot, el)`.
- Reuse a single root element per slot; update its children instead of remounting the slot root.

---

### Panel collapse feedback loops
**Symptoms:** Infinite toggling, UI flapping.  
**Checks:**
- Listen for `studio:panel` payload `{ side, collapsed, source }`.
- If you programmatically call `togglePanel(..., 'host')`, ignore subsequent `studio:panel` events where `source === 'host'`.

**Fixes:**
- Gate your handler on `source === 'user'` when reflecting UI state back into your store.

---

### CSS collisions (Studio vs host content)
**Symptoms:** Unexpected spacing/overflow or fonts.  
**Checks:**
- Studio avoids Shadow DOM; use **CSS containment** around host content.
- Confirm Oslo/Dieter tokens are loaded and not overridden downstream.

**Fixes:**
- Wrap host content in a container with `contain: layout style;` or similar.
- Scope host styles away from `.studio-*` classes.

---

### Asset caching / stale files
**Symptoms:** Changes to Studio don’t appear after deploy.  
**Checks:**
- Vercel cache for `/vendor/studio/*`.
- Service Worker (if any) on the host app.

**Fixes:**
- Invalidate Vercel cache or bump asset filename/version.
- Clear or update SW precache list; redeploy.

---

## Quick Console Recipes
- Await readiness:
  ```js
  await window.Studio.ready();

  # Playbook: Incident Response

- Identify failing deployment (app/site/embed)
- Check Vercel logs; validate install step uses root lockfile
- Roll back to previous green deploy if needed


# Playbook: Deployment

## Production
- Push to `main` triggers Vercel deploys (app/site/embed)
- Clear cache when lockfile or root install strategy changes

## Common Pitfalls (recently fixed)
- Frozen lockfile failures when running install from subdir (Root Directory set) → run installs at repo root with `--filter` and ensure `use-lockfile=true`.
- Missing Next routes manifest → ensure build runs in the subdir with `pnpm build` and correct Root Directory.

#### Playbook — pnpm Version Conflict (ERR_PNPM_BAD_PM_VERSION)
**Symptoms:** “Multiple versions of pnpm specified” in CI logs.  
**Fix:**  
1. Confirm root `package.json` `"packageManager"` (canonical).  
2. Remove any pnpm `version:` from workflows.  
3. Ensure deployable packages set `"engines": { "node": "20.x" }`.  
4. Re-run CI with `pnpm install --frozen-lockfile`.  
**Do Not:** Use `--no-frozen-lockfile` or pin a different pnpm in CI.

#### Playbook — Frozen Lockfile Failure
**Symptoms:** `pnpm install --frozen-lockfile` fails in CI.  
**Fix:**  
1. DO NOT bypass.  
2. Run `pnpm install` locally with the canonical pnpm, commit updated lockfile.  
3. Re-run CI.  
**Guardrail:** CI step fails if `--no-frozen-lockfile` is used.

## Paris → Phoenix Ingest (P1 canonical | Option B, final)

Scope: Phase 1 only. TechPhases.md is authoritative; this playbook block captures the execution details for the telemetry ingest endpoint (Venice → Paris → Phoenix).

### 1) DB prerequisite (Michael) — already applied
CREATE UNIQUE INDEX IF NOT EXISTS events_event_id_unique_idx
  ON public.events(event_id)
  WHERE event_id IS NOT NULL;

### 2) Endpoint contract (Paris)
- Route: POST /api/ingest
  - TEMP path (current repo): services/embed/app/api/ingest/route.ts
  - FINAL path (after Paris split): services/api/app/api/ingest/route.ts
- Runtime: Edge (Next.js)
- Auth: None (public telemetry). Envelope MUST contain no PII.
- Request body (WidgetEventEnvelope JSON)
  - required: event_name (string), event_id (uuid string), ts (ms epoch number), workspace_id (uuid), widget_id (uuid)
  - optional: token_id (uuid), cfg_version (string), embed_version (string), client_run_id (uuid), page_origin_hash (string), payload (object; non-PII only)
- Responses
  - 200 { ok: true, inserted: true }      — first insert
  - 200 { ok: true, inserted: false }     — duplicate event_id (idempotent no-op)
  - 400 { ok: false, error: 'invalid_envelope' }
  - 500 { ok: false, error: 'ingest_failed' }

### 3) Insert pattern (Option B — canonical)
INSERT INTO public.events (
  event_id, event_name, ts, workspace_id, widget_id, token_id,
  cfg_version, embed_version, client_run_id, page_origin_hash, payload
)
VALUES ($1, $2, to_timestamp($3/1000.0), $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
ON CONFLICT (event_id) DO NOTHING
RETURNING event_id;   -- NULL ⇒ duplicate (no insert)

### 4) Reference implementation (Edge/Next.js)
export const runtime = 'edge';

type Envelope = {
  event_name: string;
  event_id: string;
  ts: number;
  workspace_id: string;
  widget_id: string;
  token_id?: string;
  cfg_version?: string;
  embed_version?: string;
  client_run_id?: string;
  page_origin_hash?: string;
  payload?: unknown; // non-PII only
};

const PII_KEYS = new Set(['email','phone','ip','user_agent','ua','url']);
const hasPII = (v: any): boolean =>
  v && typeof v === 'object' &&
  Object.keys(v).some(k => PII_KEYS.has(k.toLowerCase()) || hasPII((v as any)[k]));

const isValid = (e: Envelope): boolean =>
  !!e && typeof e.event_name === 'string' && typeof e.event_id === 'string' &&
  typeof e.ts === 'number' && typeof e.workspace_id === 'string' &&
  typeof e.widget_id === 'string' && (e.payload === undefined || !hasPII(e.payload));

// NOTE: replace with your server-side DB helper
import { sql } from '../../_db';

export async function POST(req: Request) {
  try {
    const e = (await req.json()) as Envelope;
    if (!isValid(e)) {
      return Response.json({ ok: false, error: 'invalid_envelope' }, { status: 400 });
    }

    const res = await sql/* sql */`
      INSERT INTO public.events (
        event_id, event_name, ts, workspace_id, widget_id, token_id,
        cfg_version, embed_version, client_run_id, page_origin_hash, payload
      )
      VALUES (
        ${e.event_id},
        ${e.event_name},
        to_timestamp(${e.ts}/1000.0),
        ${e.workspace_id},
        ${e.widget_id},
        ${e.token_id ?? null},
        ${e.cfg_version ?? null},
        ${e.embed_version ?? null},
        ${e.client_run_id ?? null},
        ${e.page_origin_hash ?? null},
        ${e.payload ? JSON.stringify(e.payload) : null}::jsonb
      )
      ON CONFLICT (event_id) DO NOTHING
      RETURNING event_id;
    `;
    return Response.json({ ok: true, inserted: res.rowCount === 1 }, { status: 200 });
  } catch {
    // Log minimal safe markers only
    console.error('ingest_failed');
    return Response.json({ ok: false, error: 'ingest_failed' }, { status: 500 });
  }
}

### 5) Do NOT
- Do NOT use advisory locks or WHERE NOT EXISTS (removed pattern).
- Do NOT store PII, IP, UA, or raw URLs in telemetry.

### 6) Smoke tests (manual)
# first insert (should insert)
curl -sS -X POST http://localhost:3000/api/ingest \
  -H 'content-type: application/json' \
  -d '{"event_name":"widget_loaded","event_id":"8bb0a1e2-2d1d-4b22-9dc2-0a4e4a3f2f77","ts":1736892345123,"workspace_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","widget_id":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","payload":{"render_ms":42}}'
# => { "ok": true, "inserted": true }

# duplicate (same event_id; should not insert)
curl -sS -X POST http://localhost:3000/api/ingest \
  -H 'content-type: application/json' \
  -d '{"event_name":"widget_loaded","event_id":"8bb0a1e2-2d1d-4b22-9dc2-0a4e4a3f2f77","ts":1736892345123,"workspace_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","widget_id":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","payload":{}}'
# => { "ok": true, "inserted": false }

### 7) Observability (minimum)
- Count: total requests, total inserts, total duplicates.
- Error rates: 4xx/5xx per route.
- Add a deploy marker log on release.

### 8) Repo migration note
- Until services/api exists, keep the endpoint at: services/embed/app/api/ingest/route.ts.
- When Paris is split out:
  1) Move file unchanged to services/api/app/api/ingest/route.ts
  2) Fix local import paths (DB helper)
  3) Update this playbook path note