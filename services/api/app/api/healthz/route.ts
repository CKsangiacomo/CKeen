export const runtime = 'nodejs';
import { withCORS, preflight } from '../../../lib/cors';

export function OPTIONS() { return preflight(); }
export function GET() {
  return new Response(JSON.stringify({ ok: true }), withCORS({
    status: 200, headers: { 'content-type': 'application/json; charset=utf-8' }
  }));
}


