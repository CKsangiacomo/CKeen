export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  let body: { publicKey?: string; payload?: Record<string, unknown> };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { publicKey, payload } = body || {};
  if (!publicKey || !payload) return NextResponse.json({ error: "publicKey and payload required" }, { status: 400 });

  const { data: widget, error: werr } = await supabaseAdmin
    .from("widgets")
    .select("id,status")
    .eq("public_key", publicKey)
    .single();
  if (werr || !widget || widget.status !== "active") return NextResponse.json({ error: "Widget not found or inactive" }, { status: 404 });

  const { error: serr } = await supabaseAdmin.from("widget_submissions").insert([{ widget_id: widget.id, payload }]);
  if (serr) return NextResponse.json({ error: serr.message }, { status: 400 });

  await supabaseAdmin.from("widget_events").insert([{ widget_id: widget.id, type: "submission", meta: { ok: true } }]).catch(() => {});

  return NextResponse.json({ ok: true }, { status: 201 });
}
