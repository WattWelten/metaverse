import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import type { MeshStandardMaterial } from 'three';

let ktx2Loader: KTX2Loader | null = null;

export function getKTX2Loader(): KTX2Loader {
  if (!ktx2Loader) {
    ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath('/libs/basis/');
  }
  return ktx2Loader;
}

export function useKTX2(texture: string): Promise<unknown> {
  const loader = getKTX2Loader();
  return new Promise((resolve, reject) => {
    loader.load(
      texture,
      (texture) => resolve(texture),
      undefined,
      (error) => reject(error)
    );
  });
}

export function applyKTX2ToMaterial(
  material: MeshStandardMaterial,
  map: string,
  normalMap?: string
): Promise<void> {
  return Promise.all([
    useKTX2(map),
    normalMap ? useKTX2(normalMap) : Promise.resolve(null),
  ]).then(([mapTexture, normalTexture]) => {
    if (mapTexture) {
      material.map = mapTexture as unknown as THREE.Texture;
      material.needsUpdate = true;
    }
    if (normalTexture) {
      material.normalMap = normalTexture as unknown as THREE.Texture;
      material.needsUpdate = true;
    }
  });
}

