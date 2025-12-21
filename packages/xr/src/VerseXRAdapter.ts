import type { IXRAdapter } from './XRAdapter.js';

/**
 * VerseEngine XR adapter (stub implementation).
 * This is a placeholder for future VerseEngine integration.
 * Falls back to ThreeXRAdapter if VerseEngine is not available.
 */
export class VerseXRAdapter implements IXRAdapter {
  async supported(): Promise<boolean> {
    // TODO: Check if VerseEngine is available
    // For now, always return false to use Three.js fallback
    try {
      // Future: Check for VerseEngine availability
      // const verse = await import('@verseengine/...');
      // return verse.isAvailable();
      return false;
    } catch {
      return false;
    }
  }

  async enable(
    _renderer: unknown,

    _scene: unknown,

    _camera: unknown
  ): Promise<void> {
    // TODO: Initialize VerseEngine world here
    // For now, this is a no-op
    console.warn('VerseEngine adapter is not yet implemented');
  }

  onStart?(_callback: () => void): void {
    // No-op for now
  }

  onEnd?(_callback: () => void): void {
    // No-op for now
  }
}
