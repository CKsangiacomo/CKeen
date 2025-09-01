export const runtime = 'edge';
export async function POST(req: Request, { params }: { params: { publicId: string }}) {
  const body = await req.json().catch(()=> ({}));
  return new Response(JSON.stringify({ ok: true, publicId: params.publicId, echo: body }), {
    headers: { 'content-type': 'application/json' }
  });
}
