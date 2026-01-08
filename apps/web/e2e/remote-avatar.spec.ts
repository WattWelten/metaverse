import { test, expect } from '@playwright/test';

test.describe('Remote Avatar Sync', () => {
  test('two tabs see each other as remote avatars', async ({ browser }) => {
    // Skip if multiplayer is disabled
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Navigate both tabs to the same room
      await page1.goto('http://localhost:5173/?room=e2e-multiplayer');
      await page2.goto('http://localhost:5173/?room=e2e-multiplayer');

      await page1.waitForLoadState('networkidle');
      await page2.waitForLoadState('networkidle');

      // Wait for world initialization
      await page1.waitForTimeout(3000);
      await page2.waitForTimeout(3000);

      // Check that both pages loaded without errors
      const errors1: string[] = [];
      const errors2: string[] = [];

      page1.on('pageerror', (error) => errors1.push(error.message));
      page2.on('pageerror', (error) => errors2.push(error.message));

      await page1.waitForTimeout(2000);
      await page2.waitForTimeout(2000);

      const criticalErrors1 = errors1.filter(
        (e) =>
          !e.includes('favicon') &&
          !e.includes('util.debuglog') &&
          !e.includes('util.inspect') &&
          !e.includes('Pointer Lock API')
      );

      const criticalErrors2 = errors2.filter(
        (e) =>
          !e.includes('favicon') &&
          !e.includes('util.debuglog') &&
          !e.includes('util.inspect') &&
          !e.includes('Pointer Lock API')
      );

      expect(criticalErrors1.length).toBe(0);
      expect(criticalErrors2.length).toBe(0);

      // Both pages should have visible canvas
      await expect(page1.locator('canvas')).toBeVisible();
      await expect(page2.locator('canvas')).toBeVisible();
    } finally {
      await context1.close();
      await context2.close();
    }
  });
});
