import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  ACESFilmicToneMapping,
  Color,
  PMREMGenerator,
  Clock,
  Vector3,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TemplateHost } from './TemplateHost';
import { XRSetup } from './xr/XRSetup';
import { PostProcessing } from './render/Post';
import { getFeatureFlags } from './FeatureFlags';
import type { TemplateInstance } from '@metaverse/core';

export class World {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private templateHost: TemplateHost;
  private xrSetup: XRSetup;
  private postProcessing: PostProcessing;
  private clock: Clock;
  private animationFrameId: number | null = null;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;

    // Scene
    this.scene = new Scene();
    this.scene.background = new Color(0x000000);

    // Camera
    this.camera = new PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);

    // Renderer
    this.renderer = new WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = 'srgb';
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 100;

    // Template Host
    this.templateHost = new TemplateHost(this.scene);

    // XR Setup
    const flags = getFeatureFlags();
    if (flags.XR_ENABLED) {
      this.xrSetup = new XRSetup(this.renderer);
    }

    // Post Processing
    this.postProcessing = new PostProcessing(this.renderer, this.scene, this.camera);

    // Clock
    this.clock = new Clock();

    // Resize handler
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  async init(): Promise<void> {
    const flags = getFeatureFlags();

    // Load default template
    await this.templateHost.loadTemplate(flags.TEMPLATE_ID);

    // Start render loop
    this.animate();
  }

  private handleResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.postProcessing.setSize(width, height);
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    // Update controls
    this.controls.update();

    // Update template host
    this.templateHost.update(delta);

    // Render
    this.postProcessing.render(delta);
  }

  getScene(): Scene {
    return this.scene;
  }

  getCamera(): PerspectiveCamera {
    return this.camera;
  }

  getRenderer(): WebGLRenderer {
    return this.renderer;
  }

  getCurrentTemplate(): TemplateInstance | null {
    return this.templateHost.getCurrentTemplate();
  }

  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    window.removeEventListener('resize', this.handleResize.bind(this));

    this.templateHost.dispose();
    this.postProcessing.dispose();
    this.controls.dispose();
    this.renderer.dispose();

    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

