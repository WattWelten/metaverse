import { test, expect } from '@playwright/test';

import { waitForAppReady } from './helpers/wait-for-app.js';

test.describe('Manual XR Test', () => {
  test('XR button should be available if supported', async ({ page }) => {
    await page.goto('/');

    await waitForAppReady(page);

    // Wait for app to initialize
    await page.waitForTimeout(1000);

    // Check for WebXR button (might not exist if XR is disabled or not supported)
    const xrButton = page.locator(
      '[data-testid="xr-button"], [data-testid="vr-button"], button:has-text("VR"), button:has-text("Enter VR"), button:has-text("WebXR"), [class*="VRButton"], [class*="XRButton"]'
    );

    const xrButtonExists = (await xrButton.count()) > 0;

    if (xrButtonExists) {
      // XR button exists, verify it
      await expect(xrButton).toBeVisible({ timeout: 5000 });

      // Check that button is clickable (it might not start VR if no headset, but should not error)
      await xrButton.click();
      await page.waitForTimeout(500);

      // Verify no critical errors
      const errors = await page.evaluate(() => {
        return (window as any).__test?.getErrors?.() || [];
      });

      const criticalErrors = errors.filter(
        (e: string) =>
          !e.includes('Failed to load template overlay') &&
          !e.includes('WebSocket connection refused') &&
          !e.includes('getUserMedia') &&
          !e.includes('XR') // XR errors might be expected if no headset
      );

      expect(criticalErrors.length).toBe(0);

      console.log('XR button found and clicked');
    } else {
      // XR button doesn't exist - that's OK if XR is disabled or not supported
      console.log('XR button not found (XR might be disabled or not supported)');
    }

    // Verify no critical errors regardless of XR button presence
    const finalErrors = await page.evaluate(() => {
      return (window as any).__test?.getErrors?.() || [];
    });

    const finalCriticalErrors = finalErrors.filter(
      (e: string) =>
        !e.includes('Failed to load template overlay') &&
        !e.includes('WebSocket connection refused') &&
        !e.includes('getUserMedia') &&
        !e.includes('XR')
    );

    expect(finalCriticalErrors.length).toBe(0);
  });
});
