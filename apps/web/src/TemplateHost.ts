import {
  templateRegistry,
  type TemplateInstance,
  type TemplateManifest,
  pmremCache,
} from '@metaverse/core';
import { useGLTFCache } from '@metaverse/core';
import {
  Scene,
  Object3D,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  AmbientLight,
  DirectionalLight,
  Color,
  WebGLRenderer,
} from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export class TemplateHost {
  private scene: Scene;
  private currentTemplate: TemplateInstance | null = null;
  private renderer: WebGLRenderer | null = null;
  private lights: Object3D[] = [];
  private loadingAbortController: AbortController | null = null;
  private lodObjects: Map<
    Object3D,
    { lod0: Object3D | null; lod1: Object3D | null; lod2: Object3D | null }
  > = new Map();
  private lastLodCheck = 0;
  private readonly LOD_CHECK_INTERVAL = 250; // ms
  private camera: { position: { x: number; y: number; z: number } } | null = null;

  constructor(scene: Scene, renderer?: WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer || null;
  }

  setCamera(camera: { position: { x: number; y: number; z: number } }): void {
    this.camera = camera;
  }

  async loadTemplate(templateId: string): Promise<void> {
    // Abort previous load if still in progress
    if (this.loadingAbortController) {
      this.loadingAbortController.abort();
    }

    this.loadingAbortController = new AbortController();
    const signal = this.loadingAbortController.signal;

    try {
      // Register default template loader if not already registered
      if (!templateRegistry.getCurrentInstance()) {
        templateRegistry.register('watt-default', this.createDefaultTemplateLoader());
      }

      // Check if aborted before loading
      if (signal.aborted) {
        return;
      }

      const instance = await templateRegistry.load(templateId, this.scene);

      // Check if aborted after loading
      if (signal.aborted) {
        // Cleanup the loaded instance
        instance.unmount();
        return;
      }

      this.currentTemplate = instance;
      this.loadingAbortController = null;
    } catch (error) {
      // Ignore abort errors
      if (signal.aborted) {
        return;
      }

      console.error(`Failed to load template "${templateId}":`, error);
      // Fallback to default
      if (templateId !== 'watt-default') {
        await this.loadTemplate('watt-default');
      }
    }
  }

  private createDefaultTemplateLoader() {
    return async (manifest: TemplateManifest): Promise<TemplateInstance> => {
      let sceneObject: Object3D | null = null;

      // Try to load scene.glb, fallback to generated scene
      try {
        sceneObject = await useGLTFCache(`/templates/${manifest.name}/scene.glb`);
      } catch {
        // Generate a simple default scene
        sceneObject = this.createDefaultScene();
      }

      // Detect and organize LOD nodes
      const lodMap = this.detectLODNodes(sceneObject);

      return {
        manifest,
        scene: sceneObject,
        mount: async (scene: Scene) => {
          if (sceneObject) {
            scene.add(sceneObject);
            // Initialize LOD visibility
            this.initializeLOD(lodMap);
          }
          // Apply lighting from manifest
          await this.applyLighting(manifest);
        },
        unmount: () => {
          if (sceneObject) {
            this.scene.remove(sceneObject);
            // Cleanup LOD tracking
            lodMap.forEach((_lod, obj) => this.lodObjects.delete(obj));
          }
          // Remove lighting
          this.removeLighting();
        },
        applyTheme: () => {
          // Theme application logic
        },
      };
    };
  }

  private createDefaultScene(): Object3D {
    const group = new Object3D();

    // Ground plane
    const groundGeometry = new BoxGeometry(20, 0.1, 20);
    const groundMaterial = new MeshStandardMaterial({ color: 0x333333 });
    const ground = new Mesh(groundGeometry, groundMaterial);
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    group.add(ground);

    // Some cubes for visual interest
    for (let i = 0; i < 5; i++) {
      const geometry = new BoxGeometry(1, 1, 1);
      const material = new MeshStandardMaterial({
        color: Math.random() * 0xffffff,
      });
      const cube = new Mesh(geometry, material);
      cube.position.set((Math.random() - 0.5) * 10, 0.5, (Math.random() - 0.5) * 10);
      cube.castShadow = true;
      group.add(cube);
    }

    return group;
  }

  getCurrentTemplate(): TemplateInstance | null {
    return this.currentTemplate;
  }

  update(delta: number): void {
    // Update template animations, etc.
    // LOD switching (throttled)
    const now = Date.now();
    if (now - this.lastLodCheck >= this.LOD_CHECK_INTERVAL && this.camera) {
      this.updateLOD();
      this.lastLodCheck = now;
    }
  }

  private async applyLighting(manifest: TemplateManifest): Promise<void> {
    if (!manifest.lighting) return;

    // Entferne alte Lichter
    this.removeLighting();

    // HDRI laden (wenn vorhanden)
    const hdriPath = manifest.lighting?.hdri;
    if (hdriPath && typeof hdriPath === 'string' && this.renderer) {
      try {
        // Prüfe Cache zuerst
        let envMap = pmremCache.getCached(hdriPath);

        if (!envMap) {
          const pmremGenerator = pmremCache.getGenerator(this.renderer);

          const rgbeLoader = new RGBELoader();
          const hdri = await new Promise<unknown>((resolve, reject) => {
            rgbeLoader.load(hdriPath, resolve, undefined, reject);
          });

          // Type assertion für HDRI-Texture (RGBELoader gibt DataTexture zurück)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          envMap = pmremGenerator.fromEquirectangular(hdri as any).texture;
          pmremCache.setCached(hdriPath, envMap);
        }

        this.scene.environment = envMap;
        this.scene.background = envMap;
      } catch {
        console.warn(`HDRI not found: ${hdriPath}, using default lighting`);
      }
    }

    // Ambient Light
    if (manifest.lighting.ambient) {
      const ambientColor = new Color(manifest.lighting.ambient.color || '#ffffff');
      const ambientLight = new AmbientLight(
        ambientColor,
        manifest.lighting.ambient.intensity || 0.4
      );
      this.scene.add(ambientLight);
      this.lights.push(ambientLight);
    }

    // Directional Light (Key Light)
    if (manifest.lighting.directional) {
      const dirColor = new Color(manifest.lighting.directional.color || '#ffffff');
      const dirLight = new DirectionalLight(
        dirColor,
        manifest.lighting.directional.intensity || 0.8
      );

      const pos = manifest.lighting.directional.position || { x: 5, y: 10, z: 5 };
      dirLight.position.set(pos.x, pos.y, pos.z);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 50;
      dirLight.shadow.camera.left = -10;
      dirLight.shadow.camera.right = 10;
      dirLight.shadow.camera.top = 10;
      dirLight.shadow.camera.bottom = -10;

      this.scene.add(dirLight);
      this.lights.push(dirLight);
    }

    // Fill Light (optional)
    if (manifest.lighting.fill) {
      const fillColor = new Color(manifest.lighting.fill.color || '#ffffff');
      const fillLight = new DirectionalLight(fillColor, manifest.lighting.fill.intensity || 0.3);

      const pos = manifest.lighting.fill.position || { x: -5, y: 5, z: -5 };
      fillLight.position.set(pos.x, pos.y, pos.z);

      this.scene.add(fillLight);
      this.lights.push(fillLight);
    }

    // Rim Light (optional)
    if (manifest.lighting.rim) {
      const rimColor = new Color(manifest.lighting.rim.color || '#ffffff');
      const rimLight = new DirectionalLight(rimColor, manifest.lighting.rim.intensity || 0.2);

      const pos = manifest.lighting.rim.position || { x: 0, y: 5, z: -10 };
      rimLight.position.set(pos.x, pos.y, pos.z);

      this.scene.add(rimLight);
      this.lights.push(rimLight);
    }
  }

  private removeLighting(): void {
    this.lights.forEach((light) => {
      this.scene.remove(light);
      if ('dispose' in light && typeof light.dispose === 'function') {
        light.dispose();
      }
    });
    this.lights = [];
  }

  setRenderer(renderer: WebGLRenderer): void {
    this.renderer = renderer;
  }

  setCamera(camera: { position: { x: number; y: number; z: number } }): void {
    this.camera = camera;
  }

  private detectLODNodes(
    root: Object3D | null
  ): Map<Object3D, { lod0: Object3D | null; lod1: Object3D | null; lod2: Object3D | null }> {
    const lodMap = new Map<
      Object3D,
      { lod0: Object3D | null; lod1: Object3D | null; lod2: Object3D | null }
    >();

    if (!root) return lodMap;

    root.traverse((obj) => {
      const name = obj.name.toLowerCase();
      if (name.includes('_lod0') || name.includes('_lod1') || name.includes('_lod2')) {
        // Extract base name (e.g., "Turbine_LOD0" -> "Turbine")
        const baseName = name.replace(/_lod[012]/i, '').trim();
        const parent = obj.parent || root;

        if (!lodMap.has(parent)) {
          lodMap.set(parent, { lod0: null, lod1: null, lod2: null });
        }

        const lod = lodMap.get(parent)!;
        if (name.includes('_lod0')) {
          lod.lod0 = obj;
        } else if (name.includes('_lod1')) {
          lod.lod1 = obj;
        } else if (name.includes('_lod2')) {
          lod.lod2 = obj;
        }
      }
    });

    return lodMap;
  }

  private initializeLOD(
    lodMap: Map<Object3D, { lod0: Object3D | null; lod1: Object3D | null; lod2: Object3D | null }>
  ): void {
    lodMap.forEach((lod, parent) => {
      // Show LOD0 by default, hide others
      if (lod.lod0) lod.lod0.visible = true;
      if (lod.lod1) lod.lod1.visible = false;
      if (lod.lod2) lod.lod2.visible = false;
      this.lodObjects.set(parent, lod);
    });
  }

  private updateLOD(): void {
    if (!this.camera) return;

    const cameraPos = this.camera.position;
    const LOD1_DISTANCE = 40;
    const LOD2_DISTANCE = 80;

    this.lodObjects.forEach((lod, parent) => {
      // Calculate distance from camera to parent object
      const distance = Math.sqrt(
        Math.pow(parent.position.x - cameraPos.x, 2) +
          Math.pow(parent.position.y - cameraPos.y, 2) +
          Math.pow(parent.position.z - cameraPos.z, 2)
      );

      // Switch LOD based on distance
      if (distance > LOD2_DISTANCE && lod.lod2) {
        // Use LOD2
        if (lod.lod0) lod.lod0.visible = false;
        if (lod.lod1) lod.lod1.visible = false;
        lod.lod2.visible = true;
      } else if (distance > LOD1_DISTANCE && lod.lod1) {
        // Use LOD1
        if (lod.lod0) lod.lod0.visible = false;
        lod.lod1.visible = true;
        if (lod.lod2) lod.lod2.visible = false;
      } else if (lod.lod0) {
        // Use LOD0
        lod.lod0.visible = true;
        if (lod.lod1) lod.lod1.visible = false;
        if (lod.lod2) lod.lod2.visible = false;
      }
    });
  }

  dispose(): void {
    // Abort any ongoing loads
    if (this.loadingAbortController) {
      this.loadingAbortController.abort();
      this.loadingAbortController = null;
    }

    if (this.currentTemplate) {
      this.currentTemplate.unmount();
      this.currentTemplate = null;
    }
    this.removeLighting();
  }
}
