import { Object3D } from 'three';
import type { WebGLRenderer } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

import { getDracoLoader } from './draco.js';

const cache = new Map<string, Promise<Object3D>>();

export function getGLTFCache(): Map<string, Promise<Object3D>> {
  return cache;
}

export function clearGLTFCache(): void {
  cache.clear();
}

export function createGLTFCacher(loader: GLTFLoader): void {
  const original = loader.loadAsync.bind(loader);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (loader as any).loadAsync = (url: string, onProgress?: (progress: ProgressEvent) => void) => {
    if (!cache.has(url)) {
      cache.set(
        url,
        original(url, onProgress).then((gltf) => {
          const scene = gltf.scene || gltf.scenes?.[0] || new Object3D();
          return scene.clone();
        })
      );
    }
    const cached = cache.get(url);
    if (!cached) {
      throw new Error(`Cache miss for URL: ${url}`);
    }
    return cached;
  };
}

/**
 * Creates a GLTFLoader with integrated cache, Draco, and KTX2 support.
 * This is the recommended way to create a GLTFLoader instance.
 *
 * @param renderer - Optional WebGLRenderer for KTX2 support. If provided, KTX2 textures will be supported.
 * @returns Configured GLTFLoader instance with cache, Draco, and optionally KTX2.
 */
export function createGLTFLoader(renderer?: WebGLRenderer): GLTFLoader {
  const loader = new GLTFLoader();

  // Configure Draco loader
  try {
    const draco = new DRACOLoader();
    draco.setDecoderPath('/draco/');
    loader.setDRACOLoader(draco);
  } catch (error) {
    console.warn('Failed to configure Draco loader:', error);
  }

  // Configure KTX2 loader if renderer is available
  if (renderer) {
    try {
      const ktx2 = new KTX2Loader();
      ktx2.setTranscoderPath('/ktx2/');
      ktx2.detectSupport(renderer);
      loader.setKTX2Loader(ktx2);
    } catch (error) {
      console.warn('Failed to configure KTX2 loader:', error);
    }
  }

  // Wrap loadAsync to use cache
  const original = loader.loadAsync.bind(loader);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (loader as any).loadAsync = (url: string, onProgress?: (progress: ProgressEvent) => void) => {
    if (!cache.has(url)) {
      cache.set(
        url,
        original(url, onProgress).then((gltf) => {
          const scene = gltf.scene || gltf.scenes?.[0] || new Object3D();
          return scene.clone();
        })
      );
    }
    const cached = cache.get(url);
    if (!cached) {
      throw new Error(`Cache miss for URL: ${url}`);
    }
    return cached;
  };

  return loader;
}

export function useGLTFCache(url: string): Promise<Object3D> {
  if (cache.has(url)) {
    const cached = cache.get(url);
    if (!cached) {
      throw new Error(`Cache miss for URL: ${url}`);
    }
    return cached;
  }

  const loader = new GLTFLoader();
  const dracoLoader = getDracoLoader();
  loader.setDRACOLoader(dracoLoader);

  const promise = new Promise<Object3D>((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const scene = gltf.scene || gltf.scenes?.[0] || new Object3D();
        resolve(scene.clone());
      },
      undefined,
      (error) => reject(error)
    );
  });

  cache.set(url, promise);
  return promise;
}
