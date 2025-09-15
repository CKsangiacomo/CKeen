export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { requireAdmin } from '../../../../../lib/admin';
import { atlasCfgKey, atlasGet } from '../../../../../lib/atlas';
import { log } from '../../../../../lib/logger';
import { preflight, withCORS } from '../../../../../lib/cors';

function bad(status: number, code: string) {
  return new Response(JSON.stringify({ ok: false, error: code }), withCORS({
    status, headers: { 'content-type': 'application/json; charset=utf-8' }
  }));
}

export function OPTIONS() { return preflight(); }

export async function GET(req: NextRequest, ctx: { params: { publicId: string } }) {
  if (!requireAdmin(req)) return bad(403, 'forbidden');
  const t0 = Date.now();
  try {
    const key = atlasCfgKey(ctx.params.publicId);
    const cfg = await atlasGet(key);
    log({ route: 'admin_cfg_get', ok: true, status: 200, found: !!cfg, dur_ms: Date.now()-t0 });
    return new Response(JSON.stringify({ ok: true, cfg: cfg ?? null }), withCORS({
      status: 200, headers: { 'content-type': 'application/json; charset=utf-8' }
    }));
  } catch {
    return bad(502, 'atlas_read_failed');
  }
}


