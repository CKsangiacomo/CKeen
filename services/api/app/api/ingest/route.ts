export const runtime = 'nodejs';
export async function POST(req: Request) {
  const evt = await req.json().catch(()=> ({}));
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
}
