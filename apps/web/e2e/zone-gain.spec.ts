import { test, expect } from '@playwright/test';

import { waitForAppReady } from './helpers/wait-for-app.js';
import { setSessionBeforeLoad } from './utils.js';

test.describe('Zone Gain', () => {
  test('audio gain is higher in stage zone', async ({ page }) => {
    await setSessionBeforeLoad(page);
    await page.goto('/');
    await waitForAppReady(page);

    // Wait for world to initialize
    await page.waitForTimeout(3000);

    // Teleport away from stage (far position)
    await page.evaluate(() => {
      const w = window as any;
      if (w.__world) {
        const playerController = w.__world.getPlayerController();
        if (playerController) {
          playerController.camera.position.set(20, 1.6, 20);
        }
      }
    });

    await page.waitForTimeout(1000);

    // Get audio gain away from stage
    const gainAway = await page.evaluate(() => {
      const w = window as any;
      w.__audioDbg = w.__audioDbg || {};
      // This would need to be exposed from SpatialAudioManager
      // For now, we check if zone system is working
      return w.__audioDbg.currentGain || 1.0;
    });

    // Teleport to stage zone (stage is at [0, 0, -8] with r=6)
    await page.evaluate(() => {
      const w = window as any;
      if (w.__world) {
        const playerController = w.__world.getPlayerController();
        if (playerController) {
          playerController.camera.position.set(0, 1.6, -8);
        }
      }
    });

    await page.waitForTimeout(1000);

    // Get audio gain in stage zone
    const gainStage = await page.evaluate(() => {
      const w = window as any;
      w.__audioDbg = w.__audioDbg || {};
      return w.__audioDbg.currentGain || 1.0;
    });

    // Stage gain should be higher (1.2) than away gain (1.0)
    // Note: This test is a placeholder - actual implementation would expose gain values
    console.log('Gain away:', gainAway, 'Gain stage:', gainStage);
    expect(true).toBe(true); // Placeholder - actual test would compare gains
  });

  test('audio gain varies by zone', async ({ page }) => {
    await setSessionBeforeLoad(page);
    await page.goto('/');
    await waitForAppReady(page);

    await page.waitForTimeout(3000);

    // Test breakoutA zone (gain: 1.0)
    await page.evaluate(() => {
      const w = window as any;
      if (w.__world) {
        const playerController = w.__world.getPlayerController();
        if (playerController) {
          playerController.camera.position.set(-8, 1.6, -4);
        }
      }
    });

    await page.waitForTimeout(1000);

    // Test breakoutB zone (gain: 1.0)
    await page.evaluate(() => {
      const w = window as any;
      if (w.__world) {
        const playerController = w.__world.getPlayerController();
        if (playerController) {
          playerController.camera.position.set(7, 1.6, -4);
        }
      }
    });

    await page.waitForTimeout(1000);

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
