import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const url = process.env.EMBED_SUPABASE_URL;
    const key = process.env.EMBED_SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.error('Missing EMBED_SUPABASE_URL or EMBED_SUPABASE_SERVICE_ROLE_KEY');
      return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
    const supabase = createClient(url, key, { auth: { persistSession: false } });

    const body = await req.json().catch(() => ({}));
    const cfg = body?.config ?? {};

    const { data, error } = await supabase.rpc('create_widget_with_instance', {
      p_name: 'Anonymous Widget',
      p_config: cfg
    });

    if (error) {
      console.error('RPC error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }

    const row: any = Array.isArray(data) ? data[0] : data;
    return Response.json({
      publicKey: row?.public_key,
      publicId: row?.public_id
    });
  } catch (e) {
    console.error('Anon create failed:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
