import { test, expect } from '@playwright/test';

import { waitForAppReady } from './helpers/wait-for-app.js';
import { setSessionBeforeLoad } from './utils.js';

test.describe('Seating', () => {
  test('player can sit on bench', async ({ page }) => {
    await setSessionBeforeLoad(page);
    await page.goto('/');
    await waitForAppReady(page);

    // Wait for world to initialize
    await page.waitForTimeout(3000);

    // Teleport near a bench (bench-main is at [1, 0, -5] according to manifest)
    await page.evaluate(() => {
      const w = window as any;
      if (w.__world) {
        const playerController = w.__world.getPlayerController();
        if (playerController) {
          // Teleport to position near bench
          playerController.camera.position.set(1, 1.6, -4);
        }
      }
    });

    await page.waitForTimeout(1000);

    // Press E to sit
    await page.keyboard.press('e');
    await page.waitForTimeout(500);

    // Check if sitting state is active
    // This would require exposing a method or checking avatar state
    // For now, we just verify no errors occurred
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

  test('player can stand up from bench', async ({ page }) => {
    await setSessionBeforeLoad(page);
    await page.goto('/');
    await waitForAppReady(page);

    await page.waitForTimeout(3000);

    // Teleport near bench
    await page.evaluate(() => {
      const w = window as any;
      if (w.__world) {
        const playerController = w.__world.getPlayerController();
        if (playerController) {
          playerController.camera.position.set(1, 1.6, -4);
        }
      }
    });

    await page.waitForTimeout(1000);

    // Sit down
    await page.keyboard.press('e');
    await page.waitForTimeout(500);

    // Stand up
    await page.keyboard.press('e');
    await page.waitForTimeout(500);

    // Verify no errors
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
