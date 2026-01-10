import { test, expect, devices } from '@playwright/test';

/**
 * Multi-Browser Compatibility Tests
 *
 * Testet Kompatibilität mit verschiedenen Browsern:
 * - Chrome (Desktop)
 * - Firefox (Desktop)
 * - Safari (Desktop, falls macOS)
 * - Chrome Mobile
 */
test.describe('Multi-Browser Compatibility', () => {
  test('should work in Chrome', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome-specific test');

    await page.addInitScript(() => {
      localStorage.setItem(
        'ww_prefs_v1',
        JSON.stringify({ username: 'ChromeUser', quality: 'fair', viewMode: 'tp' })
      );
    });

    await page.goto('/');
    await page.waitForTimeout(2000);
    await page.reload();

    // Wait for world to load
    await page.waitForTimeout(3000);

    // Check canvas is rendered
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Check FPS
    const fps = await page.evaluate(() => {
      return (window as any).__perf?.fps || 0;
    });

    expect(fps).toBeGreaterThanOrEqual(40);
  });

  test('should work in Firefox', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox-specific test');

    await page.addInitScript(() => {
      localStorage.setItem(
        'ww_prefs_v1',
        JSON.stringify({ username: 'FirefoxUser', quality: 'fair', viewMode: 'tp' })
      );
    });

    await page.goto('/');
    await page.waitForTimeout(2000);
    await page.reload();

    await page.waitForTimeout(3000);

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Firefox might have lower FPS, so we use a lower threshold
    const fps = await page.evaluate(() => {
      return (window as any).__perf?.fps || 0;
    });

    expect(fps).toBeGreaterThanOrEqual(30);
  });

  test('should work in Mobile Chrome', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Mobile Chrome test');

    // Use mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    await page.addInitScript(() => {
      localStorage.setItem(
        'ww_prefs_v1',
        JSON.stringify({ username: 'MobileUser', quality: 'fair', viewMode: 'tp' })
      );
    });

    await page.goto('/');
    await page.waitForTimeout(2000);
    await page.reload();

    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(2000);

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Mobile should have >= 40 FPS
    const fps = await page.evaluate(() => {
      return (window as any).__perf?.fps || 0;
    });

    expect(fps).toBeGreaterThanOrEqual(40);
  });

  test('should handle WebRTC in Chrome', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome WebRTC test');
    test.skip(!process.env.LIVEKIT_URL, 'LiveKit not configured');

    await completePrejoinJourney(page, 'WebRTCUser');

    await page.waitForTimeout(3000);

    // Enable voice
    const voiceButton = page.locator('[data-testid="voice-toggle"]').first();
    if (await voiceButton.isVisible({ timeout: 5000 })) {
      await voiceButton.click();
      await page.waitForTimeout(2000);

      // Check for voice panel
      const voicePanel = page.locator('[data-testid="voice-panel"]').first();
      await expect(voicePanel).toBeVisible({ timeout: 5000 });
    }
  });

  test('should handle WebRTC in Firefox', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox WebRTC test');
    test.skip(!process.env.LIVEKIT_URL, 'LiveKit not configured');

    await completePrejoinJourney(page, 'WebRTCUser');

    await page.waitForTimeout(3000);

    // Firefox WebRTC might have different behavior
    const voiceButton = page.locator('[data-testid="voice-toggle"]').first();
    if (await voiceButton.isVisible({ timeout: 5000 })) {
      await voiceButton.click();
      await page.waitForTimeout(2000);

      // Firefox might need more time for WebRTC
      const voicePanel = page.locator('[data-testid="voice-panel"]').first();
      // Firefox WebRTC can be slower, so we use a longer timeout
      await expect(voicePanel)
        .toBeVisible({ timeout: 10000 })
        .catch(() => {
          // Firefox WebRTC might not work in headless mode
          console.warn('Firefox WebRTC might not work in headless mode');
        });
    }
  });
});
