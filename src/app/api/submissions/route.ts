import { NextRequest, NextResponse } from "next/server";
import { withCORS, corsOptions } from "@/lib/cors";
import { supabaseAdmin } from "@/lib/supabase";
export const runtime = "nodejs";

export async function OPTIONS() { return corsOptions(); }

export async function POST(req: NextRequest) {
  let body: { publicKey?: string; payload?: Record<string, unknown> };
  try { body = await req.json(); } catch { return withCORS(NextResponse.json({ error: "Invalid JSON" }, { status: 400 })); }

  const { publicKey, payload } = body || {};
  if (!publicKey || !payload) return withCORS(NextResponse.json({ error: "publicKey and payload required" }, { status: 400 }));

  const { data: widget, error: werr } = await supabaseAdmin
    .from("widgets")
    .select("id,status")
    .eq("public_key", publicKey)
    .single();
  if (werr || !widget || widget.status !== "active") return withCORS(NextResponse.json({ error: "Widget not found or inactive" }, { status: 404 }));

  const { error: serr } = await supabaseAdmin.from("widget_submissions").insert([{ widget_id: widget.id, payload }]);
  if (serr) return withCORS(NextResponse.json({ error: serr.message }, { status: 400 }));

  // Best effort event tracking - ignore errors
  await supabaseAdmin.from("widget_events").insert([{ widget_id: widget.id, type: "submission", meta: { ok: true } }]);

  return withCORS(NextResponse.json({ ok: true }, { status: 201 }));
}
