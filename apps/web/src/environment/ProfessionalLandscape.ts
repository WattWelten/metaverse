/**
 * Professional Landscape Builder
 * Creates photorealistic landscapes using high-quality 3D assets
 * Similar to Arthur, RaveSpace Metaverse Nordwest quality
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import type { RealisticLandscape } from '@metaverse/core'; // Not used yet

interface ProfessionalAsset {
  id: string;
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  variant?: number;
}

interface ProfessionalLandscapeOptions {
  hdriUrl?: string;
  assets: ProfessionalAsset[];
  groundTexture?: string;
  pathTexture?: string;
  enableShadows?: boolean;
  enableLOD?: boolean;
}

export class ProfessionalLandscapeBuilder {
  private scene: THREE.Scene;
  private loader: GLTFLoader;
  private loadedAssets: Map<string, THREE.Object3D> = new Map();
  private assetInstances: THREE.Object3D[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.loader = new GLTFLoader();
  }

  /**
   * Load and cache 3D model
   */
  async loadModel(url: string, variant: number = 0): Promise<THREE.Object3D> {
    const cacheKey = `${url}_v${variant}`;

    // Check cache
    const cached = this.loadedAssets.get(cacheKey);
    if (cached) {
      return cached.clone();
    }

    try {
      const gltf = await this.loader.loadAsync(url);
      const model = gltf.scene || gltf.scenes?.[0] || new THREE.Object3D();

      // Traverse and optimize materials
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Enable shadows
          child.castShadow = true;
          child.receiveShadow = true;

          // Optimize materials
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.shadowSide = THREE.FrontSide;
          }
        }
      });

      // Cache the model
      this.loadedAssets.set(cacheKey, model);

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
    const material = new THREE.MeshStandardMaterial({
      color: 0x888888,
      emissive: 0x222222,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.isPlaceholder = true;
    return mesh;
  }

  /**
   * Build professional landscape
   */
  async build(options: ProfessionalLandscapeOptions): Promise<void> {
    const {
      assets,
      groundTexture,
      pathTexture,
      enableShadows: _enableShadows = true,
      enableLOD = true,
    } = options;

    console.log('🏗️  Building professional landscape...');

    // Load and place all assets
    const loadPromises = assets.map(async (asset) => {
      try {
        const model = await this.loadModel(asset.url, asset.variant || 0);

        // Apply transformations
        model.position.set(...asset.position);
        if (asset.rotation) {
          model.rotation.set(...asset.rotation);
        } else {
          // Random rotation for natural variation
          model.rotation.y = Math.random() * Math.PI * 2;
        }

        const scale = asset.scale || 1.0;
        model.scale.setScalar(scale);

        // Add random variation for natural look
        if (asset.variant !== undefined) {
          const variation = 0.9 + Math.random() * 0.2; // 90-110% scale variation
          model.scale.multiplyScalar(variation);
        }

        model.userData.assetId = asset.id;
        model.userData.isLandscapeAsset = true;

        this.scene.add(model);
        this.assetInstances.push(model);

        return true;
      } catch (error) {
        console.error(`Failed to place asset ${asset.id}:`, error);
        return false;
      }
    });

    await Promise.all(loadPromises);
    console.log(`✅ Placed ${this.assetInstances.length} assets`);

    // Apply ground texture if provided
    if (groundTexture) {
      await this.applyGroundTexture(groundTexture);
    }

    // Apply path texture if provided
    if (pathTexture) {
      await this.applyPathTexture(pathTexture);
    }

    // Generate LOD for distant objects if enabled
    if (enableLOD) {
      this.generateLOD();
    }

    console.log('✅ Professional landscape built');
  }

  /**
   * Apply ground texture
   */
  private async applyGroundTexture(textureUrl: string): Promise<void> {
    const textureLoader = new THREE.TextureLoader();

    try {
      const texture = await textureLoader.loadAsync(textureUrl);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(20, 20); // Large repeat for seamless tiling
      texture.anisotropy = 16; // High quality filtering

      // Find ground mesh and apply texture
      this.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name === 'Ground') {
          const material = child.material as THREE.MeshStandardMaterial;
          if (material) {
            material.map = texture;
            material.normalMap = texture; // Use same texture as normal map for simplicity
            material.needsUpdate = true;
          }
        }
      });

      console.log('✅ Ground texture applied');
    } catch (error) {
      console.warn('Failed to load ground texture:', error);
    }
  }

  /**
   * Apply path texture
   */
  private async applyPathTexture(textureUrl: string): Promise<void> {
    const textureLoader = new THREE.TextureLoader();

    try {
      const texture = await textureLoader.loadAsync(textureUrl);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
      texture.anisotropy = 16;

      // Find path meshes and apply texture
      this.scene.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          (child.name.includes('Path') || child.name.includes('path'))
        ) {
          const material = child.material as THREE.MeshStandardMaterial;
          if (material) {
            material.map = texture;
            material.needsUpdate = true;
          }
        }
      });

      console.log('✅ Path texture applied');
    } catch (error) {
      console.warn('Failed to load path texture:', error);
    }
  }

  /**
   * Generate LOD for distant objects
   */
  private generateLOD(): void {
    // For MVP, we'll implement simple distance-based LOD
    // In production, use proper LOD meshes generated by AssetOptimizer
    this.assetInstances.forEach((obj) => {
      if (obj.userData.isPlaceholder) return;

      // Add LOD userData for future implementation
      obj.userData.hasLOD = true;
      obj.userData.lodDistance = 50; // Switch to LOD at 50 units
    });
  }

  /**
   * Clear all landscape objects
   */
  clear(): void {
    this.assetInstances.forEach((obj) => {
      this.scene.remove(obj);
      // Dispose geometry and materials
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    this.assetInstances = [];
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.clear();
    this.loadedAssets.clear();
  }
}
