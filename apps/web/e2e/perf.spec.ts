import { test } from '@playwright/test';
import { completePrejoinJourney, fpsAbove } from './utils';

test.describe('Performance', () => {
  test('FPS ≥ 30 on Desktop (dev)', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__TEST_MODE__ = true;
    });

    // Führe komplette Prejoin-Journey durch
    await completePrejoinJourney(page, 'Perf Tester');

    // Warte auf World-Initialisierung und FPS-Sampler
    await page.waitForTimeout(3000);

    // Prüfe FPS (in E2E-Tests kann FPS niedriger sein, daher 30 statt 40)
    await fpsAbove(page, 30);
  });
});
