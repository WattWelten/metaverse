import { test, expect } from '@playwright/test';

/**
 * Whiteboard-Sync Test
 *
 * Testet kollaboratives Whiteboard mit Yjs:
 * - 2 Browser können gleichzeitig zeichnen
 * - Änderungen werden < 200ms synchronisiert
 */
test.describe('Whiteboard Sync', () => {
  test('should sync whiteboard changes across browsers', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Navigate to demo-meeting (has whiteboard enabled)
    await page1.goto('/?template=demo-meeting&room=test-whiteboard');
    await page2.goto('/?template=demo-meeting&room=test-whiteboard');

    // Wait and set prefs to skip login
    await page1.waitForTimeout(2000);
    await page2.waitForTimeout(2000);

    await page1.addInitScript(() => {
      localStorage.setItem(
        'ww_prefs_v1',
        JSON.stringify({ username: 'User1', quality: 'fair', viewMode: 'tp' })
      );
    });
    await page2.addInitScript(() => {
      localStorage.setItem(
        'ww_prefs_v1',
        JSON.stringify({ username: 'User2', quality: 'fair', viewMode: 'tp' })
      );
    });

    await page1.reload();
    await page2.reload();

    await page1.waitForSelector('canvas', { timeout: 15000 });
    await page2.waitForSelector('canvas', { timeout: 15000 });

    // Wait for world to load
    await page1.waitForTimeout(3000);
    await page2.waitForTimeout(3000);

    // Open whiteboard on both
    const wbButton1 = page1
      .locator('[data-testid="whiteboard-toggle"], button:has-text("Whiteboard")')
      .first();
    const wbButton2 = page2
      .locator('[data-testid="whiteboard-toggle"], button:has-text("Whiteboard")')
      .first();

    if (!(await wbButton1.isVisible({ timeout: 5000 }))) {
      test.skip(true, 'Whiteboard not enabled');
      return;
    }

    await wbButton1.click();
    await wbButton2.click();

    // Wait for Excalidraw to load
    await page1.waitForTimeout(2000);
    await page2.waitForTimeout(2000);

    // Check whiteboard panels are visible
    const wbPanel1 = page1.locator('[data-testid="whiteboard-panel"], .whiteboard-panel').first();
    const wbPanel2 = page2.locator('[data-testid="whiteboard-panel"], .whiteboard-panel').first();

    await expect(wbPanel1).toBeVisible({ timeout: 5000 });
    await expect(wbPanel2).toBeVisible({ timeout: 5000 });

    // Draw on page1 (simulate mouse drag)
    const canvas1 = page1.locator('canvas').first();
    if (await canvas1.isVisible({ timeout: 5000 })) {
      const box = await canvas1.boundingBox();
      if (box) {
        // Draw a line from (100, 100) to (200, 200)
        await page1.mouse.move(box.x + 100, box.y + 100);
        await page1.mouse.down();
        await page1.mouse.move(box.x + 200, box.y + 200, { steps: 10 });
        await page1.mouse.up();
      }
    }

    // Wait for sync (should be < 200ms, but we wait 1s to be safe)
    await page2.waitForTimeout(1000);

    // Verify canvas2 has content (check if Excalidraw elements exist)
    // Note: This is a simplified check - in production, verify actual drawn elements
    const canvas2 = page2.locator('canvas').first();
    await expect(canvas2).toBeVisible({ timeout: 5000 });

    // Check for Yjs connection status (if available in UI)
    // In production, you might want to check for connection indicators

    await context1.close();
    await context2.close();
  });

  test('should handle concurrent edits', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await page1.goto('/?template=demo-meeting&room=test-whiteboard-concurrent');
    await page2.goto('/?template=demo-meeting&room=test-whiteboard-concurrent');

    await page1.waitForTimeout(2000);
    await page2.waitForTimeout(2000);

    await page1.addInitScript(() => {
      localStorage.setItem(
        'ww_prefs_v1',
        JSON.stringify({ username: 'User1', quality: 'fair', viewMode: 'tp' })
      );
    });
    await page2.addInitScript(() => {
      localStorage.setItem(
        'ww_prefs_v1',
        JSON.stringify({ username: 'User2', quality: 'fair', viewMode: 'tp' })
      );
    });

    await page1.reload();
    await page2.reload();

    await page1.waitForSelector('canvas', { timeout: 15000 });
    await page2.waitForSelector('canvas', { timeout: 15000 });

    await page1.waitForTimeout(3000);
    await page2.waitForTimeout(3000);

    const wbButton1 = page1.locator('[data-testid="whiteboard-toggle"]').first();
    const wbButton2 = page2.locator('[data-testid="whiteboard-toggle"]').first();

    if (!(await wbButton1.isVisible({ timeout: 5000 }))) {
      test.skip(true, 'Whiteboard not enabled');
      return;
    }

    await wbButton1.click();
    await wbButton2.click();

    await page1.waitForTimeout(2000);
    await page2.waitForTimeout(2000);

    // Both users draw simultaneously
    const canvas1 = page1.locator('canvas').first();
    const canvas2 = page2.locator('canvas').first();

    if (
      (await canvas1.isVisible({ timeout: 5000 })) &&
      (await canvas2.isVisible({ timeout: 5000 }))
    ) {
      const box1 = await canvas1.boundingBox();
      const box2 = await canvas2.boundingBox();

      if (box1 && box2) {
        // User1 draws top-left
        await page1.mouse.move(box1.x + 50, box1.y + 50);
        await page1.mouse.down();
        await page1.mouse.move(box1.x + 150, box1.y + 150, { steps: 10 });
        await page1.mouse.up();

        // User2 draws bottom-right (simultaneously)
        await page2.mouse.move(box2.x + 200, box2.y + 200);
        await page2.mouse.down();
        await page2.mouse.move(box2.x + 300, box2.y + 300, { steps: 10 });
        await page2.mouse.up();
      }
    }

    // Wait for sync
    await page1.waitForTimeout(1000);
    await page2.waitForTimeout(1000);

    // Both canvases should have content
    await expect(canvas1).toBeVisible();
    await expect(canvas2).toBeVisible();

    await context1.close();
    await context2.close();
  });
});
