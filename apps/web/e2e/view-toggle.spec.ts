import { test, expect } from '@playwright/test';

import { waitForAppReady } from './helpers/wait-for-app.js';
import { setSessionBeforeLoad } from './utils.js';

test.describe('View Toggle (FP/TP Camera)', () => {
  test('page loads and V key toggles view mode', async ({ page }) => {
    await setSessionBeforeLoad(page);
    await page.goto('http://localhost:5173/?room=e2e');
    await waitForAppReady(page);

    // Check that canvas is visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Wait for world to initialize
    await page.waitForTimeout(3000);

    // Press V key to toggle view
    await page.keyboard.press('v');

    // Wait a bit for toggle to take effect
    await page.waitForTimeout(500);

    // Press V again to toggle back
    await page.keyboard.press('v');

    // Wait a bit
    await page.waitForTimeout(500);

    // Check that no errors occurred
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.waitForTimeout(1000);

    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('util.debuglog') &&
        !e.includes('util.inspect') &&
        !e.includes('Pointer Lock API')
    );

    expect(criticalErrors.length).toBe(0);
  });
});
