import { Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { getDracoLoader } from './draco.js';

const cache = new Map<string, Promise<Object3D>>();

export function getGLTFCache(): Map<string, Promise<Object3D>> {
  return cache;
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
    return cache.get(url)!;
  };
}

export function useGLTFCache(url: string): Promise<Object3D> {
  if (cache.has(url)) {
    return cache.get(url)!;
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
