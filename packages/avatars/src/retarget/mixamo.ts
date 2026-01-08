import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { VRM } from '@pixiv/three-vrm';

export type LoadedClip = { name: string; clip: THREE.AnimationClip; src: string };

export async function loadClip(url: string, name?: string): Promise<LoadedClip> {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);
  // Nimm ersten Clip; manche GLBs besitzen mehrere
  const clip = gltf.animations?.[0];
  if (!clip) throw new Error(`No AnimationClip in ${url}`);
  clip.name = name || clip.name || url.split('/').pop() || 'clip';
  return { name: clip.name, clip, src: url };
}

/**
 * Retarget Mixamo-Clip auf VRM (humanoid).
 * Annahmen: Source-Clip basiert auf Mixamo-Skelett ("mixamorig:Hips" ...).
 * Falls SkeletonUtils.retargetClip nicht verfügbar ist, wird der Clip direkt verwendet.
 */
export async function retargetMixamoToVRM(
  vrm: VRM,
  mixamoUrl: string,
  rename?: string
): Promise<THREE.AnimationClip> {
  const loader = new GLTFLoader();
  let src;
  try {
    src = await loader.loadAsync(mixamoUrl);
  } catch (error) {
    throw new Error(`Failed to load Mixamo animation from ${mixamoUrl}: ${error}`);
  }

  const clip = src.animations?.[0];
  if (!clip) {
    throw new Error(`No AnimationClip found in ${mixamoUrl}`);
  }

  // Try to use SkeletonUtils.retargetClip if available
  // Note: This function may not exist in all Three.js versions
  if (typeof SkeletonUtils.retargetClip === 'function') {
    try {
      // Source-Root suchen (SkinnedMesh/Armature)
      let srcRoot: THREE.Object3D | null = null;
      src.scene.traverse((o) => {
        if ((o as THREE.Bone).isBone && o.name.toLowerCase().includes('hips')) {
          srcRoot = o;
        }
      });
      if (!srcRoot) srcRoot = src.scene;

      // Ziel = VRM Szene (darin Bones)
      const target = vrm.scene;
      // Retarget
      const retargeted = SkeletonUtils.retargetClip(target, clip, srcRoot, {
        // Mixamo -> VRM: nutzt Bone-Namen-Heuristik; bei Bedarf Mappings hinzufügen
        fps: 30,
      });
      retargeted.name = rename || clip.name;
      return retargeted;
    } catch (retargetError) {
      console.warn(
        `[retargetMixamoToVRM] Retargeting failed, using original clip: ${retargetError}`
      );
      // Fallback: use original clip
    }
  } else {
    console.warn(
      '[retargetMixamoToVRM] SkeletonUtils.retargetClip not available, using original clip'
    );
  }

  // Fallback: return original clip (may work if bone names match)
  const fallbackClip = clip.clone();
  fallbackClip.name = rename || clip.name;
  return fallbackClip;
}
