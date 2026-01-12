/**
 * Performance monitoring utility
 * Tracks FPS, memory usage, and performance metrics
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number; // ms
  memoryUsage?: number; // MB (if available)
  drawCalls?: number;
  triangles?: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 samples
  private frameCount = 0;
  private lastFrameTime = performance.now();
  private fps = 0;
  private frameTime = 0;

  /**
   * Record a frame
   */
  recordFrame(): void {
    const now = performance.now();
    this.frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    this.frameCount++;

    // Calculate FPS (rolling average over last 60 frames)
    if (this.frameCount % 60 === 0) {
      this.fps = 1000 / (this.frameTime || 16.67);
    }

    const metric: PerformanceMetrics = {
      fps: this.fps,
      frameTime: this.frameTime,
      timestamp: now,
    };

    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as Performance & { memory: { usedJSHeapSize: number } }).memory;
      metric.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }

    this.metrics.push(metric);

    // Keep only last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps;
  }

  /**
   * Get current frame time
   */
  getFrameTime(): number {
    return this.frameTime;
  }

  /**
   * Get average FPS over last N frames
   */
  getAverageFPS(samples = 60): number {
    const recent = this.metrics.slice(-samples);
    if (recent.length === 0) return 0;
    const sum = recent.reduce((acc, m) => acc + m.fps, 0);
    return sum / recent.length;
  }

  /**
   * Get average frame time over last N frames
   */
  getAverageFrameTime(samples = 60): number {
    const recent = this.metrics.slice(-samples);
    if (recent.length === 0) return 0;
    const sum = recent.reduce((acc, m) => acc + m.frameTime, 0);
    return sum / recent.length;
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    currentFPS: number;
    averageFPS: number;
    minFPS: number;
    maxFPS: number;
    averageFrameTime: number;
    memoryUsage?: number;
  } {
    const recent = this.metrics.slice(-60); // Last 60 frames
    if (recent.length === 0) {
      return {
        currentFPS: 0,
        averageFPS: 0,
        minFPS: 0,
        maxFPS: 0,
        averageFrameTime: 0,
      };
    }

    const fpsValues = recent.map((m) => m.fps).filter((f) => f > 0);
    const frameTimes = recent.map((m) => m.frameTime);
    const memoryValues = recent
      .map((m) => m.memoryUsage)
      .filter((m): m is number => m !== undefined);

    return {
      currentFPS: this.fps,
      averageFPS:
        fpsValues.length > 0 ? fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length : 0,
      minFPS: fpsValues.length > 0 ? Math.min(...fpsValues) : 0,
      maxFPS: fpsValues.length > 0 ? Math.max(...fpsValues) : 0,
      averageFrameTime: frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length,
      memoryUsage: memoryValues.length > 0 ? memoryValues[memoryValues.length - 1] : undefined,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.frameCount = 0;
    this.fps = 0;
    this.frameTime = 0;
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}
