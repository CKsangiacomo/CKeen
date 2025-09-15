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

// Re-export admin as supa for convenience in route modules
export const supa = admin;

export async function resolveWidgetIdByPublicId(publicId: string): Promise<string | null> {
  if (!supa) return null;
  const { data, error } = await supa
    .from('widget_instances')
    .select('widget_id')
    .eq('public_id', publicId)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return (data as any).widget_id ?? null;
}

/** Rate-limit via RPC (throws 'rate_limited' on exceeding). */
export async function enforceRateLimitByToken(token: string): Promise<void> {
  if (!supa) throw new Error('db_unavailable');
  const { error } = await supa.rpc('enforce_submission_rate_limit_by_token_v1', {
    p_token: token
  });
  if (error) {
    if (String(error.message).includes('rate_limited')) {
      const e: any = new Error('rate_limited');
      e.code = 'rate_limited';
      throw e;
    }
    throw new Error('rate_limit_failed');
  }
}

const PII_KEYS = new Set(['email','phone','ip','user_agent','ua','url']);
export function hasPII(v: any): boolean {
  if (!v || typeof v !== 'object') return false;
  for (const k of Object.keys(v)) {
    if (PII_KEYS.has(k.toLowerCase())) return true;
    const child = (v as any)[k];
    if (child && typeof child === 'object' && hasPII(child)) return true;
  }
  return false;
}


