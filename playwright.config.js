import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const localChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath =
  process.env.PLAYWRIGHT_CHROME_PATH || (existsSync(localChrome) ? localChrome : undefined);

export default defineConfig({
  testDir: './tests/browser',
  timeout: 30000,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    launchOptions: { executablePath },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
  },
});
