import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let dracoLoader: DRACOLoader | null = null;

export function getDracoLoader(): DRACOLoader {
  if (!dracoLoader) {
    dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
  }
  return dracoLoader;
}

export function useDraco(): DRACOLoader {
  return getDracoLoader();
}

export function createDraco(loader: GLTFLoader): void {
  const draco = new DRACOLoader();
  draco.setDecoderPath('/draco/');
  loader.setDRACOLoader(draco);
}
