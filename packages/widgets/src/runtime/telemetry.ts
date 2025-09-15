/** Tiny helpers for telemetry emission (no PII). */
export async function sha256Base64(s: string): Promise<string> {
  if (typeof crypto === 'undefined' || !('subtle' in crypto)) return '';
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(s));
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function uuidv4(): string {
  const c = (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) ? crypto : null;
  if (!c) {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ch => {
      const r = Math.random() * 16 | 0;
      const v = ch === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  const a = new Uint8Array(16);
  (c as Crypto).getRandomValues(a);
  a[6] = (a[6] & 0x0f) | 0x40; // version
  a[8] = (a[8] & 0x3f) | 0x80; // variant
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `${h(a[0])}${h(a[1])}${h(a[2])}${h(a[3])}-${h(a[4])}${h(a[5])}-${h(a[6])}${h(a[7])}-${h(a[8])}${h(a[9])}-${h(a[10])}${h(a[11])}${h(a[12])}${h(a[13])}${h(a[14])}${h(a[15])}`;
}

export async function emitWidgetEvent(apiBase: string, env: {
  workspace_id?: string;
  widget_id?: string;
  cfg_version?: string;
  embed_version?: string;
}, name: string, payload?: unknown) {
  try {
    if (!env.workspace_id || !env.widget_id) return;
    const origin = typeof location !== 'undefined' ? location.origin : '';
    const path = typeof location !== 'undefined' ? location.pathname : '';
    const page_origin_hash = await sha256Base64(origin + path);

    const body = {
      event_name: name,
      event_id: uuidv4(),
      ts: Date.now(),
      workspace_id: env.workspace_id,
      widget_id: env.widget_id,
      token_id: null,
      cfg_version: env.cfg_version ?? null,
      embed_version: env.embed_version ?? null,
      client_run_id: null,
      page_origin_hash,
      payload: payload ?? null
    };

    await fetch(apiBase.replace(/\/$/, '') + '/api/ingest', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
      credentials: 'omit',
      cache: 'no-store',
    }).catch(() => {});
  } catch {
    // never throw from telemetry
  }
}


