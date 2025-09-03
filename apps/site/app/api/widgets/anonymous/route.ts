import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getServerClient } from '@/lib/supabase';

// Email validation regex (simple RFC-like)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    // Check payload size limit (25KB)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 25 * 1024) {
      return NextResponse.json(
        { error: 'Payload too large' },
        { status: 413 }
      );
    }

    const body = await request.json();
    const { email, type, config } = body || {};

    // Validate required fields
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (type !== 'contact-form') {
      return NextResponse.json(
        { error: 'Invalid widget type' },
        { status: 400 }
      );
    }

    // Generate identifiers
    const publicKey = nanoid(12).toLowerCase();
    const publicId = nanoid(12).toLowerCase();

    // Prepare widget config
    const widgetConfig = {
      ...(config || {}),
      _meta: {
        created_via: 'anonymous',
        email,
        show_attribution: true,
        ...(config?._meta || {})
      }
    };

    const admin = getServerClient();

    // Create (or upsert) widget record
    const { data: widgetData, error: widgetErr } = await admin
      .from('widgets')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        name: 'Contact Form',
        type: 'contact_form',
        public_key: publicKey,
        status: 'active',
        config: widgetConfig
      })
      .select('id, public_key')
      .single();

    if (widgetErr || !widgetData) {
      console.error('Database error (widgets):', widgetErr?.message || widgetErr);
      return NextResponse.json(
        { error: 'Failed to create widget' },
        { status: 500 }
      );
    }

    // Create published instance for embed form submissions
    const { error: instanceErr } = await admin
      .from('widget_instances')
      .insert({
        workspace_id: null,
        type_id: 'contact_form',
        public_id: publicId,
        status: 'published',
        config: widgetConfig,
        allowed_domains: [],
        show_badge: true,
        created_by: '00000000-0000-0000-0000-000000000000'
      });

    if (instanceErr) {
      // Best-effort rollback of the app-level widget to avoid orphans
      try { await admin.from('widgets').delete().eq('id', widgetData.id); } catch {}
      console.error('Database error (widget_instances):', instanceErr.message || instanceErr);
      return NextResponse.json(
        { error: 'Failed to create widget instance' },
        { status: 500 }
      );
    }

    return NextResponse.json({ publicKey: widgetData.public_key, publicId });

  } catch (error: any) {
    console.error('API error:', error?.message || error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
