/**
 * Performance Test Utilities
 *
 * Helper functions for collecting and analyzing performance metrics
 */

export interface PerformanceMetrics {
  joinTime: number;
  fps: {
    average: number;
    p90: number;
    p95: number;
    min: number;
    max: number;
  };
  memory: {
    used: number;
    total: number;
    limit: number;
  } | null;
  assetLoading: {
    totalTime: number;
    maxTime: number;
    count: number;
    assets: Array<{ url: string; duration: number }>;
  };
  network: {
    totalRequests: number;
    totalSize: number;
    cachedRequests: number;
  };
}

/**
 * Collect performance metrics from page
 */
export async function collectPerformanceMetrics(page: any): Promise<PerformanceMetrics> {
  // Collect FPS samples
  const fpsSamples: number[] = [];
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(1000);
    const fps = await page.evaluate(() => {
      return (window as any).__perf?.fps || 0;
    });
    fpsSamples.push(fps);
  }

  // Calculate FPS statistics
  const sortedFps = [...fpsSamples].sort((a, b) => a - b);
  const avgFps = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length;
  const p90Fps = sortedFps[Math.floor(sortedFps.length * 0.9)];
  const p95Fps = sortedFps[Math.floor(sortedFps.length * 0.95)];

  // Get memory usage
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

  // Get network metrics
  const network = await page.evaluate(() => {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return {
      totalRequests: entries.length,
      totalSize: entries.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
      cachedRequests: entries.filter((entry) => entry.transferSize === 0).length,
    };
  });

  return {
    joinTime: 0, // Should be measured separately
    fps: {
      average: avgFps,
      p90: p90Fps,
      p95: p95Fps,
      min: Math.min(...fpsSamples),
      max: Math.max(...fpsSamples),
    },
    memory,
    assetLoading: {
      totalTime: 0,
      maxTime: 0,
      count: 0,
      assets: [],
    },
    network,
  };
}

/**
 * Measure join time
 */
export async function measureJoinTime(page: any, startTime: number): Promise<number> {
  await page.waitForSelector('canvas', { timeout: 15000 });
  return Date.now() - startTime;
}

/**
 * Track asset loading
 */
export async function trackAssetLoading(
  page: any
): Promise<Array<{ url: string; duration: number }>> {
  const assets: Array<{ url: string; duration: number }> = [];

  page.on('response', (response: any) => {
    const url = response.url();
    if (
      url.includes('.glb') ||
      url.includes('.hdr') ||
      url.includes('.ktx2') ||
      url.includes('.gltf')
    ) {
      const timing = response.timing();
      const duration = timing.responseEnd - timing.requestStart;
      assets.push({ url, duration });
    }
  });

  return assets;
}

/**
 * Assert performance metrics meet targets
 */
export function assertPerformanceTargets(metrics: PerformanceMetrics): void {
  // Join time p90 < 6s
  if (metrics.joinTime > 0) {
    expect(metrics.joinTime).toBeLessThan(6000);
  }

  // FPS p90 >= 50 (Desktop)
  expect(metrics.fps.p90).toBeGreaterThanOrEqual(50);

  // Memory < 500MB
  if (metrics.memory) {
    const usedMB = metrics.memory.used / 1024 / 1024;
    expect(usedMB).toBeLessThan(500);
  }

  // Asset loading < 3s (total)
  if (metrics.assetLoading.totalTime > 0) {
    expect(metrics.assetLoading.totalTime).toBeLessThan(3000);
  }
}

/**
 * Log performance metrics
 */
export function logPerformanceMetrics(metrics: PerformanceMetrics): void {
  console.log('=== Performance Metrics ===');
  console.log(`Join Time: ${metrics.joinTime}ms`);
  console.log(
    `FPS - Average: ${metrics.fps.average.toFixed(2)}, P90: ${metrics.fps.p90.toFixed(2)}, P95: ${metrics.fps.p95.toFixed(2)}`
  );
  console.log(`FPS - Min: ${metrics.fps.min}, Max: ${metrics.fps.max}`);

  if (metrics.memory) {
    const usedMB = metrics.memory.used / 1024 / 1024;
    const totalMB = metrics.memory.total / 1024 / 1024;
    const limitMB = metrics.memory.limit / 1024 / 1024;
    console.log(
      `Memory - Used: ${usedMB.toFixed(2)} MB, Total: ${totalMB.toFixed(2)} MB, Limit: ${limitMB.toFixed(2)} MB`
    );
  }

  console.log(
    `Asset Loading - Total: ${metrics.assetLoading.totalTime}ms, Max: ${metrics.assetLoading.maxTime}ms, Count: ${metrics.assetLoading.count}`
  );
  console.log(
    `Network - Requests: ${metrics.network.totalRequests}, Size: ${(metrics.network.totalSize / 1024).toFixed(2)} KB, Cached: ${metrics.network.cachedRequests}`
  );
  console.log('===========================');
}
