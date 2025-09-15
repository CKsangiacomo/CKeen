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
    log({ route: 'tokens_rotate', ok: false, status: 403, reason: 'forbidden', dur_ms: Date.now()-t0 });
    return bad(403, 'forbidden');
  }
  if (!supa) return bad(500, 'db_unavailable');

  const body = await req.json().catch(() => null) as { token_id?: string; ttl_minutes?: number } | null;
  const tokenId = body?.token_id;
  const ttl = Number.isFinite(body?.ttl_minutes) ? Number(body!.ttl_minutes) : 60 * 24;

  if (!tokenId) {
    log({ route: 'tokens_rotate', ok: false, status: 400, reason: 'invalid_input', dur_ms: Date.now()-t0 });
    return bad(400, 'invalid_input');
  }

  const { data, error } = await supa.rpc('rotate_embed_token_v1', {
    p_token_id: tokenId,
    p_ttl_minutes: ttl
  });

  if (error) {
    log({ route: 'tokens_rotate', ok: false, status: 500, reason: 'rpc_error', dur_ms: Date.now()-t0 });
    return bad(500, 'rotate_failed');
  }

  log({ route: 'tokens_rotate', ok: true, status: 200, dur_ms: Date.now()-t0 });
  return new Response(JSON.stringify({ ok: true, token: (data as any)?.token ?? null, expires_at: (data as any)?.expires_at ?? null, rotated_at: (data as any)?.rotated_at ?? null }), withCORS({
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  }));
}


