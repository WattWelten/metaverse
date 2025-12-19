import { Scene, Object3D, Mesh, BoxGeometry, MeshStandardMaterial } from 'three';
import { templateRegistry, type TemplateInstance, type TemplateManifest } from '@metaverse/core';
import { useGLTFCache } from '@metaverse/core';
import { getFeatureFlags } from './FeatureFlags';

export class TemplateHost {
  private scene: Scene;
  private currentTemplate: TemplateInstance | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  async loadTemplate(templateId: string): Promise<void> {
    try {
      // Register default template loader if not already registered
      if (!templateRegistry.getCurrentInstance()) {
        templateRegistry.register('watt-default', this.createDefaultTemplateLoader());
      }

      const instance = await templateRegistry.load(templateId, this.scene);
      this.currentTemplate = instance;
    } catch (error) {
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

      return {
        manifest,
        scene: sceneObject,
        mount: async (scene: Scene) => {
          if (sceneObject) {
            scene.add(sceneObject);
          }
        },
        unmount: () => {
          if (sceneObject) {
            scene.remove(sceneObject);
          }
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
      cube.position.set(
        (Math.random() - 0.5) * 10,
        0.5,
        (Math.random() - 0.5) * 10
      );
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
  }

  dispose(): void {
    if (this.currentTemplate) {
      this.currentTemplate.unmount();
      this.currentTemplate = null;
    }
  }
}

