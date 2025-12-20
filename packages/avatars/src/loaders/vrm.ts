import type { Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * VRM 1.0 Avatar Loader (secondary option)
 * Requires @pixiv/three-vrm package
 */
export async function loadVRM(url: string, loader = new GLTFLoader()): Promise<Object3D> {
  try {
    // Dynamic import to avoid errors if package not installed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vrmModule = await import('@pixiv/three-vrm' as any).catch(() => null);
    if (!vrmModule) {
      throw new Error(
        'VRM loader requires @pixiv/three-vrm package. Install: pnpm add @pixiv/three-vrm'
      );
    }

    const { VRM, VRMUtils } = vrmModule;
    const gltf = await loader.loadAsync(url);
    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    const vrm = await VRM.from(gltf);
    vrm.scene.rotation.y = Math.PI;
    return vrm.scene;
  } catch (error) {
    if (
      (error as Error).message.includes('Cannot find module') ||
      (error as Error).message.includes('VRM loader requires')
    ) {
      console.warn('@pixiv/three-vrm not installed. Install it to use VRM avatars.');
      throw new Error(
        'VRM loader requires @pixiv/three-vrm package. Install: pnpm add @pixiv/three-vrm'
      );
    }
    throw error;
  }
}

export async function loadVRMAvatar(vrmUrl: string): Promise<Object3D> {
  return loadVRM(vrmUrl);
}
