import { atlasCfgKey } from './atlas';

const VC_API = 'https://api.vercel.com';

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`missing_env_${name}`);
  return v;
}

/**
 * Upsert a JSON value at Edge Config key (Node runtime).
 * Uses Vercel REST: PATCH /v1/edge-config/{id}/items with { operations: [{ op:'upsert', key, value }] }.
 */
export async function atlasUpsertJSON(key: string, value: unknown): Promise<void> {
  const id = mustEnv('EDGE_CONFIG_ID');
  const token = mustEnv('VERCEL_API_TOKEN');

  const res = await fetch(`${VC_API}/v1/edge-config/${id}/items`, {
    method: 'PATCH',
    headers: {
      'authorization': `Bearer ${token}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      items: undefined, // older API path compatibility
      operations: [{ op: 'upsert', key, value }]
    })
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`edge_config_upsert_failed_${res.status}:${txt.slice(0,120)}`);
  }
}

export function cfgKey(publicId: string) {
  return atlasCfgKey(publicId);
}


