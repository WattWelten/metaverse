import { test, expect } from '@playwright/test';

import { waitForAppReady } from './helpers/wait-for-app.js';

test('debug overlay toggle', async ({ page }) => {
  await page.goto('/');

  // Wait for app to be ready
  await waitForAppReady(page);

  // Press F12 to toggle debug overlay
  await page.keyboard.press('F12');

  // Check if debug overlay is visible (look for FPS text)
  await expect(page.locator('text=FPS')).toBeVisible({ timeout: 5000 });
});
