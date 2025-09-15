import { get } from '@vercel/edge-config';

/**
 * Read-only Atlas (Edge Config) helpers.
 * NOTE: write-through is NOT implemented here (Edge runtime). Writes will be handled
 * by a Node runtime route in a later PR (publish/rotate).
 */
export async function atlasGet<T = unknown>(key: string): Promise<T | null> {
  try {
    const val = await get<T>(key);
    return (val as T) ?? null;
  } catch {
    // Swallow read errors to avoid 5xx on cfg path; caller decides fallback.
    return null;
  }
}

/** Standard key builder for widget cfg by public_id. */
export function atlasCfgKey(publicId: string) {
  return `atlas:cfg:${publicId}`;
}


