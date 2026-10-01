import { defineConfig, devices } from '@playwright/test';

/**
 * E2E tests run against the production build (`vite preview`).
 * Set PW_CHROME_PATH to use an already-installed Chrome/Chromium instead of
 * `npx playwright install chromium`.
 */
const executablePath = process.env.PW_CHROME_PATH || undefined;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    acceptDownloads: true,
    launchOptions: { executablePath, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] },
  },
  webServer: { command: 'npm run build && npm run preview -- --port 4173 --strictPort', port: 4173, reuseExistingServer: true, timeout: 240_000 },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1600, height: 950 } } }],
});
