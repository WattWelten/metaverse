import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getDracoLoader } from './draco.js';
import type { Object3D } from 'three';

const cache = new Map<string, Object3D>();

export function getGLTFCache(): Map<string, Object3D> {
  return cache;
}

export function useGLTFCache(url: string): Promise<Object3D> {
  if (cache.has(url)) {
    return Promise.resolve(cache.get(url)!.clone());
  }

  const loader = new GLTFLoader();
  const dracoLoader = getDracoLoader();
  loader.setDRACOLoader(dracoLoader);

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const scene = gltf.scene;
        cache.set(url, scene);
        resolve(scene.clone());
      },
      undefined,
      (error) => reject(error)
    );
  });
}

