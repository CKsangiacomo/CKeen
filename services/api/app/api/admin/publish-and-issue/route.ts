export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { requireAdmin } from '../../../../lib/admin';
import { admin as supa } from '../../../../lib/db';
import { atlasUpsertJSON, cfgKey } from '../../../../lib/atlas-admin';
import { log } from '../../../../lib/logger';
import { preflight, withCORS } from '../../../../lib/cors';

type Body = {
  public_id: string;
  ttl_minutes?: number;
  theme?: string;
  variant?: string;
  publishHash?: string;
  props?: Record<string, unknown>;
};

const PII_KEYS = new Set(['email','phone','ip','user_agent','ua','url','token','secret','apikey','apiKey','password']);

function bad(status: number, code: string) {
  return new Response(JSON.stringify({ ok: false, error: code }), withCORS({
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  }));
}

function hasPII(v: any): boolean {
  if (!v || typeof v !== 'object') return false;
  for (const k of Object.keys(v)) {
    if (PII_KEYS.has(k.toLowerCase())) return true;
    const child = (v as any)[k];
    if (child && typeof child === 'object' && hasPII(child)) return true;
  }
  return false;
}

export function OPTIONS() { return preflight(); }

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  if (!requireAdmin(req)) return bad(403, 'forbidden');
  if (!supa) return bad(500, 'db_unavailable');

  const body = await req.json().catch(() => null) as Body | null;
  if (!body || typeof body !== 'object' || !body.public_id) {
    log({ route: 'admin_publish_issue', ok: false, status: 400, reason: 'invalid_input', dur_ms: Date.now()-t0 });
    return bad(400, 'invalid_input');
  }
  if (body.props && hasPII(body.props)) {
    log({ route: 'admin_publish_issue', ok: false, status: 400, reason: 'props_contains_pii', dur_ms: Date.now()-t0 });
    return bad(400, 'props_contains_pii');
  }

  const wi = await supa.from('widget_instances')
    .select('id, workspace_id')
    .eq('public_id', body.public_id)
    .limit(1)
    .maybeSingle();

  if (wi.error) {
    log({ route: 'admin_publish_issue', ok: false, status: 500, reason: 'lookup_error', dur_ms: Date.now()-t0 });
    return bad(500, 'lookup_error');
  }
  if (!wi.data) {
    log({ route: 'admin_publish_issue', ok: false, status: 404, reason: 'public_id_not_found', dur_ms: Date.now()-t0 });
    return bad(404, 'public_id_not_found');
  }

  const widget_instance_id = (wi.data as any).id as string;
  const workspace_id = (wi.data as any).workspace_id as string;

  const envelope = {
    public_id: body.public_id,
    workspace_id,
    widget_id: widget_instance_id,
    theme: body.theme ?? 'light',
    variant: body.variant ?? 'default',
    publishHash: body.publishHash ?? 'p1',
    props: body.props ?? {}
  };

  try {
    await atlasUpsertJSON(cfgKey(body.public_id), envelope);
  } catch {
    log({ route: 'admin_publish_issue', ok: false, status: 502, reason: 'atlas_upsert_failed', dur_ms: Date.now()-t0 });
    return bad(502, 'atlas_upsert_failed');
  }

  const ttl = Number.isFinite(body.ttl_minutes) ? Number(body.ttl_minutes) : 60 * 24;
  const { data, error } = await supa.rpc('issue_embed_token_for_public_id_v1', {
    p_public_id: body.public_id,
    p_ttl_minutes: ttl,
    p_created_by: null
  });

  if (error) {
    log({ route: 'admin_publish_issue', ok: false, status: 500, reason: 'issue_token_failed', dur_ms: Date.now()-t0 });
    return bad(500, 'issue_token_failed');
  }

  log({ route: 'admin_publish_issue', ok: true, status: 200, dur_ms: Date.now()-t0 });
  return new Response(JSON.stringify({
    ok: true,
    cfg_published: true,
    token: (data as any)?.token ?? null,
    token_id: (data as any)?.id ?? null,
    expires_at: (data as any)?.expires_at ?? null,
    envelope
  }), withCORS({ status: 200, headers: { 'content-type': 'application/json; charset=utf-8' } }));
}


