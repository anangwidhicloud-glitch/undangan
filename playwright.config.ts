import { randomBytes } from 'node:crypto';

import { defineConfig, devices } from '@playwright/test';

const e2eAdminEmail =
  process.env.E2E_ADMIN_EMAIL ??
  `e2e-${randomBytes(6).toString('hex')}@example.invalid`;
const e2eAdminPassword =
  process.env.E2E_ADMIN_PASSWORD ?? randomBytes(24).toString('base64url');
const e2eSessionSecret =
  process.env.E2E_ADMIN_SESSION_SECRET ?? randomBytes(48).toString('base64url');

export default defineConfig({
  testDir: './tests/e2e',
  metadata: { e2eAdminEmail, e2eAdminPassword },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  webServer: {
    command: 'npm run start -- --hostname 127.0.0.1',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    env: {
      ADMIN_EMAIL: e2eAdminEmail,
      ADMIN_PASSWORD: e2eAdminPassword,
      ADMIN_SESSION_SECRET: e2eSessionSecret,
      NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3000',
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
