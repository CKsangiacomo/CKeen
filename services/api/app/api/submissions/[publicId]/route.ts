export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { supa, resolveWidgetIdByPublicId, enforceRateLimitByToken, hasPII } from '../../../../lib/db';
import { log, markDeploy } from '../../../../lib/logger';
import { preflight, withCORS } from '../../../../lib/cors';

markDeploy('submissions');

function bad(status: number, code: string) {
  return new Response(JSON.stringify({ ok: false, error: code }), withCORS({
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  }));
}

export function OPTIONS() { return preflight(); }

export async function POST(req: NextRequest, ctx: { params: { publicId: string } }) {
  const t0 = Date.now();
  try {
    const publicId = ctx.params.publicId;
    if (!publicId) { log({ route: 'submissions', ok: false, status: 400, reason: 'invalid_input', dur_ms: Date.now()-t0 }); return bad(400, 'invalid_input'); }

    const body = await req.json().catch(() => null) as { token?: string; payload?: unknown } | null;
    const token = body?.token ?? null;
    const payload = body?.payload;

    if (!token || !payload || typeof payload !== 'object') { log({ route: 'submissions', ok: false, status: 400, reason: 'invalid_input', dur_ms: Date.now()-t0 }); return bad(400, 'invalid_input'); }
    if (hasPII(payload)) { log({ route: 'submissions', ok: false, status: 400, reason: 'pii_rejected', dur_ms: Date.now()-t0 }); return bad(400, 'invalid_input'); }

    try {
      await enforceRateLimitByToken(token);
    } catch (e: any) {
      if (e?.code === 'rate_limited') { log({ route: 'submissions', ok: false, status: 429, reason: 'rate_limited', dur_ms: Date.now()-t0 }); return bad(429, 'rate_limited'); }
      log({ route: 'submissions', ok: false, status: 500, reason: 'rate_limiter_unavailable', dur_ms: Date.now()-t0 });
      return bad(500, 'rate_limiter_unavailable');
    }

    const widgetId = await resolveWidgetIdByPublicId(publicId);
    if (!widgetId) { log({ route: 'submissions', ok: false, status: 400, reason: 'unknown_widget', dur_ms: Date.now()-t0 }); return bad(400, 'unknown_widget'); }

    if (!supa) { log({ route: 'submissions', ok: false, status: 500, reason: 'db_unavailable', dur_ms: Date.now()-t0 }); return bad(500, 'db_unavailable'); }
    const { error } = await supa
      .from('widget_submissions')
      .insert([{ widget_id: widgetId, payload }]);

    if (error) { log({ route: 'submissions', ok: false, status: 500, reason: 'db_insert_failed', dur_ms: Date.now()-t0 }); return bad(500, 'submission_failed'); }

    log({ route: 'submissions', ok: true, status: 200, dur_ms: Date.now()-t0 });
    return new Response(JSON.stringify({ ok: true }), withCORS({
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    }));
  } catch {
    log({ route: 'submissions', ok: false, status: 500, reason: 'exception', dur_ms: Date.now()-t0 });
    return bad(500, 'submission_failed');
  }
}
