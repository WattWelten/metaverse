import { test, expect } from '@playwright/test';

test.describe('Navmesh', () => {
  test('page loads and canvas is visible', async ({ page }) => {
    await page.goto('http://localhost:5173/?room=e2e');
    await page.waitForLoadState('networkidle');

    // Check that canvas is visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Check that no unhandled errors occurred
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Wait a bit to catch any delayed errors
    await page.waitForTimeout(2000);

    // Filter out known harmless errors
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('util.debuglog') &&
        !e.includes('util.inspect') &&
        !e.includes('Pointer Lock API')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('navmesh debug toggle (H key) works', async ({ page }) => {
    await page.goto('http://localhost:5173/?room=e2e');
    await page.waitForLoadState('networkidle');

    // Wait for world to initialize
    await page.waitForTimeout(3000);

    // Press H key to toggle navmesh overlay
    await page.keyboard.press('h');

    // Wait a bit for toggle to take effect
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
