import { PMREMGenerator, WebGLRenderer, Texture } from 'three';

class PMREMCache {
  private pmrem: PMREMGenerator | null = null;
  private cache = new Map<string, Texture>();

  getGenerator(renderer: WebGLRenderer): PMREMGenerator {
    if (!this.pmrem) {
      this.pmrem = new PMREMGenerator(renderer);
      this.pmrem.compileEquirectangularShader();
    }
    return this.pmrem;
  }

  getCached(url: string): Texture | null {
    return this.cache.get(url) || null;
  }

  setCached(url: string, texture: Texture): void {
    this.cache.set(url, texture);
  }

  dispose(): void {
    this.cache.forEach((tex) => tex.dispose());
    this.cache.clear();
    this.pmrem?.dispose();
    this.pmrem = null;
  }
}

export const pmremCache = new PMREMCache();
