export const runtime = 'nodejs';
import { withCORS, preflight } from '../../../lib/cors';

const version =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.COMMIT_SHA ||
  process.env.NEXT_PUBLIC_APP_VERSION ||
  'dev';

export function OPTIONS() { return preflight(); }
export function GET() {
  return new Response(JSON.stringify({ ok: true, version }), withCORS({
    status: 200, headers: { 'content-type': 'application/json; charset=utf-8' }
  }));
}


