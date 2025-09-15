export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { atlasCfgKey, atlasGet } from '../../../../lib/atlas';
import { getTokenIdFromString } from '../../../../lib/db';
import { log, markDeploy } from '../../../../lib/logger';
import { preflight, withCORS } from '../../../../lib/cors';

markDeploy('cfg');

type CfgEnvelope = Record<string, unknown>;

function loadLegacyCfg(publicId: string): CfgEnvelope {
  return {
    public_id: publicId,
    theme: 'light',
    variant: 'default',
    publishHash: 'legacy-stub',
    props: {}
  };
}

function ok(json: unknown, cacheSeconds: number) {
  return new Response(JSON.stringify(json), withCORS({
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=0, s-maxage=${cacheSeconds}`,
    }
  }));
}

function err(status: number, code: string) {
  return new Response(JSON.stringify({ ok: false, error: code }), withCORS({
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  }));
}

export function OPTIONS() { return preflight(); }

export async function GET(req: NextRequest, ctx: { params: { publicId: string } }) {
  const t0 = Date.now();
  const publicId = ctx.params.publicId;
  const url = new URL(req.url);
  const token = url.searchParams.get('token') ?? '';

  if (!token) { log({ route: 'cfg', ok: false, status: 401, reason: 'missing_token', publicId, dur_ms: Date.now()-t0 }); return err(401, 'missing_token'); }

  const tokenId = await getTokenIdFromString(token);
  if (!tokenId) { log({ route: 'cfg', ok: false, status: 403, reason: 'invalid_or_expired_token', publicId, dur_ms: Date.now()-t0 }); return err(403, 'invalid_or_expired_token'); }

  const key = atlasCfgKey(publicId);
  const fromAtlas = await atlasGet<CfgEnvelope>(key);
  if (fromAtlas) {
    log({ route: 'cfg', ok: true, status: 200, source: 'atlas', publicId, dur_ms: Date.now()-t0 });
    return ok(fromAtlas, 300);
  }

  const legacy = loadLegacyCfg(publicId);
  log({ route: 'cfg', ok: true, status: 200, source: 'legacy', publicId, dur_ms: Date.now()-t0 });
  return ok(legacy, 0);
}
