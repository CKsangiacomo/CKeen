/**
 * Seeds a publicId by calling the internal admin "publish+issue" endpoint,
 * then prints an HTML snippet and a demo URL that includes token.
 *
 * Usage example:
 *   DEV_API=http://localhost:3001 INTERNAL_ADMIN_KEY=... PUBLIC_ID=w_demo node scripts/dev-seed.mjs
 *
 * Required env:
 *   - DEV_API: Paris base (default http://localhost:3001)
 *   - INTERNAL_ADMIN_KEY: header secret used by Paris admin endpoints
 *   - PUBLIC_ID: the widget public_id to seed (must exist in DB)
 */
import { env } from 'node:process';

const DEV_API = env.DEV_API || 'http://localhost:3001';
const ADMIN = env.INTERNAL_ADMIN_KEY;
const PUBLIC_ID = env.PUBLIC_ID;

if (!ADMIN || !PUBLIC_ID) {
  console.error('[seed] Missing env: INTERNAL_ADMIN_KEY and/or PUBLIC_ID.');
  process.exit(1);
}

async function main() {
  const body = {
    public_id: PUBLIC_ID,
    ttl_minutes: 1440,
    theme: 'light',
    variant: 'default',
    publishHash: 'p1',
    props: { title: 'Hello from Clickeen' }
  };

  const res = await fetch(`${DEV_API}/api/admin/publish-and-issue`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-ckeen-admin': ADMIN
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    console.error(`[seed] Failed (${res.status}): ${txt}`);
    process.exit(1);
  }

  const json = await res.json();
  const token = json?.token;
  if (!token) {
    console.error('[seed] No token returned');
    process.exit(1);
  }

  const demoUrl = `/demo.html?publicId=${encodeURIComponent(PUBLIC_ID)}&token=${encodeURIComponent(token)}`;

  console.log('\n[seed] OK\n');
  console.log('Embed snippet (attribute form):\n');
  console.log(`<script src="/e/${PUBLIC_ID}" data-ckeen-token="${token}" async></script>\n`);
  console.log('Embed snippet (query param form):\n');
  console.log(`<script src="/e/${PUBLIC_ID}?token=${token}" async></script>\n`);
  console.log('Local demo page:');
  console.log(demoUrl + '\n');
}

main().catch((e) => {
  console.error('[seed] Unexpected error:', e?.message || e);
  process.exit(1);
});


