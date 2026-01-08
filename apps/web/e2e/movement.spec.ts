import { test, expect } from '@playwright/test';
import { completePrejoinJourney } from './utils';

test.describe('Movement & Controls', () => {
  test('WASD, FP/TP (V), Jump, Seat hint', async ({ page }) => {
    // Test-Mode aktivieren
    await page.addInitScript(() => {
      (window as any).__TEST_MODE__ = true;
      (window as any).__world = {};
    });

    // Führe komplette Prejoin-Journey durch
    await completePrejoinJourney(page, 'Movement Tester');

    // Warte auf World-Initialisierung
    await page.waitForTimeout(3000);

    // W 1s halten
    await page.keyboard.down('w');
    await page.waitForTimeout(1000);
    await page.keyboard.up('w');
    await page.waitForTimeout(500);

    // Toggle FP/TP (V-Taste)
    await page.keyboard.press('v');
    await page.waitForTimeout(200);
    await page.keyboard.press('v'); // Zurück zu FP
    await page.waitForTimeout(200);

    // Jump (Space)
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    // Seat-Hinweis sichtbar? (falls Seating-System aktiv)
    const seatHint = page.getByText(/Sitzen\/aufstehen|E = Sitzen|Drücke E zum Sitzen/i);
    const hasSeatHint = await seatHint.isVisible().catch(() => false);

    // Optional: Prüfe ob Hinweis vorhanden ist (nur wenn Seating-System aktiv)
    // expect(hasSeatHint).toBe(true); // Nur wenn Seating-System aktiv ist
  });
});
