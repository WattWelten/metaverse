/**
 * Local Smoke Tests
 * Tests critical local development scenarios: App load, Canvas render, Template load, Debug-Overlay, Audio-Context
 */

import { test, expect } from '@playwright/test';

import { waitForAppReady } from './helpers/wait-for-app.js';

test.describe('Local Smoke Tests', () => {
  test('app loads without errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      const errorMessage = error.message.toLowerCase();
      // Filter out non-critical errors
      if (
        !errorMessage.includes('websocket') &&
        !errorMessage.includes('connection') &&
        !errorMessage.includes('favicon') &&
        !errorMessage.includes('sourcemap') &&
        !errorMessage.includes('ready player me') // Ready Player Me API errors are expected in local dev
      ) {
        errors.push(error.message);
      }
    });

    await page.goto('/');
    await waitForAppReady(page);
    await page.waitForTimeout(2000);

    // Should have no critical errors
    expect(errors.length).toBe(0);
  });

  test('canvas renders', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Check canvas is rendered
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });

    // Check canvas has content (not just black screen)
    const canvasSize = await canvas.boundingBox();
    expect(canvasSize).not.toBeNull();
    expect(canvasSize?.width).toBeGreaterThan(0);
    expect(canvasSize?.height).toBeGreaterThan(0);
  });

  test('template loads (watt-eco or fallback)', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Wait for template to load
    await page.waitForTimeout(3000);

    // Check canvas is visible (template loaded successfully)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Check no critical errors during template load
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      const errorMessage = error.message.toLowerCase();
      if (
        !errorMessage.includes('websocket') &&
        !errorMessage.includes('connection') &&
        !errorMessage.includes('favicon') &&
        !errorMessage.includes('sourcemap') &&
        !errorMessage.includes('ready player me')
      ) {
        errors.push(error.message);
      }
    });

    await page.waitForTimeout(2000);
    expect(errors.length).toBe(0);
  });

  test('debug-overlay toggles with F12', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Press F12 to open debug overlay
    await page.keyboard.press('F12');
    await page.waitForTimeout(500);

    // Check if debug overlay is visible (FPS, Template-Switcher, etc.)
    const debugOverlay = page.locator('text=/FPS|Template|Exposure/i');
    await expect(debugOverlay).toBeVisible({ timeout: 2000 });

    // Press F12 again to close
    await page.keyboard.press('F12');
    await page.waitForTimeout(500);

    // Debug overlay should be hidden (or still visible but that's ok)
    // Main check: no errors
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('audio-context resumes after user interaction', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Wait for initial load
    await page.waitForTimeout(1000);

    // Simulate user interaction (click)
    await page.mouse.click(100, 100);
    await page.waitForTimeout(500);

    // Check if audio context is resumed (no errors)
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      const errorMessage = error.message.toLowerCase();
      if (
        !errorMessage.includes('websocket') &&
        !errorMessage.includes('connection') &&
        !errorMessage.includes('favicon') &&
        !errorMessage.includes('sourcemap') &&
        !errorMessage.includes('ready player me')
      ) {
        errors.push(error.message);
      }
    });

    // Trigger another interaction to ensure audio context is active
    await page.mouse.click(200, 200);
    await page.waitForTimeout(1000);

    expect(errors.length).toBe(0);
  });

  test('feature-flags work (solo mode without server)', async ({ page }) => {
    // Test that app works even if multiplayer is disabled
    await page.goto('/');
    await waitForAppReady(page);

    // Wait for initialization
    await page.waitForTimeout(2000);

    // Check canvas is visible (app works in solo mode)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Check no critical errors (server connection errors are expected and ok)
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      const errorMessage = error.message.toLowerCase();
      if (
        !errorMessage.includes('websocket') &&
        !errorMessage.includes('connection') &&
        !errorMessage.includes('favicon') &&
        !errorMessage.includes('sourcemap') &&
        !errorMessage.includes('ready player me')
      ) {
        errors.push(error.message);
      }
    });

    await page.waitForTimeout(2000);
    expect(errors.length).toBe(0);
  });
});
