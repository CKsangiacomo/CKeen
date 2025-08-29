export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  let body: { publicKey?: string; type?: "impression" | "click" | "submission"; meta?: Record<string, unknown> };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { publicKey, type, meta } = body || {};
  if (!publicKey || !type) return NextResponse.json({ error: "publicKey and type required" }, { status: 400 });

  const { data: widget, error: werr } = await supabaseAdmin
    .from("widgets")
    .select("id,status")
    .eq("public_key", publicKey)
    .single();
  if (werr || !widget || widget.status !== "active") return NextResponse.json({ error: "Widget not found or inactive" }, { status: 404 });

  const { error } = await supabaseAdmin.from("widget_events").insert([{ widget_id: widget.id, type, meta: meta ?? {} }]);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return new NextResponse(null, { status: 204 });
}
