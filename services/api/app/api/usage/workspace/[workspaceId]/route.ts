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

export async function GET(req: NextRequest, ctx: { params: { workspaceId: string } }) {
  const t0 = Date.now();
  if (!requireAdmin(req)) return bad(403, 'forbidden');
  if (!supa) return bad(500, 'db_unavailable');

  const workspaceId = ctx.params.workspaceId;
  const { searchParams } = new URL(req.url);
  const yyyymm = searchParams.get('yyyymm');

  const base = supa
    .from('usage_counters_monthly')
    .select('widget_id, yyyymm, count')
    .eq('workspace_id', workspaceId)
    .order('yyyymm', { ascending: false });

  const { data, error } = yyyymm
    ? await base.eq('yyyymm', Number(yyyymm))
    : await base;

  if (error) {
    log({ route: 'usage_workspace', ok: false, status: 500, reason: 'db_error', dur_ms: Date.now()-t0 });
    return bad(500, 'db_error');
  }

  log({ route: 'usage_workspace', ok: true, status: 200, dur_ms: Date.now()-t0 });
  return new Response(JSON.stringify({ ok: true, rows: data ?? [] }), withCORS({
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  }));
}


