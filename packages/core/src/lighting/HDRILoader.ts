/**
 * HDRI Loader with Caching
 * Loads and caches HDRI textures for better performance
 */

import { PMREMGenerator } from 'three';
import type { Texture, WebGLRenderer } from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

interface HDRICacheEntry {
  texture: Texture;
  envMap: Texture;
  timestamp: number;
}

export class HDRILoader {
  private cache = new Map<string, HDRICacheEntry>();
  private loader: RGBELoader;
  private pmremGenerator: PMREMGenerator | null = null;
  private readonly CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

  constructor(renderer?: WebGLRenderer) {
    this.loader = new RGBELoader();
    if (renderer) {
      this.pmremGenerator = new PMREMGenerator(renderer);
      this.pmremGenerator.compileEquirectangularShader();
    }
  }

  /**
   * Set renderer for PMREM generation
   */
  setRenderer(renderer: WebGLRenderer): void {
    if (this.pmremGenerator) {
      this.pmremGenerator.dispose();
    }
    this.pmremGenerator = new PMREMGenerator(renderer);
    this.pmremGenerator.compileEquirectangularShader();
    // Clear cache when renderer changes
    this.clearCache();
  }

  /**
   * Load HDRI with caching
   */
  async loadHDRI(url: string): Promise<{ texture: Texture; envMap: Texture }> {
    // Check cache
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
      return { texture: cached.texture, envMap: cached.envMap };
    }

    // Load HDRI
    const texture = await new Promise<Texture>((resolve, reject) => {
      this.loader.load(
        url,
        (tex) => resolve(tex),
        undefined,
        (err) => reject(err)
      );
    });

    // Generate PMREM environment map
    if (!this.pmremGenerator) {
      throw new Error('PMREM Generator not initialized. Call setRenderer() first.');
    }

    const envMap = this.pmremGenerator.fromEquirectangular(texture).texture;

    // Cache result
    this.cache.set(url, {
      texture,
      envMap,
      timestamp: Date.now(),
    });

    return { texture, envMap };
  }

  /**
   * Get cached environment map
   */
  getCachedEnvMap(url: string): Texture | null {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
      return cached.envMap;
    }
    return null;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    for (const entry of this.cache.values()) {
      entry.texture.dispose();
      entry.envMap.dispose();
    }
    this.cache.clear();
  }

  /**
   * Cleanup expired cache entries
   */
  cleanupCache(): void {
    const now = Date.now();
    for (const [url, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.CACHE_EXPIRY) {
        entry.texture.dispose();
        entry.envMap.dispose();
        this.cache.delete(url);
      }
    }
  }

  /**
   * Dispose loader and cache
   */
  dispose(): void {
    this.clearCache();
    if (this.pmremGenerator) {
      this.pmremGenerator.dispose();
      this.pmremGenerator = null;
    }
  }
}
