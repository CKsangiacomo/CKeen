import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    const supabase = createClient(url, key, { auth: { persistSession: false } });

    const body = await req.json().catch(() => ({} as any));
    const email: string = body?.email || '';
    const type: string = body?.type || 'contact-form';
    const config = (body?.config ?? {}) as Record<string, unknown>;

    const publicKey = nanoid(12).toLowerCase();
    const publicId = nanoid(12).toLowerCase();

    const { data, error } = await supabase.rpc('create_widget_with_instance', {
      p_name: `Anonymous Widget - ${email}`,
      p_type: type,
      p_public_key: publicKey,
      p_public_id: publicId,
      p_widget_config: config,
      p_instance_config: config,
    });

    if (error) {
      console.error('RPC error:', error.message || error);
      return NextResponse.json({ error: 'Internal server error', detail: error.message }, { status: 500 });
    }

    const row: any = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({
      publicKey: row?.public_key,
      publicId: row?.public_id
    });
  } catch (e) {
    console.error('Anon create failed:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
