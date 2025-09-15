export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { admin as supa } from '../../../lib/db';

type Envelope = {
  event_name: string;
  event_id: string;
  ts: number;
  workspace_id: string;
  widget_id: string;
  token_id?: string | null;
  cfg_version?: string | null;
  embed_version?: string | null;
  client_run_id?: string | null;
  page_origin_hash?: string | null;
  payload?: unknown;
};

const PII_KEYS = new Set(['email','phone','ip','user_agent','ua','url']);
function hasPII(v: any): boolean {
  if (!v || typeof v !== 'object') return false;
  for (const k of Object.keys(v)) {
    if (PII_KEYS.has(k.toLowerCase())) return true;
    const child = (v as any)[k];
    if (child && typeof child === 'object' && hasPII(child)) return true;
  }
  return false;
}

function isValid(e: any): e is Envelope {
  return !!e &&
    typeof e.event_name === 'string' &&
    typeof e.event_id === 'string' &&
    typeof e.ts === 'number' &&
    typeof e.workspace_id === 'string' &&
    typeof e.widget_id === 'string' &&
    (e.payload === undefined || !hasPII(e.payload));
}

function bad(status: number, code: string) {
  return new Response(JSON.stringify({ ok: false, error: code }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

export async function POST(req: NextRequest) {
  try {
    const e = (await req.json().catch(() => null)) as Envelope | null;
    if (!isValid(e)) {
      return bad(400, 'invalid_envelope');
    }
    if (!supa) {
      return bad(500, 'db_unavailable');
    }

    const { data, error } = await supa.rpc('ingest_event_v1', {
      p_event_id: e.event_id,
      p_event_name: e.event_name,
      p_ts_millis: Math.floor(e.ts),
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
      return bad(500, 'ingest_failed');
    }

    const inserted = Boolean(data);
    return new Response(JSON.stringify({ ok: true, inserted }), {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  } catch {
    return bad(500, 'ingest_failed');
  }
}
