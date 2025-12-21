import type { WebGLRenderer, Scene, PerspectiveCamera } from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

import type { IXRAdapter } from './XRAdapter.js';

/**
 * Three.js WebXR adapter implementation.
 * Uses Three.js built-in WebXR support.
 */
export class ThreeXRAdapter implements IXRAdapter {
  private startCallbacks = new Set<() => void>();
  private endCallbacks = new Set<() => void>();
  private vrButton: HTMLElement | null = null;

  async supported(): Promise<boolean> {
    if (typeof navigator === 'undefined') return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const xr = (navigator as any).xr;
    if (!xr || !xr.isSessionSupported) return false;
    try {
      return await xr.isSessionSupported('immersive-vr');
    } catch {
      return false;
    }
  }

  async enable(renderer: WebGLRenderer, scene: Scene, _camera: PerspectiveCamera): Promise<void> {
    if (!renderer.xr) {
      console.warn('WebXR not supported on this renderer');
      return;
    }

    renderer.xr.enabled = true;

    // Create VR button
    this.vrButton = VRButton.createButton(renderer);
    if (!this.vrButton) {
      console.warn('Failed to create VR button');
      return;
    }
    this.vrButton.id = 'vr-button';
    this.vrButton.style.position = 'absolute';
    this.vrButton.style.top = '20px';
    this.vrButton.style.right = '20px';

    // Only add button if it doesn't already exist
    if (!document.getElementById('vr-button')) {
      document.body.appendChild(this.vrButton);
    }

    // Controller placeholders for both hands
    const controller1 = renderer.xr.getController(0);
    scene.add(controller1);

    const controller2 = renderer.xr.getController(1);
    scene.add(controller2);

    // Session lifecycle hooks
    renderer.xr.addEventListener('sessionstart', () => {
      this.startCallbacks.forEach((cb) => cb());
    });

    renderer.xr.addEventListener('sessionend', () => {
      this.endCallbacks.forEach((cb) => cb());
    });
  }

  onStart(callback: () => void): void {
    this.startCallbacks.add(callback);
  }

  onEnd(callback: () => void): void {
    this.endCallbacks.add(callback);
  }

  dispose(): void {
    if (this.vrButton && this.vrButton.parentNode) {
      this.vrButton.parentNode.removeChild(this.vrButton);
    }
    this.startCallbacks.clear();
    this.endCallbacks.clear();
  }
}
