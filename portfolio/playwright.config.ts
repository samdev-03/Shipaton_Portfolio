import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: 'http://127.0.0.1:8787',
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
          args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--enable-unsafe-swiftshader',
          ],
        }
      : {},
  },
  webServer: {
    command: 'node server/index.mjs',
    url: 'http://127.0.0.1:8787/healthz',
    reuseExistingServer: false,
    env: {
      PORT: '8787',
      DB_PATH: './artifacts/browser-test.sqlite',
      PUBLIC_ORIGIN: 'http://127.0.0.1:8787',
      DATA_KEY: 'b'.repeat(64),
    },
  },
  reporter: [['list'], ['json', { outputFile: 'artifacts/reports/browser-results.json' }]],
});
