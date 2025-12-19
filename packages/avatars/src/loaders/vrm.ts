import { Object3D } from 'three';

/**
 * VRM 1.0 Avatar Loader (secondary option)
 * Requires three-vrm package
 */
export async function loadVRMAvatar(_vrmUrl: string): Promise<Object3D> {
  // This would require @pixiv/three-vrm package
  // For MVP, we'll provide a stub that can be extended
  throw new Error('VRM loader not yet implemented. Use Ready Player Me for MVP.');
}

