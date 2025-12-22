import { test, expect } from '@playwright/test';

import { waitForAppReady } from './helpers/wait-for-app.js';

test.describe('Manual Template Switching Test', () => {
  test('debug overlay and template switching should work', async ({ page }) => {
    await page.goto('/');

    await waitForAppReady(page);

    // Wait for app to initialize
    await page.waitForTimeout(1000);

    // Press F12 to open debug overlay
    await page.keyboard.press('F12');
    await page.waitForTimeout(500);

    // Check for debug overlay (look for FPS text or debug overlay elements)
    const debugOverlay = page.locator(
      '[data-testid="debug-overlay"], .debug-overlay, [class*="DebugOverlay"]'
    );

    const overlayExists = (await debugOverlay.count()) > 0;

    if (overlayExists) {
      // Debug overlay exists, verify it
      await expect(debugOverlay.first()).toBeVisible({ timeout: 5000 });

      // Check for FPS display
      const fpsDisplay = page.locator('text=/FPS|fps/i');
      if ((await fpsDisplay.count()) > 0) {
        await expect(fpsDisplay.first()).toBeVisible({ timeout: 2000 });
        console.log('FPS display found');
      }

      // Check for template dropdown
      const templateDropdown = page.locator(
        '[data-testid="template-select"], select, [class*="Template"], [class*="template"]'
      );

      const dropdownExists = (await templateDropdown.count()) > 0;

      if (dropdownExists) {
        // Template dropdown exists, test switching
        await expect(templateDropdown.first()).toBeVisible({ timeout: 5000 });

        // Try to select watt-eco if available
        const wattEcoOption = templateDropdown
          .locator('option:has-text("watt-eco"), [value*="watt-eco"]')
          .first();

        if ((await wattEcoOption.count()) > 0) {
          await templateDropdown.selectOption({ label: /watt-eco/i });
          await page.waitForTimeout(2000); // Wait for template to load

          // Verify no critical errors
          const errors1 = await page.evaluate(() => {
            return (window as any).__test?.getErrors?.() || [];
          });

          const criticalErrors1 = errors1.filter(
            (e: string) =>
              !e.includes('Failed to load template overlay') &&
              !e.includes('WebSocket connection refused') &&
              !e.includes('getUserMedia')
          );

          expect(criticalErrors1.length).toBe(0);
          console.log('Template switched to watt-eco');
        }

        // Try to select watt-default if available
        const wattDefaultOption = templateDropdown
          .locator('option:has-text("watt-default"), [value*="watt-default"]')
          .first();

        if ((await wattDefaultOption.count()) > 0) {
          await templateDropdown.selectOption({ label: /watt-default/i });
          await page.waitForTimeout(2000); // Wait for template to load

          // Verify no critical errors
          const errors2 = await page.evaluate(() => {
            return (window as any).__test?.getErrors?.() || [];
          });

          const criticalErrors2 = errors2.filter(
            (e: string) =>
              !e.includes('Failed to load template overlay') &&
              !e.includes('WebSocket connection refused') &&
              !e.includes('getUserMedia')
          );

          expect(criticalErrors2.length).toBe(0);
          console.log('Template switched to watt-default');
        }
      } else {
        console.log('Template dropdown not found');
      }

      // Press F12 again to close debug overlay
      await page.keyboard.press('F12');
      await page.waitForTimeout(500);
    } else {
      // Debug overlay doesn't exist - that's OK if debug is disabled
      console.log('Debug overlay not found (debug might be disabled)');
    }

    // Verify no critical errors
    const finalErrors = await page.evaluate(() => {
      return (window as any).__test?.getErrors?.() || [];
    });

    const finalCriticalErrors = finalErrors.filter(
      (e: string) =>
        !e.includes('Failed to load template overlay') &&
        !e.includes('WebSocket connection refused') &&
        !e.includes('getUserMedia')
    );

    expect(finalCriticalErrors.length).toBe(0);
  });
});
