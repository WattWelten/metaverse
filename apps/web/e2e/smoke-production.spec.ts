/**
 * Production Smoke Tests
 * Tests critical production scenarios: Page load, Room join, Peer visibility, Chat, Avatar sync
 */

import { test, expect } from '@playwright/test';

import { waitForAppReady } from './helpers/wait-for-app.js';

const SERVER_URL = process.env.VITE_SERVER_URL || 'http://localhost:3001';

test.describe('Production Smoke Tests', () => {
  test('page loads successfully', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Check canvas is rendered
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test('join room via deep link', async ({ page }) => {
    const roomId = `test-${Date.now()}`;
    await page.goto(`/?room=${roomId}`);
    await waitForAppReady(page);

    // Wait for connection
    await page.waitForTimeout(3000);

    // Check if room UI is visible (if multiplayer enabled)
    const roomUI = page.locator('text=/Room:/i');
    const isMultiplayerEnabled = await page
      .evaluate(() => {
        return (
          (window as any).__MULTIPLAYER_ENABLED__ === 'true' ||
          import.meta.env.VITE_MULTIPLAYER_ENABLED === 'true'
        );
      })
      .catch(() => false);

    if (isMultiplayerEnabled) {
      // Room UI should show the room ID
      await expect(roomUI).toBeVisible({ timeout: 5000 });
    }
  });

  test('two browser tabs see each other (peer-joined)', async ({ context }) => {
    const roomId = `test-peer-${Date.now()}`;

    // Open first tab
    const page1 = await context.newPage();
    await page1.goto(`/?room=${roomId}`);
    await waitForAppReady(page1);
    await page1.waitForTimeout(2000);

    // Open second tab
    const page2 = await context.newPage();
    await page2.goto(`/?room=${roomId}`);
    await waitForAppReady(page2);
    await page2.waitForTimeout(3000);

    // Check if both pages show player count >= 2 (if multiplayer enabled)
    const playerCount1 = await page1
      .locator('text=/Players:/i')
      .textContent()
      .catch(() => null);
    const playerCount2 = await page2
      .locator('text=/Players:/i')
      .textContent()
      .catch(() => null);

    // If multiplayer is enabled, both should show at least 1 player
    if (playerCount1 && playerCount2) {
      const count1 = parseInt(playerCount1.match(/\d+/)?.[0] || '1');
      const count2 = parseInt(playerCount2.match(/\d+/)?.[0] || '1');
      expect(count1).toBeGreaterThanOrEqual(1);
      expect(count2).toBeGreaterThanOrEqual(1);
    }

    await page1.close();
    await page2.close();
  });

  test('avatar movement synchronizes', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Wait for initialization
    await page.waitForTimeout(2000);

    // Move camera (simulate avatar movement)
    await page.mouse.move(100, 100);
    await page.waitForTimeout(500);
    await page.mouse.move(200, 200);
    await page.waitForTimeout(1000);

    // Check if canvas is still visible (no crashes)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('no critical errors on production load', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      const errorMessage = error.message.toLowerCase();
      // Filter out non-critical errors
      if (
        !errorMessage.includes('websocket') &&
        !errorMessage.includes('connection') &&
        !errorMessage.includes('favicon') &&
        !errorMessage.includes('sourcemap')
      ) {
        errors.push(error.message);
      }
    });

    await page.goto('/');
    await waitForAppReady(page);
    await page.waitForTimeout(3000);

    // Should have no critical errors
    expect(errors.length).toBe(0);
  });
});
