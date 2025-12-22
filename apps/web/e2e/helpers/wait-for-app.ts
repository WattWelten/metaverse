/**
 * Helper-Funktionen zum Warten auf App-Initialisierung
 */

import type { Page } from '@playwright/test';

/**
 * Wartet auf vollständige App-Initialisierung
 * - Network Idle
 * - Canvas gerendert
 * - Mindestens 2 Sekunden für async Init
 */
export async function waitForAppReady(page: Page, timeout = 30000): Promise<void> {
  // Warte auf Network Idle (Assets geladen)
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
    // Ignoriere Timeout, App kann auch ohne Network Idle funktionieren
  });

  // Warte auf Canvas (Renderer wird erstellt)
  await page.waitForSelector('canvas', { timeout });

  // Zusätzliche Wartezeit für async world.init()
  await page.waitForTimeout(2000);
}

/**
 * Wartet auf Canvas mit mehreren Versuchen
 */
export async function waitForCanvas(page: Page, timeout = 30000): Promise<void> {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      await page.waitForSelector('canvas', { timeout: timeout / maxAttempts });
      return;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw error;
      }
      // Warte etwas länger zwischen Versuchen
      await page.waitForTimeout(1000);
    }
  }
}
