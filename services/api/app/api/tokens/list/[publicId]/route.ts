export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { requireAdmin } from '../../../../../lib/admin';
import { admin as supa } from '../../../../../lib/db';
import { log } from '../../../../../lib/logger';
import { preflight, withCORS } from '../../../../../lib/cors';

function bad(status: number, code: string) {
  return new Response(JSON.stringify({ ok: false, error: code }), withCORS({
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  }));
}

export function OPTIONS() { return preflight(); }

export async function GET(req: NextRequest, ctx: { params: { publicId: string } }) {
  const t0 = Date.now();
  if (!requireAdmin(req)) return bad(403, 'forbidden');
  if (!supa) return bad(500, 'db_unavailable');

  const publicId = ctx.params.publicId;

  const wi = await supa.from('widget_instances')
    .select('id')
    .eq('public_id', publicId);

  if (wi.error) {
    log({ route: 'tokens_list', ok: false, status: 500, reason: 'lookup_error', dur_ms: Date.now()-t0 });
    return bad(500, 'lookup_error');
  }

  const ids = (wi.data || []).map(r => (r as any).id);
  if (!ids.length) {
    log({ route: 'tokens_list', ok: true, status: 200, found: 0, dur_ms: Date.now()-t0 });
    return new Response(JSON.stringify({ ok: true, tokens: [] }), withCORS({
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    }));
  }

  const toks = await supa.from('embed_tokens')
    .select('id, token, expires_at, created_at, rotated_at, widget_instance_id')
    .in('widget_instance_id', ids)
    .order('created_at', { ascending: false });

  if (toks.error) {
    log({ route: 'tokens_list', ok: false, status: 500, reason: 'tokens_query_error', dur_ms: Date.now()-t0 });
    return bad(500, 'tokens_query_error');
  }

  log({ route: 'tokens_list', ok: true, status: 200, found: (toks.data || []).length, dur_ms: Date.now()-t0 });
  return new Response(JSON.stringify({ ok: true, tokens: toks.data || [] }), withCORS({
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  }));
}


