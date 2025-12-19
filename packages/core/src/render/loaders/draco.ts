import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

let dracoLoader: DRACOLoader | null = null;

export function getDracoLoader(): DRACOLoader {
  if (!dracoLoader) {
    dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/libs/draco/');
  }
  return dracoLoader;
}

export function useDraco(): DRACOLoader {
  return getDracoLoader();
}

