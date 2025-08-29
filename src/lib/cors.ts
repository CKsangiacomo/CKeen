import { NextResponse } from "next/server";

const ALLOW_ORIGIN = "*"; // for now; later we can restrict to specific domains if needed

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": ALLOW_ORIGIN,
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "600",
};

export function withCORS<T>(res: NextResponse<T>) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

export function corsOptions() {
  return withCORS(new NextResponse(null, { status: 204 }));
}
