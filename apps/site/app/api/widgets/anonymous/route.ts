import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';

// Email validation regex (simple RFC-like)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CreateAnonBody = {
  email: string;
  type: 'contact-form';
  config?: Record<string, unknown>;
};

type CreateWidgetWithInstanceResult = {
  public_key: string;
  public_id: string;
};

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

    const admin = getServerClient();

    // Invoke RPC to create widget and its published instance atomically
    const { data, error } = await admin
      .rpc('create_widget_with_instance', {
        name: 'Anonymous Widget',
        config: (config as Record<string, unknown>) || {}
      });

    if (error) {
      console.error('RPC error (create_widget_with_instance):', error.message || error);
      return NextResponse.json({ error: 'Internal server error', detail: error.message }, { status: 500 });
    }

    const result = data as CreateWidgetWithInstanceResult | null;
    if (!result || !result.public_key || !result.public_id) {
      return NextResponse.json({ error: 'Internal server error', detail: 'rpc_missing_fields' }, { status: 500 });
    }

    return NextResponse.json({ publicKey: result.public_key, publicId: result.public_id });

  } catch (error: any) {
    console.error('API error:', error?.message || error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
