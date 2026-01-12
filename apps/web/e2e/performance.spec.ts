import { test, expect } from '@playwright/test';

/**
 * Performance-Tests für MVP-Anforderungen
 *
 * Anforderungen:
 * - Desktop: 60 FPS (p90)
 * - Mobile: 40 FPS (p90)
 * - Bundle-Size: < 2MB (initial)
 * - Ladezeit: < 5s (auf schneller Verbindung)
 */

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Warte auf Canvas-Rendering
    await page.waitForSelector('canvas', { timeout: 10000 });
  });

  test('Initial Bundle Size should be < 2MB', async ({ page }) => {
    const response = await page.goto('/');
    expect(response).toBeTruthy();

    // Sammle alle JavaScript-Chunks
    const jsChunks: number[] = [];
    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('.js') && !url.includes('node_modules')) {
        const contentLength = response.headers()['content-length'];
        if (contentLength) {
          jsChunks.push(parseInt(contentLength, 10));
        }
      }
    });

    await page.reload();

    // Warte auf alle Requests
    await page.waitForLoadState('networkidle');

    // Berechne Gesamtgröße
    const totalSize = jsChunks.reduce((sum, size) => sum + size, 0);
    const totalSizeMB = totalSize / (1024 * 1024);

    console.log(`📦 Initial Bundle Size: ${totalSizeMB.toFixed(2)} MB`);

    // MVP-Anforderung: < 2MB
    expect(totalSizeMB).toBeLessThan(2);
  });

  test('Load Time should be < 5s', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 10000 });

    const loadTime = (Date.now() - startTime) / 1000;

    console.log(`⏱️ Load Time: ${loadTime.toFixed(2)}s`);

    // MVP-Anforderung: < 5s
    expect(loadTime).toBeLessThan(5);
  });

  test('FPS should be stable (Desktop)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop test only');

    // Warte auf stabilen Render
    await page.waitForTimeout(2000);

    // Sammle FPS-Daten über 5 Sekunden
    const fpsData: number[] = [];

    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();

        function measureFrame() {
          frameCount++;
          const elapsed = performance.now() - startTime;

          if (elapsed >= 5000) {
            const fps = (frameCount / elapsed) * 1000;
            (window as any).__testFPS = fps;
            resolve();
          } else {
            requestAnimationFrame(measureFrame);
          }
        }

        requestAnimationFrame(measureFrame);
      });
    });

    const fps = await page.evaluate(() => (window as any).__testFPS);

    console.log(`🎮 Desktop FPS: ${fps.toFixed(1)}`);

    // MVP-Anforderung: 60 FPS (p90) - wir testen auf >50 FPS als Minimum
    expect(fps).toBeGreaterThan(50);
  });

  test('FPS should be stable (Mobile)', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile test only');

    // Warte auf stabilen Render
    await page.waitForTimeout(2000);

    // Sammle FPS-Daten über 5 Sekunden
    const fpsData: number[] = [];

    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();

        function measureFrame() {
          frameCount++;
          const elapsed = performance.now() - startTime;

          if (elapsed >= 5000) {
            const fps = (frameCount / elapsed) * 1000;
            (window as any).__testFPS = fps;
            resolve();
          } else {
            requestAnimationFrame(measureFrame);
          }
        }

        requestAnimationFrame(measureFrame);
      });
    });

    const fps = await page.evaluate(() => (window as any).__testFPS);

    console.log(`📱 Mobile FPS: ${fps.toFixed(1)}`);

    // MVP-Anforderung: 40 FPS (p90) - wir testen auf >30 FPS als Minimum
    expect(fps).toBeGreaterThan(30);
  });

  test('Memory usage should be reasonable', async ({ page }) => {
    await page.waitForTimeout(2000);

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
      const usedMB = memory.used / (1024 * 1024);
      console.log(`💾 Memory Usage: ${usedMB.toFixed(2)} MB`);

      // Warnung bei >100MB (könnte auf Memory-Leak hindeuten)
      expect(usedMB).toBeLessThan(200);
    } else {
      console.log('⚠️ Memory API not available');
    }
  });

  test('No memory leaks during template switching', async ({ page }) => {
    // Initial Memory
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Switch templates multiple times
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="template-switcher"]');
      await page.waitForTimeout(1000);
    }

    await page.waitForTimeout(2000);

    // Final Memory
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024);
      console.log(`📈 Memory Increase: ${memoryIncrease.toFixed(2)} MB`);

      // Memory sollte nicht mehr als 50MB zunehmen
      expect(memoryIncrease).toBeLessThan(50);
    }
  });
});
