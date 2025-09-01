export const runtime = 'edge';

export async function POST(req: Request, { params }: { params: { publicId: string }}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) {
    return new Response(JSON.stringify({ ok:false, error:'missing_supabase_env' }), { status: 500, headers: { 'content-type':'application/json' }});
  }

  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type':'application/json' };
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim();
  const ua = req.headers.get('user-agent') || '';
  const body = await req.json().catch(()=> ({}));

  // 1) Look up published widget by publicId
  const wiRes = await fetch(`${url}/rest/v1/widget_instances?public_id=eq.${params.publicId}&select=id,status&limit=1`, { headers });
  const wiJson = await wiRes.json().catch(()=>[]);
  const wi = wiJson?.[0];
  if (!wi || wi.status !== 'published') {
    return new Response(JSON.stringify({ ok:false, error:'widget_not_published' }), { status: 400, headers: { 'content-type':'application/json' }});
  }

  // 2) Insert submission (widget_instance_id only for V0)
  const insertRes = await fetch(`${url}/rest/v1/form_submissions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ widget_instance_id: wi.id, payload: body, ip, ua })
  });

  if (!insertRes.ok) {
    const t = await insertRes.text();
    return new Response(JSON.stringify({ ok:false, error:'db_insert_failed', detail: t }), { status: 500, headers: { 'content-type':'application/json' }});
  }

  return new Response(JSON.stringify({ ok:true }), { headers: { 'content-type':'application/json' }});
}
