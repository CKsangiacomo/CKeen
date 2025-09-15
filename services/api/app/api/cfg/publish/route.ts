export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { requireAdmin } from '../../../../lib/admin';
import { atlasUpsertJSON, cfgKey } from '../../../../lib/atlas-admin';
import { log } from '../../../../lib/logger';
import { preflight, withCORS } from '../../../../lib/cors';

type CfgEnvelope = {
  public_id: string;
  workspace_id: string;
  widget_id: string;
  theme?: string;
  variant?: string;
  publishHash?: string;
  props?: Record<string, unknown>;
};

function bad(status: number, code: string) {
  return new Response(JSON.stringify({ ok: false, error: code }), withCORS({
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  }));
}

export function OPTIONS() { return preflight(); }

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  if (!requireAdmin(req)) {
    log({ route: 'cfg_publish', ok: false, status: 403, reason: 'forbidden', dur_ms: Date.now()-t0 });
    return bad(403, 'forbidden');
  }

  const body = await req.json().catch(() => null) as CfgEnvelope | null;
  if (!body || typeof body !== 'object') {
    log({ route: 'cfg_publish', ok: false, status: 400, reason: 'invalid_body', dur_ms: Date.now()-t0 });
    return bad(400, 'invalid_body');
  }

  if (!body.public_id || !body.workspace_id || !body.widget_id) {
    log({ route: 'cfg_publish', ok: false, status: 400, reason: 'missing_required', dur_ms: Date.now()-t0 });
    return bad(400, 'missing_required');
  }

  const PII_KEYS = new Set(['email','phone','ip','user_agent','ua','url','token','secret','apiKey','apikey','password']);
  function hasPII(v: any): boolean {
    if (!v || typeof v !== 'object') return false;
    for (const k of Object.keys(v)) {
      if (PII_KEYS.has(k.toLowerCase())) return true;
      const child = (v as any)[k];
      if (child && typeof child === 'object' && hasPII(child)) return true;
    }
    return false;
  }
  if (body.props && hasPII(body.props)) {
    log({ route: 'cfg_publish', ok: false, status: 400, reason: 'props_contains_pii', dur_ms: Date.now()-t0 });
    return bad(400, 'props_contains_pii');
  }

  try {
    await atlasUpsertJSON(cfgKey(body.public_id), {
      public_id: body.public_id,
      workspace_id: body.workspace_id,
      widget_id: body.widget_id,
      theme: body.theme ?? 'light',
      variant: body.variant ?? 'default',
      publishHash: body.publishHash ?? 'v1',
      props: body.props ?? {}
    });
  } catch {
    log({ route: 'cfg_publish', ok: false, status: 502, reason: 'atlas_upsert_failed', dur_ms: Date.now()-t0 });
    return bad(502, 'atlas_upsert_failed');
  }

  log({ route: 'cfg_publish', ok: true, status: 200, publicId: body.public_id, dur_ms: Date.now()-t0 });
  return new Response(JSON.stringify({ ok: true }), withCORS({
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  }));
}


