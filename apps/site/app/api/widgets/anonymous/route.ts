import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { supabase } from '@/lib/supabase';

// Email validation regex (simple RFC-like)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Check payload size limit (25KB)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 25 * 1024) {
      return NextResponse.json(
        { error: 'Payload too large' },
        { status: 413 }
      );
    }

    const body = await request.json();
    const { email, type, config } = body;

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

    // Generate unique public ID
    const publicId = nanoid(12);

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

    // Insert widget instance
    const { data, error } = await supabase
      .from('widgets')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // Anonymous user UUID
        name: 'Contact Form',
        type: 'contact_form',
        public_key: publicId,
        status: 'active',
        config: widgetConfig
      })
      .select('public_key')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create widget' },
        { status: 500 }
      );
    }

    return NextResponse.json({ publicId: data.public_key });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
