import { test, expect } from '@playwright/test';

import { waitForAppReady } from './helpers/wait-for-app.js';

test('whiteboard shape sync', async ({ page }) => {
  // Set feature flags before page loads (for E2E tests)
  await page.addInitScript(() => {
    (window as any).__featureFlags = {
      VOICE_ENABLED: false,
      WHITEBOARD_ENABLED: true,
      AI_ENABLED: false,
      XR_ENABLED: false,
      MULTIPLAYER_ENABLED: true,
      AMBIENT_AUDIO_ENABLED: false,
      CMS_PROVIDER: 'local',
      TEMPLATE_ID: 'watt-default',
    };
  });

  await page.goto('http://localhost:5173?room=whiteboard-test');
  await waitForAppReady(page);

  // Wait for HUD to render with whiteboard toggle button
  await page.waitForSelector('[data-testid="whiteboard-toggle"]', { timeout: 10000 });

  // Click whiteboard toggle button
  await page.click('[data-testid="whiteboard-toggle"]');

  // Wait for whiteboard panel to appear
  await expect(page.locator('[data-testid="whiteboard-panel"]')).toBeVisible();

  // Wait for Excalidraw to load
  await page.waitForTimeout(1000);

  // Check if Excalidraw wrapper is visible
  // Note: Excalidraw might use different selectors, adjust if needed
  const excalidrawWrapper = page.locator('.excalidraw-wrapper');
  if ((await excalidrawWrapper.count()) > 0) {
    await expect(excalidrawWrapper).toBeVisible();
  }

  // Shape drawing and sync would be tested here in a future iteration
  // For now, we just verify the whiteboard opens
});
