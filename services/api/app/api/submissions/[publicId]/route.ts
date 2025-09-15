export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { supa, resolveWidgetIdByPublicId, enforceRateLimitByToken, hasPII } from '../../../../lib/db';

function bad(status: number, code: string) {
  return new Response(JSON.stringify({ ok: false, error: code }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

export async function POST(req: NextRequest, ctx: { params: { publicId: string } }) {
  try {
    const publicId = ctx.params.publicId;
    if (!publicId) return bad(400, 'invalid_input');

    const body = await req.json().catch(() => null) as { token?: string; payload?: unknown } | null;
    const token = body?.token ?? null;
    const payload = body?.payload;

    if (!token || !payload || typeof payload !== 'object') {
      return bad(400, 'invalid_input');
    }
    if (hasPII(payload)) {
      return bad(400, 'invalid_input');
    }

    try {
      await enforceRateLimitByToken(token);
    } catch (e: any) {
      if (e?.code === 'rate_limited') return bad(429, 'rate_limited');
      return bad(500, 'rate_limiter_unavailable');
    }

    const widgetId = await resolveWidgetIdByPublicId(publicId);
    if (!widgetId) return bad(400, 'unknown_widget');

    if (!supa) return bad(500, 'db_unavailable');
    const { error } = await supa
      .from('widget_submissions')
      .insert([{ widget_id: widgetId, payload }]);

    if (error) {
      return bad(500, 'submission_failed');
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  } catch {
    return bad(500, 'submission_failed');
  }
}
