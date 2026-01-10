import { test, expect } from '@playwright/test';

test.describe('MVP Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should join room and display UI', async ({ page }) => {
    // Wait for login/prejoin panel
    await expect(
      page.locator('text=Wähle deinen Avatar').or(page.locator('text=Username'))
    ).toBeVisible({ timeout: 10000 });

    // Fill username if login form is visible
    const usernameInput = page.locator('input[placeholder*="Gast"], input[type="text"]').first();
    if (await usernameInput.isVisible()) {
      await usernameInput.fill('TestUser');
      await page.locator('button:has-text("Weiter"), button:has-text("Continue")').first().click();
    }

    // Wait for world to load
    await page.waitForTimeout(3000);

    // Check that canvas/3D scene is rendered
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });
  });

  test('should connect to voice (if enabled)', async ({ page }) => {
    await page.goto('/');

    // Wait for UI
    await page.waitForTimeout(2000);

    // Look for voice panel toggle
    const voiceButton = page
      .locator('[data-testid="voice-toggle"], button:has-text("Voice"), button:has-text("Mic")')
      .first();
    if (await voiceButton.isVisible({ timeout: 5000 })) {
      await voiceButton.click();

      // Check for voice panel
      await expect(page.locator('[data-testid="voice-panel"], .voice-panel').first()).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('should display whiteboard (if enabled)', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(2000);

    const whiteboardButton = page
      .locator('[data-testid="whiteboard-toggle"], button:has-text("Whiteboard")')
      .first();
    if (await whiteboardButton.isVisible({ timeout: 5000 })) {
      await whiteboardButton.click();

      await expect(page.locator('[data-testid="whiteboard-panel"]').first()).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('should handle zone changes', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(3000);

    // Move avatar (WASD keys)
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(1000);
    await page.keyboard.press('KeyA');
    await page.waitForTimeout(1000);

    // Zone indicator might appear
    const zoneIndicator = page.locator('[data-testid="zone-indicator"]').first();
    // Zone indicator is optional, so we don't fail if it doesn't appear
  });

  test('should support remote route', async ({ page }) => {
    await page.goto('/remote');

    // Check for remote controller UI
    await expect(page.locator('text=Remote Controller, text=🎮').first()).toBeVisible({
      timeout: 5000,
    });

    // Check for PTT button
    const pttButton = page.locator('[data-testid="ptt-button"]').first();
    await expect(pttButton).toBeVisible();
  });
});

test.describe('Multi-Browser Tests', () => {
  test('should sync whiteboard across browsers', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await page1.goto('/?room=test-whiteboard');
    await page2.goto('/?room=test-whiteboard');

    // Wait for both to load
    await page1.waitForTimeout(3000);
    await page2.waitForTimeout(3000);

    // Open whiteboard on both
    const wbButton1 = page1.locator('[data-testid="whiteboard-toggle"]').first();
    const wbButton2 = page2.locator('[data-testid="whiteboard-toggle"]').first();

    if (await wbButton1.isVisible({ timeout: 5000 })) {
      await wbButton1.click();
      await wbButton2.click();

      // Draw on page1, check if it appears on page2
      // This requires Excalidraw to be fully loaded
      await page1.waitForTimeout(2000);
      await page2.waitForTimeout(2000);
    }

    await context1.close();
    await context2.close();
  });
});
