import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60000, // 60 Sekunden Standard-Timeout pro Test
  expect: {
    timeout: 10000, // 10 Sekunden für Assertions
  },
  // Global Setup für Heartbeat-Logging
  globalSetup: undefined, // Kann später für Setup verwendet werden
  reporter: [
    ['html'],
    ['list', { printSteps: true }], // List-Reporter mit detaillierten Steps
    ['json', { outputFile: 'test-results/results.json' }], // JSON für bessere Parsing
    ...(process.env.CI ? [['github']] : []), // GitHub Actions Reporter in CI
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 Minuten für Server-Start
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
