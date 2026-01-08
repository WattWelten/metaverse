import { WebGLRenderer } from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

export class XRSetup {
  private renderer: WebGLRenderer;
  private vrButton: HTMLElement | null = null;

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer;
    this.init();
  }

  private init(): void {
    if (!this.renderer.xr) {
      console.warn('WebXR not supported');
      return;
    }

    this.renderer.xr.enabled = true;
    this.vrButton = VRButton.createButton(this.renderer);
    this.vrButton.style.position = 'absolute';
    this.vrButton.style.top = '20px';
    this.vrButton.style.right = '20px';
    document.body.appendChild(this.vrButton);
  }

  dispose(): void {
    if (this.vrButton && this.vrButton.parentNode) {
      this.vrButton.parentNode.removeChild(this.vrButton);
    }
  }
}
