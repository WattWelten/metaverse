/**
 * Window interface extensions for global state and debugging
 */

interface Window {
  /**
   * Template manifest (set by App.tsx for debugging)
   */
  __templateManifest?: unknown;

  /**
   * World instance debug info
   */
  __world?: {
    kine?: {
      speed: number;
      yawDelta: number;
    };
  };

  /**
   * Performance monitoring
   */
  __perf?: {
    fps: number;
    frames: number;
    t: number;
  };

  /**
   * Console errors (test mode only)
   */
  __errors?: Array<unknown>;

  /**
   * Feature flags (set by App.tsx)
   */
  __featureFlags?: Record<string, boolean | string | undefined>;

  /**
   * RPM API key warning flag
   */
  __warnedRpmKey?: boolean;

  /**
   * Test mode flag
   */
  __TEST_MODE__?: boolean;

  /**
   * Port configuration (for YWS)
   */
  PORT?: number;
  YWS_PORT?: number;
}
