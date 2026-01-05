import { test, expect } from '@playwright/test';

import { waitForAppReady } from './helpers/wait-for-app.js';

test('voice connect stub', async ({ page }) => {
  // Set feature flags before page loads (for E2E tests)
  await page.addInitScript(() => {
    (window as any).__featureFlags = {
      VOICE_ENABLED: true,
      WHITEBOARD_ENABLED: false,
      AI_ENABLED: false,
      XR_ENABLED: false,
      MULTIPLAYER_ENABLED: true,
      AMBIENT_AUDIO_ENABLED: false,
      CMS_PROVIDER: 'local',
      TEMPLATE_ID: 'watt-default',
    };
  });

  await page.goto('http://localhost:5173?room=voice-test');
  await waitForAppReady(page);

  // Wait for HUD to render with voice toggle button
  await page.waitForSelector('[data-testid="voice-toggle"]', { timeout: 10000 });

  // Click voice toggle button
  await page.click('[data-testid="voice-toggle"]');

  // Wait for voice panel to appear
  await expect(page.locator('[data-testid="voice-panel"]')).toBeVisible();

  // Check if Join button is visible (stub mode)
  const joinButton = page.locator('text=Join Voice Room');
  await expect(joinButton).toBeVisible();

  // In stub mode, clicking Join might fail gracefully
  // This is expected behavior when VITE_LIVEKIT_URL is not set
  // The test verifies the UI is functional, not the actual connection
});
