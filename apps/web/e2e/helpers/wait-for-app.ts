/**
 * Helper-Funktionen zum Warten auf App-Initialisierung
 */

import type { Page } from '@playwright/test';
import { performLoginIfNeeded, setSessionBeforeLoad } from '../utils.js';

/**
 * Wartet auf vollständige App-Initialisierung
 * - Führt Login durch falls nötig
 * - Network Idle
 * - Canvas gerendert
 * - Mindestens 2 Sekunden für async Init
 *
 * WICHTIG: setSessionBeforeLoad() sollte VOR page.goto() aufgerufen werden!
 */
export async function waitForAppReady(
  page: Page,
  timeout = 30000,
  username = 'E2E Tester'
): Promise<void> {
  // Prüfe ob Session existiert (falls nicht, muss Login durchgeführt werden)
  const hasSession = await page
    .evaluate(() => {
      return !!localStorage.getItem('metaverse_session') || !!localStorage.getItem('ww_session');
    })
    .catch(() => false);

  // Führe Login durch falls Login-Modal sichtbar ist
  await performLoginIfNeeded(page, username);

  // Warte auf Network Idle (Assets geladen)
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
    // Ignoriere Timeout, App kann auch ohne Network Idle funktionieren
  });

  // Warte auf Canvas (Renderer wird erstellt)
  // Versuche mehrfach, da die World-Initialisierung asynchron ist
  let canvasFound = false;
  const maxAttempts = 5;
  const attemptTimeout = timeout / maxAttempts;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      await page.waitForSelector('canvas', { timeout: attemptTimeout });
      canvasFound = true;
      break;
    } catch (error) {
      if (i < maxAttempts - 1) {
        // Warte etwas länger zwischen Versuchen
        await page.waitForTimeout(2000);
        // Prüfe ob Login noch nötig ist
        await performLoginIfNeeded(page, username);
      } else {
        throw error;
      }
    }
  }

  if (!canvasFound) {
    throw new Error(`Canvas not found after ${maxAttempts} attempts`);
  }

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
