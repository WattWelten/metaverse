import type * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Creates a GLTFLoader with VRM support (if available)
 * Falls back to standard GLTFLoader if VRM plugin is not available
 */
export async function createAvatarLoader(_renderer?: THREE.WebGLRenderer): Promise<GLTFLoader> {
  const loader = new GLTFLoader();

  // Try to register VRM plugin (optional dependency)
  try {
    const vrmModule = await import('@pixiv/three-vrm').catch(() => null);
    if (vrmModule?.VRMLoaderPlugin) {
      loader.register((parser) => new vrmModule.VRMLoaderPlugin(parser));
      console.log('✅ VRM support enabled');
    }
  } catch {
    // VRM is optional, continue without it
    console.debug('VRM support not available (optional dependency)');
  }

  return loader;
}
