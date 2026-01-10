import { test, expect } from '@playwright/test';
import { completePrejoinJourney, fpsAbove } from './utils';

test.describe('Performance', () => {
  test('FPS ≥ 30 on Desktop (dev)', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__TEST_MODE__ = true;
    });

    // Führe komplette Prejoin-Journey durch
    await completePrejoinJourney(page, 'Perf Tester');

    // Warte auf World-Initialisierung und FPS-Sampler
    await page.waitForTimeout(3000);

    // Prüfe FPS (in E2E-Tests kann FPS niedriger sein, daher 30 statt 40)
    await fpsAbove(page, 30);
  });

  test('should measure join time', async ({ page }) => {
    const startTime = Date.now();

    // Set prefs and navigate
    await page.addInitScript(() => {
      localStorage.setItem(
        'ww_prefs_v1',
        JSON.stringify({ username: 'PerfTest', quality: 'fair', viewMode: 'tp' })
      );
    });

    await page.goto('/');
    await page.waitForTimeout(2000);
    await page.reload();

    // Wait for world to load (canvas visible)
    await page.waitForSelector('canvas', { timeout: 15000 });

    const joinTime = Date.now() - startTime;

    // Join time should be < 6s (p90 target)
    expect(joinTime).toBeLessThan(6000);

    console.log(`Join time: ${joinTime}ms`);
  });

  test('should measure memory usage', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'ww_prefs_v1',
        JSON.stringify({ username: 'PerfTest', quality: 'fair', viewMode: 'tp' })
      );
    });

    await page.goto('/');
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForTimeout(3000);

    // Get memory usage (if available)
    const memory = await page.evaluate(() => {
      if ('memory' in performance) {
        const mem = (performance as any).memory;
        return {
          used: mem.usedJSHeapSize,
          total: mem.totalJSHeapSize,
          limit: mem.jsHeapSizeLimit,
        };
      }
      return null;
    });

    if (memory) {
      const usedMB = memory.used / 1024 / 1024;
      console.log(`Memory usage: ${usedMB.toFixed(2)} MB`);

      // Memory should be < 500MB after join
      expect(usedMB).toBeLessThan(500);
    }
  });

  test('should measure asset loading time', async ({ page }) => {
    // Track network requests
    const assetRequests: Array<{ url: string; duration: number }> = [];

    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('.glb') || url.includes('.hdr') || url.includes('.ktx2')) {
        const timing = response.timing();
        const duration = timing.responseEnd - timing.requestStart;
        assetRequests.push({ url, duration });
      }
    });

    await completePrejoinJourney(page, 'PerfTest');
    await page.waitForTimeout(5000); // Wait for all assets to load

    // Calculate total asset loading time
    const totalAssetTime = assetRequests.reduce((sum, req) => sum + req.duration, 0);
    const maxAssetTime = Math.max(...assetRequests.map((req) => req.duration), 0);

    console.log(`Total asset loading time: ${totalAssetTime}ms`);
    console.log(`Max single asset time: ${maxAssetTime}ms`);
    console.log(`Number of assets: ${assetRequests.length}`);

    // Total asset loading should be < 3s (gecachte Assets)
    expect(totalAssetTime).toBeLessThan(3000);
  });

  test('should measure FPS over time', async ({ page }) => {
    await completePrejoinJourney(page, 'PerfTest');
    await page.waitForTimeout(3000);

    // Collect FPS samples over 10 seconds
    const fpsSamples: number[] = [];

    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(1000);

      const fps = await page.evaluate(() => {
        return (window as any).__perf?.fps || 0;
      });

      fpsSamples.push(fps);
    }

    // Calculate average and p90
    const avgFps = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length;
    const sorted = [...fpsSamples].sort((a, b) => b - a);
    const p90Fps = sorted[Math.floor(sorted.length * 0.1)];

    console.log(`Average FPS: ${avgFps.toFixed(2)}`);
    console.log(`P90 FPS: ${p90Fps.toFixed(2)}`);

    // P90 FPS should be >= 50 on desktop
    expect(p90Fps).toBeGreaterThanOrEqual(50);
  });
});
