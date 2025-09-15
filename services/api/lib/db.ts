import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  // Fail early in server env; Edge cfg route will still work without DB RPC if token is missing
  // but we intentionally require token validation in /api/cfg.
  // This ensures we don't serve cfg without a valid token.
  console.warn('[Paris/db] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE envs.');
}

export const admin = SUPABASE_URL && SUPABASE_SERVICE_ROLE
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } })
  : null;

/** Validate an embed token via Michael RPC. Returns token uuid or null. */
export async function getTokenIdFromString(token: string): Promise<string | null> {
  if (!admin) return null;
  const { data, error } = await admin.rpc('get_token_id_from_string_v1', { p_token: token });
  if (error) {
    // Do not leak details; treat as invalid.
    return null;
  }
  // RPC returns uuid or null
  return (data as string | null) ?? null;
}


