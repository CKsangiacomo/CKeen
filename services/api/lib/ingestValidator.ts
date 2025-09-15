export type Envelope = {
  event_name: string;
  event_id?: string | null;
  ts?: number | null;
  workspace_id: string;
  widget_id: string;
  token_id?: string | null;
  cfg_version?: string | null;
  embed_version?: string | null;
  client_run_id?: string | null;
  page_origin_hash?: string | null;
  payload?: unknown;
};

function isString(x: any) { return typeof x === 'string' && x.length > 0; }
function isOptString(x: any) { return x == null || typeof x === 'string'; }
function isOptNumber(x: any) { return x == null || (typeof x === 'number' && Number.isFinite(x)); }

export function validateEnvelope(e: any): e is Envelope {
  if (!e || typeof e !== 'object') return false;
  if (!isString(e.event_name)) return false;
  if (!isString(e.workspace_id)) return false;
  if (!isString(e.widget_id)) return false;

  if (!isOptString(e.event_id)) return false;
  if (!isOptNumber(e.ts)) return false;
  if (!isOptString(e.token_id)) return false;
  if (!isOptString(e.cfg_version)) return false;
  if (!isOptString(e.embed_version)) return false;
  if (!isOptString(e.client_run_id)) return false;
  if (!isOptString(e.page_origin_hash)) return false;

  const t = typeof e.payload;
  if (!(e.payload == null || t === 'object' || t === 'string' || t === 'number' || t === 'boolean')) return false;

  const PII = new Set(['email','phone','ip','user_agent','ua','url','token','secret','apikey','apiKey','password']);
  if (e.payload && typeof e.payload === 'object') {
    for (const k of Object.keys(e.payload as any)) {
      if (PII.has(k.toLowerCase())) return false;
    }
  }

  const allowed = new Set([
    'event_name','event_id','ts','workspace_id','widget_id','token_id',
    'cfg_version','embed_version','client_run_id','page_origin_hash','payload'
  ]);
  for (const k of Object.keys(e)) {
    if (!allowed.has(k)) return false;
  }
  return true;
}


