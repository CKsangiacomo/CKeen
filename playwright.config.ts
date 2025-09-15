import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  webServer: [
    {
      command: 'node scripts/dev-serve.mjs',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  reporter: [['list']],
});


