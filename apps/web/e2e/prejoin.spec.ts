import { test } from '@playwright/test';
import { completePrejoinJourney, fpsAbove, assertNoHardErrors } from './utils';

test.describe('Prejoin Journey', () => {
  test('Avatar → Name → Controls → Enter works', async ({ page }) => {
    // Test-Mode aktivieren für Console-Error-Hook
    await page.addInitScript(() => {
      (window as any).__TEST_MODE__ = true;
    });

    // Führe komplette Prejoin-Journey durch
    await completePrejoinJourney(page, 'E2E Tester');

    // Prüfe Performance & Fehler
    await fpsAbove(page, 20); // Mindestens 20 FPS für E2E-Tests
    await assertNoHardErrors(page);
  });
});
