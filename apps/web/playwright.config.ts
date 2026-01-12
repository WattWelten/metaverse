import { defineConfig, devices } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',
  testMatch: /^((?!manual).)*\.spec\.ts$/, // Ignoriere manual-Tests
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 90_000, // 90 Sekunden für komplexe Tests
  expect: {
    timeout: 10_000, // 10 Sekunden für Assertions
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
    baseURL: BASE,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    viewport: { width: 1400, height: 900 },
  },
  projects: [
    // Multi-Browser Desktop Tests
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Multi-Client Desktop Tests (für Multiplayer-Szenarien)
    {
      name: 'desktop-1',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'desktop-2',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'desktop-3',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile Tests
    {
      name: 'mobile-ios',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'mobile-android',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 390, height: 844 },
      },
    },
    // Legacy projects (für Kompatibilität)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 Minuten für Server-Start
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
