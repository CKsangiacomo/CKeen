export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { requireAdmin } from '../../../../../lib/admin';
import { admin as supa } from '../../../../../lib/db';
import { preflight, withCORS } from '../../../../../lib/cors';
import { log } from '../../../../../lib/logger';

function bad(status: number, code: string) {
  return new Response(JSON.stringify({ ok: false, error: code }), withCORS({
    status, headers: { 'content-type': 'application/json; charset=utf-8' }
  }));
}

export function OPTIONS() { return preflight(); }

export async function GET(req: NextRequest, ctx: { params: { workspaceId: string } }) {
  if (!requireAdmin(req)) return bad(403, 'forbidden');
  if (!supa) return bad(500, 'db_unavailable');
  const t0 = Date.now();
  const wid = ctx.params.workspaceId;

  const wi = await supa.from('widget_instances')
    .select('id, public_id, created_at')
    .eq('workspace_id', wid)
    .order('created_at', { ascending: false });

  if (wi.error) return bad(500, 'instances_query_error');
  const instanceIds = (wi.data || []).map((r: any) => r.id);
  if (!instanceIds.length) {
    return new Response(JSON.stringify({ ok: true, widgets: [] }), withCORS({
      status: 200, headers: { 'content-type': 'application/json; charset=utf-8' }
    }));
  }

  const toks = await supa.from('embed_tokens')
    .select('id, token, expires_at, created_at, rotated_at, widget_instance_id')
    .in('widget_instance_id', instanceIds)
    .order('created_at', { ascending: false });

  if (toks.error) return bad(500, 'tokens_query_error');

  const byInstance: Record<string, any[]> = {};
  for (const t of (toks.data || [])) {
    (byInstance[(t as any).widget_instance_id] = byInstance[(t as any).widget_instance_id] || []).push(t);
  }

  const rows = (wi.data || []).map((w: any) => ({
    id: w.id,
    public_id: w.public_id,
    created_at: w.created_at,
    tokens: byInstance[w.id] || []
  }));

  log({ route: 'admin_widgets', ok: true, status: 200, count: rows.length, dur_ms: Date.now()-t0 });
  return new Response(JSON.stringify({ ok: true, widgets: rows }), withCORS({
    status: 200, headers: { 'content-type': 'application/json; charset=utf-8' }
  }));
}


