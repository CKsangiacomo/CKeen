export const corsHeaders: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type,x-ckeen-admin',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-max-age': '86400'
};

export function preflight(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export function withCORS(init: ResponseInit = {}): ResponseInit {
  const headers = new Headers(init.headers || {});
  for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v);
  return { ...init, headers };
}


