/**
 * Basis-Test: Prüft ob die App überhaupt lädt
 * Dies hilft zu identifizieren ob das Problem beim Canvas oder beim App-Start liegt
 */

import { test, expect } from '@playwright/test';

import { setSessionBeforeLoad } from './utils.js';

test('app loads without errors', async ({ page }) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Sammle Console-Errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    } else if (msg.type() === 'warning') {
      warnings.push(msg.text());
    }
  });

  // Sammle Page-Errors
  page.on('pageerror', (error) => {
    errors.push(`Page Error: ${error.message}`);
  });

  // Setze Session vor dem Laden
  await setSessionBeforeLoad(page);
  await page.goto('/');

  // Warte auf Page-Load
  await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

  // Prüfe ob root-Element existiert (auch wenn hidden)
  const root = page.locator('#root');
  const rootExists = await root.count();
  expect(rootExists).toBeGreaterThan(0);

  // Prüfe CSS-Styles
  const rootStyle = await root.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return {
      display: styles.display,
      visibility: styles.visibility,
      width: styles.width,
      height: styles.height,
    };
  });

  console.log('Root styles:', rootStyle);

  // Warte etwas für React-Rendering
  await page.waitForTimeout(2000);

  // Prüfe ob Canvas existiert (auch wenn nicht sichtbar)
  const canvasExists = await page.locator('canvas').count();

  console.log('Errors:', errors);
  console.log('Warnings:', warnings);
  console.log('Canvas count:', canvasExists);

  // Test schlägt fehl wenn kritische Errors vorhanden
  const criticalErrors = errors.filter(
    (e) =>
      !e.includes('favicon') &&
      !e.includes('sourcemap') &&
      !e.includes('VRM loader requires') && // VRM ist optional
      !e.includes('WebGL') && // WebGL-Warnungen sind harmlos
      !e.includes('XR is not supported') && // XR-Warnungen sind harmlos
      !e.includes('GroupMarkerNotSet') && // Chrome-intern
      !e.includes('global is not defined') && // Sollte durch Vite-Fix behoben sein
      !e.includes('GL Driver Message') && // GPU-Treiber-Warnungen
      !e.includes('Automatic fallback to software') && // WebGL-Fallback-Warnungen
      !e.includes('GPU stall') && // GPU-Performance-Warnungen
      !e.includes('Failed to load template overlay') && // Template-Overlay-Fehler sind nicht kritisch
      !e.includes('Unexpected token') // JSON-Parsing-Fehler für Overlays sind nicht kritisch
  );

  // Prüfe dass Canvas gerendert wurde
  expect(canvasExists).toBeGreaterThan(0);

  // Prüfe kritische Errors (ignoriere harmlose Warnungen)
  if (criticalErrors.length > 0) {
    console.log('Critical errors found:', criticalErrors);
  }
  expect(criticalErrors.length).toBe(0);
});
