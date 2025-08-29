export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(_req: Request, { params }: { params: { publicKey: string } }) {
  const { data, error } = await supabaseAdmin
    .from("widgets")
    .select("id, type, status, config")
    .eq("public_key", params.publicKey)
    .single();

  if (error || !data || data.status !== "active") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ widgetId: data.id, type: data.type, config: data.config });
}
