import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Email validation regex (simple RFC-like)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CreateAnonBody = {
  email: string;
  type: 'contact-form';
  config?: Record<string, unknown>;
};

type CreateWidgetWithInstanceResult = { public_key: string; public_id: string } | { publicKey: string; publicId: string };

export async function POST(request: NextRequest) {
  try {
    // Check payload size limit (25KB)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 25 * 1024) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    // Parse and validate body
    let body: CreateAnonBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const { email, type, config } = body || {} as CreateAnonBody;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (type !== 'contact-form') {
      return NextResponse.json({ error: 'Invalid widget type' }, { status: 400 });
    }

    // Use EMBED DB client (service role) to invoke RPC
    const embedUrl = process.env.EMBED_SUPABASE_URL;
    const embedSrv = process.env.EMBED_SUPABASE_SERVICE_ROLE_KEY;
    if (!embedUrl || !embedSrv) {
      console.error('Missing EMBED Supabase envs');
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    const embed = createClient(embedUrl, embedSrv, { auth: { persistSession: false } });

    // Invoke RPC to create widget and its published instance atomically
    const { data, error } = await embed
      .rpc('create_widget_with_instance', {
        p_name: 'Anonymous Widget',
        p_config: (config as Record<string, unknown>) || {}
      });

    if (error) {
      console.error('RPC error (create_widget_with_instance):', error.message || error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // RPC may return a single row or an array of rows
    const row: any = Array.isArray(data) ? data[0] : data;
    if (!row) {
      console.error('RPC returned no rows');
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    const publicKey = row.public_key || row.publicKey;
    const publicId = row.public_id || row.publicId;
    if (!publicKey || !publicId) {
      console.error('RPC missing fields:', row);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ publicKey, publicId });

  } catch (error: any) {
    console.error('API error:', error?.message || error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
