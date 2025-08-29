export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "node:crypto";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("widgets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  let body: { userId?: string; name?: string; type?: string; config?: Record<string, unknown> };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { userId, name, type, config } = body || {};
  if (!userId || !name || !type) return NextResponse.json({ error: "userId, name, type required" }, { status: 400 });

  const public_key = crypto.randomBytes(8).toString("hex");
  const row = { user_id: userId, name, type, public_key, config: config ?? {}, status: "active" };
  const { data, error } = await supabaseAdmin.from("widgets").insert([row]).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  let body: { userId?: string; widgetId?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { userId, widgetId } = body || {};
  if (!userId || !widgetId) return NextResponse.json({ error: "userId and widgetId required" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("widgets")
    .delete()
    .eq("user_id", userId)
    .eq("id", widgetId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  let body: { userId?: string; widgetId?: string; status?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { userId, widgetId, status } = body || {};
  if (!userId || !widgetId || !status) return NextResponse.json({ error: "userId, widgetId, and status required" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("widgets")
    .update({ status })
    .eq("user_id", userId)
    .eq("id", widgetId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
  