import { ThreeXRAdapter } from './ThreeXRAdapter.js';
import type { IXRAdapter } from './XRAdapter.js';

/**
 * Creates an XR adapter based on environment flags.
 * Supports Three.js WebXR (default) and optional VerseEngine integration.
 *
 * @returns Promise that resolves to an XR adapter or null if XR is disabled
 */
export async function createXRAdapter(): Promise<IXRAdapter | null> {
  // Check if XR is enabled
  const xrEnabled =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (import.meta as any).env?.VITE_XR_ENABLED !== 'false';
  if (!xrEnabled) {
    return null;
  }

  // Check if VerseEngine is requested
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const useVerseEngine = (import.meta as any).env?.VITE_VE_ENABLED === 'true';

  if (useVerseEngine) {
    try {
      // Lazy import VerseEngine adapter (if available)
      const verseModule = await import('./VerseXRAdapter.js');
      const verseAdapter = new verseModule.VerseXRAdapter();

      // Check if VerseEngine is actually supported
      if (await verseAdapter.supported()) {
        return verseAdapter;
      }

      // Fallback to Three.js if VerseEngine is not available
      console.warn('VerseEngine not available, falling back to Three.js WebXR');
    } catch (error) {
      console.warn('Failed to load VerseEngine adapter, falling back to Three.js:', error);
    }
  }

  // Default to Three.js WebXR
  return new ThreeXRAdapter();
}
