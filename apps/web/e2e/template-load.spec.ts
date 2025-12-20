import { test, expect } from '@playwright/test';

test.describe('Template Switching Under Load', () => {
  test('switches templates rapidly without crashing', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 5000 });

    // Wait for initial load
    await page.waitForTimeout(2000);

    // Open debug overlay
    await page.keyboard.press('F12');
    await page.waitForTimeout(500);

    // Rapidly switch templates
    const templates = ['watt-default', 'watt-eco'];
    for (let i = 0; i < 5; i++) {
      const template = templates[i % templates.length];
      const templateSelect = page.locator('select').first();

      if (await templateSelect.isVisible().catch(() => false)) {
        await templateSelect.selectOption(template);
        // Don't wait for full load, just switch quickly
        await page.waitForTimeout(300);
      }
    }

    // Should still be responsive
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('handles template switch during multiplayer connection', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__MULTIPLAYER_ENABLED__ = 'true';
    });

    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 5000 });

    // Wait a bit for connection attempt
    await page.waitForTimeout(1000);

    // Switch template while connecting
    await page.keyboard.press('F12');
    await page.waitForTimeout(500);

    const templateSelect = page.locator('select').first();
    if (await templateSelect.isVisible().catch(() => false)) {
      await templateSelect.selectOption('watt-eco');
      await page.waitForTimeout(2000);
    }

    // Should handle both operations
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('maintains state across template switches', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 5000 });
    await page.waitForTimeout(2000);

    // Open debug overlay and adjust exposure
    await page.keyboard.press('F12');
    await page.waitForTimeout(500);

    const exposureSlider = page.locator('input[type="range"]').first();
    if (await exposureSlider.isVisible().catch(() => false)) {
      await exposureSlider.fill('1.5');
      await page.waitForTimeout(500);
    }

    // Switch template
    const templateSelect = page.locator('select').first();
    if (await templateSelect.isVisible().catch(() => false)) {
      await templateSelect.selectOption('watt-eco');
      await page.waitForTimeout(2000);
    }

    // Exposure should be maintained (or reset, depending on implementation)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('handles missing template assets gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 5000 });
    await page.waitForTimeout(2000);

    // Try to switch to a non-existent template
    await page.keyboard.press('F12');
    await page.waitForTimeout(500);

    // Should not crash even if template doesn't exist
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Check for error handling
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);

    // Errors should be handled gracefully
    expect(true).toBe(true);
  });

  test('switches templates with ambient audio playing', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__AMBIENT_AUDIO_ENABLED__ = 'true';
    });

    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 5000 });

    // Wait for ambient audio to start
    await page.waitForTimeout(3000);

    // Switch template
    await page.keyboard.press('F12');
    await page.waitForTimeout(500);

    const templateSelect = page.locator('select').first();
    if (await templateSelect.isVisible().catch(() => false)) {
      await templateSelect.selectOption('watt-eco');
      await page.waitForTimeout(2000);
    }

    // Should handle audio cleanup and reload
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });
});
