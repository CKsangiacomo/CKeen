export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { admin as supa } from '../../../lib/db';
import { log, markDeploy } from '../../../lib/logger';
import { preflight, withCORS } from '../../../lib/cors';
import { validateEnvelope, Envelope } from '../../../lib/ingestValidator';

markDeploy('ingest');

const MAX_BYTES = 8 * 1024; // 8KB for P1

// test-only export (tree-shaken in production bundles)
export function __validateEnvelopeForTest(e: any) { return validateEnvelope(e); }

function bad(status: number, code: string) {
  return new Response(JSON.stringify({ ok: false, error: code }), withCORS({
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  }));
}

export function OPTIONS() { return preflight(); }

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  try {
    const cl = req.headers.get('content-length');
    if (cl && Number(cl) > MAX_BYTES) {
      log({ route: 'ingest', ok: false, status: 413, reason: 'too_large', dur_ms: Date.now()-t0 });
      return new Response(JSON.stringify({ ok: false, error: 'too_large' }), withCORS({
        status: 413,
        headers: { 'content-type': 'application/json; charset=utf-8' }
      }));
    }

    const body = await req.json().catch(() => null);
    if (!validateEnvelope(body)) {
      log({ route: 'ingest', ok: false, status: 400, reason: 'invalid_envelope', dur_ms: Date.now()-t0 });
      return bad(400, 'invalid_envelope');
    }
    const e = body as Envelope;
    if (!supa) {
      log({ route: 'ingest', ok: false, status: 500, reason: 'db_unavailable', dur_ms: Date.now()-t0 });
      return bad(500, 'db_unavailable');
    }

    const { data, error } = await supa.rpc('ingest_event_v1', {
      p_event_id: e.event_id ?? null,
      p_event_name: e.event_name,
      p_ts_millis: Math.floor(e.ts ?? Date.now()),
      p_workspace_id: e.workspace_id,
      p_widget_id: e.widget_id,
      p_token_id: e.token_id ?? null,
      p_cfg_version: e.cfg_version ?? null,
      p_embed_version: e.embed_version ?? null,
      p_client_run_id: e.client_run_id ?? null,
      p_page_origin_hash: e.page_origin_hash ?? null,
      p_payload: e.payload ? (e.payload as any) : null
    });

    if (error) {
      log({ route: 'ingest', ok: false, status: 500, reason: 'rpc_error', dur_ms: Date.now()-t0 });
      return bad(500, 'ingest_failed');
    }

    const inserted = Boolean(data);
    log({ route: 'ingest', ok: true, inserted, status: 200, dur_ms: Date.now()-t0 });
    return new Response(JSON.stringify({ ok: true, inserted }), withCORS({
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    }));
  } catch {
    log({ route: 'ingest', ok: false, status: 500, reason: 'exception', dur_ms: Date.now()-t0 });
    return bad(500, 'ingest_failed');
  }
}
