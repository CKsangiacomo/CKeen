import { NextRequest, NextResponse } from "next/server";
import { withCORS, corsOptions } from "@/lib/cors";
import { supabaseAdmin } from "@/lib/supabase";
export const runtime = "nodejs";

export async function OPTIONS() { return corsOptions(); }

export async function POST(req: NextRequest) {
  let body: { publicKey?: string; type?: "impression" | "click" | "submission"; meta?: Record<string, unknown> };
  try { body = await req.json(); } catch { return withCORS(NextResponse.json({ error: "Invalid JSON" }, { status: 400 })); }

  const { publicKey, type, meta } = body || {};
  if (!publicKey || !type) return withCORS(NextResponse.json({ error: "publicKey and type required" }, { status: 400 }));

  const { data: widget, error: werr } = await supabaseAdmin
    .from("widgets")
    .select("id,status")
    .eq("public_key", publicKey)
    .single();
  if (werr || !widget || widget.status !== "active") return withCORS(NextResponse.json({ error: "Widget not found or inactive" }, { status: 404 }));

  const { error } = await supabaseAdmin.from("widget_events").insert([{ widget_id: widget.id, type, meta: meta ?? {} }]);
  if (error) return withCORS(NextResponse.json({ error: error.message }, { status: 400 }));

  return withCORS(new NextResponse(null, { status: 204 }));
}
