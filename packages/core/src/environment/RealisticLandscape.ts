/**
 * Realistic Landscape Builder
 * Creates photorealistic landscapes using downloaded 3D assets
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface LandscapeOptions {
  trees?: Array<{ url: string; position: [number, number, number]; scale?: number }>;
  rocks?: Array<{ url: string; position: [number, number, number]; scale?: number }>;
  vegetation?: Array<{ url: string; position: [number, number, number]; scale?: number }>;
  groundTexture?: string;
}

export class RealisticLandscape {
  private scene: THREE.Scene;
  private loader: GLTFLoader;
  private loadedAssets: Map<string, THREE.Object3D> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.loader = new GLTFLoader();
  }

  /**
   * Load and place 3D model
   */
  async loadModel(url: string): Promise<THREE.Object3D> {
    // Check cache
    const cached = this.loadedAssets.get(url);
    if (cached) {
      return cached.clone();
    }

    try {
      const gltf = await this.loader.loadAsync(url);
      const model = gltf.scene || gltf.scenes?.[0] || new THREE.Object3D();

      // Cache the model
      this.loadedAssets.set(url, model);

      return model.clone();
    } catch (error) {
      console.error(`Failed to load model ${url}:`, error);
      // Return placeholder
      return this.createPlaceholder();
    }
  }

  /**
   * Create placeholder object
   */
  private createPlaceholder(): THREE.Object3D {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    return new THREE.Mesh(geometry, material);
  }

  /**
   * Build realistic landscape
   */
  async build(options: LandscapeOptions): Promise<void> {
    // Load and place trees
    if (options.trees) {
      for (const tree of options.trees) {
        try {
          const model = await this.loadModel(tree.url);
          model.position.set(...tree.position);
          if (tree.scale) {
            model.scale.setScalar(tree.scale);
          }
          this.scene.add(model);
        } catch (error) {
          console.error(`Failed to place tree at ${tree.position}:`, error);
        }
      }
    }

    // Load and place rocks
    if (options.rocks) {
      for (const rock of options.rocks) {
        try {
          const model = await this.loadModel(rock.url);
          model.position.set(...rock.position);
          if (rock.scale) {
            model.scale.setScalar(rock.scale);
          }
          this.scene.add(model);
        } catch (error) {
          console.error(`Failed to place rock at ${rock.position}:`, error);
        }
      }
    }

    // Load and place vegetation
    if (options.vegetation) {
      for (const veg of options.vegetation) {
        try {
          const model = await this.loadModel(veg.url);
          model.position.set(...veg.position);
          if (veg.scale) {
            model.scale.setScalar(veg.scale);
          }
          this.scene.add(model);
        } catch (error) {
          console.error(`Failed to place vegetation at ${veg.position}:`, error);
        }
      }
    }

    // Apply ground texture if provided
    if (options.groundTexture) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        options.groundTexture,
        (texture) => {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(10, 10);

          // Find ground mesh and apply texture
          this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.name === 'Ground') {
              const material = child.material as THREE.MeshStandardMaterial;
              if (material) {
                material.map = texture;
                material.needsUpdate = true;
              }
            }
          });
        },
        undefined,
        (error) => {
          console.error('Failed to load ground texture:', error);
        }
      );
    }
  }

  /**
   * Clear all landscape objects
   */
  clear(): void {
    // Remove all added objects (keep original scene objects)
    const toRemove: THREE.Object3D[] = [];
    this.scene.traverse((child) => {
      if (child.userData.isLandscapeAsset) {
        toRemove.push(child);
      }
    });
    toRemove.forEach((obj) => this.scene.remove(obj));
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.clear();
    this.loadedAssets.clear();
  }
}
