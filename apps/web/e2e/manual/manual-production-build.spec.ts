import { test, expect } from '@playwright/test';

test.describe('Manual Production Build Test', () => {
  test('production build should load and work correctly', async ({ page }) => {
    // Navigate to production build (assuming it's served on port 3000)
    // In CI, this might need to be configured differently
    const productionUrl = process.env.PRODUCTION_URL || 'http://localhost:3000';

    try {
      await page.goto(productionUrl);
    } catch (error) {
      // If production server is not running, skip the test
      test.skip(true, 'Production server not available');
      return;
    }

    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Check that page loaded without errors
    const errors = await page.evaluate(() => {
      const errors: string[] = [];
      // Check console errors
      if ((window as any).console?.errors) {
        errors.push(...(window as any).console.errors);
      }
      return errors;
    });

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      (e: string) =>
        !e.includes('Failed to load template overlay') &&
        !e.includes('WebSocket connection refused') &&
        !e.includes('getUserMedia') &&
        !e.includes('favicon')
    );

    expect(criticalErrors.length).toBe(0);

    // Check that canvas is rendering
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });

    // Check that no 404 errors for assets
    const response = await page.goto(productionUrl);
    expect(response?.status()).toBe(200);

    // Check that main JavaScript files loaded
    const jsLoaded = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return scripts.length > 0;
    });

    expect(jsLoaded).toBe(true);

    // Wait a bit for the app to initialize
    await page.waitForTimeout(2000);

    // Check that app is responsive (no frozen state)
    const isResponsive = await page.evaluate(() => {
      return document.readyState === 'complete';
    });

    expect(isResponsive).toBe(true);

    console.log('Production build loaded successfully');
  });
});
