import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ publicKey: string }> }
) {
  const { publicKey } = await ctx.params;
  const { data, error } = await supabaseAdmin
    .from("widgets")
    .select("id, type, status, config")
    .eq("public_key", publicKey)
    .single();

  if (error || !data || data.status !== "active") {
    return NextResponse.json({ error: "Widget not found or inactive" }, { status: 404 });
  }
  return NextResponse.json({ widgetId: data.id, type: data.type, config: data.config });
}
