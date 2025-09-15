export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { atlasCfgKey, atlasGet } from '../../../../lib/atlas';
import { getTokenIdFromString } from '../../../../lib/db';

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
  return new Response(JSON.stringify(json), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${cacheSeconds}`,
    }
  });
}

function err(status: number, code: string) {
  return new Response(JSON.stringify({ ok: false, error: code }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

export async function GET(req: NextRequest, ctx: { params: { publicId: string } }) {
  const publicId = ctx.params.publicId;
  const url = new URL(req.url);
  const token = url.searchParams.get('token') ?? '';

  if (!token) return err(401, 'missing_token');

  const tokenId = await getTokenIdFromString(token);
  if (!tokenId) return err(403, 'invalid_or_expired_token');

  const key = atlasCfgKey(publicId);
  const fromAtlas = await atlasGet<CfgEnvelope>(key);
  if (fromAtlas) {
    return ok(fromAtlas, 300);
  }

  const legacy = loadLegacyCfg(publicId);
  return ok(legacy, 0);
}
