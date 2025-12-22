/**
 * Interface for XR adapters.
 * Allows swapping between different XR implementations (Three.js, VerseEngine, etc.)
 */
export interface IXRAdapter {
  /**
   * Checks if XR is supported on this device.
   * @returns Promise that resolves to true if XR is supported
   */
  supported(): Promise<boolean>;

  /**
   * Enables XR mode on the renderer, scene, and camera.
   * @param renderer - WebGLRenderer instance
   * @param scene - Scene instance
   * @param camera - PerspectiveCamera instance
   */
  enable(renderer: unknown, scene: unknown, camera: unknown): Promise<void>;

  /**
   * Registers a callback for when XR session starts.
   * @param callback - Function to call when XR session starts
   */
  onStart?(callback: () => void): void;

  /**
   * Registers a callback for when XR session ends.
   * @param callback - Function to call when XR session ends
   */
  onEnd?(callback: () => void): void;
}
