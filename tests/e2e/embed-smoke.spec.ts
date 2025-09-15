import { test, expect } from '@playwright/test';

const DEMO_PUBLIC_ID = process.env.PUBLIC_ID || 'w_demo';
const ADMIN = process.env.INTERNAL_ADMIN_KEY!;
const PARIS = process.env.DEV_API || 'http://localhost:3001';

test('embed renders, cfg is from atlas, widget_loaded ingested, monthly usage increments', async ({ page, request }) => {
  test.skip(!ADMIN, 'INTERNAL_ADMIN_KEY required');

  const seedBody = {
    public_id: DEMO_PUBLIC_ID,
    ttl_minutes: 60,
    theme: 'light',
    variant: 'default',
    publishHash: 'p1',
    props: { title: 'E2E Demo' }
  };
  const seedRes = await request.post(`${PARIS}/api/admin/publish-and-issue`, {
    headers: { 'content-type': 'application/json', 'x-ckeen-admin': ADMIN },
    data: seedBody
  });
  expect(seedRes.ok()).toBeTruthy();
  const seed = await seedRes.json();
  expect(seed.ok).toBeTruthy();
  const token: string = seed.token;
  const workspaceId: string = seed.envelope.workspace_id;
  const widgetId: string = seed.envelope.widget_id;

  await page.goto(`/demo.html?publicId=${DEMO_PUBLIC_ID}&token=${token}`);

  await expect(page.locator('[data-ckeen="contact-form"]')).toBeVisible();
  await expect(page.locator('[data-ckeen="contact-form"] div')).toContainText('E2E Demo');

  const y = new Date().getUTCFullYear();
  const m = new Date().getUTCMonth() + 1;
  const yyyymm = y * 100 + m;

  let count = 0, tries = 0;
  while (tries++ < 20 && count === 0) {
    const usageRes = await request.get(`${PARIS}/api/usage/workspace/${workspaceId}?yyyymm=${yyyymm}`, {
      headers: { 'x-ckeen-admin': ADMIN }
    });
    expect(usageRes.ok()).toBeTruthy();
    const json = await usageRes.json();
    const row = (json.rows || []).find((r: any) => r.widget_id === widgetId);
    count = row?.count || 0;
    if (count > 0) break;
    await new Promise(r => setTimeout(r, 500));
  }
  expect(count).toBeGreaterThan(0);
});


