export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { admin as supa } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/admin';
import { log } from '../../../../lib/logger';
import { preflight, withCORS } from '../../../../lib/cors';

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
    log({ route: 'tokens_revoke', ok: false, status: 403, reason: 'forbidden', dur_ms: Date.now()-t0 });
    return bad(403, 'forbidden');
  }
  if (!supa) return bad(500, 'db_unavailable');

  const body = await req.json().catch(() => null) as { token_id?: string } | null;
  const tokenId = body?.token_id;
  if (!tokenId) {
    log({ route: 'tokens_revoke', ok: false, status: 400, reason: 'invalid_input', dur_ms: Date.now()-t0 });
    return bad(400, 'invalid_input');
  }

  const { error } = await supa.rpc('revoke_embed_token_v1', { p_token_id: tokenId });
  if (error) {
    log({ route: 'tokens_revoke', ok: false, status: 500, reason: 'rpc_error', dur_ms: Date.now()-t0 });
    return bad(500, 'revoke_failed');
  }

  log({ route: 'tokens_revoke', ok: true, status: 204, dur_ms: Date.now()-t0 });
  return new Response(null, withCORS({ status: 204 }));
}


