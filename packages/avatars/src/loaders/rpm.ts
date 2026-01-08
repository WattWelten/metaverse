import { Object3D, Box3, Vector3 } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Ready Player Me Avatar Loader
 * Primary avatar solution - easy setup, seamless integration
 */
export async function loadReadyPlayerMeAvatar(avatarUrl: string): Promise<Object3D> {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/libs/draco/');
  loader.setDRACOLoader(dracoLoader);

  return new Promise((resolve, reject) => {
    loader.load(
      avatarUrl,
      (gltf: { scene: Object3D }) => {
        const avatar = gltf.scene;

        // Calculate bounding box to normalize avatar size
        const box = new Box3().setFromObject(avatar);
        const size = box.getSize(new Vector3());
        const center = box.getCenter(new Vector3());

        // Ready Player Me avatars are typically ~1.7m tall
        // Normalize to standard height (1.7m = 1.7 units)
        const targetHeight = 1.7;
        const scale = size.y > 0 ? targetHeight / size.y : 1;
        avatar.scale.set(scale, scale, scale);

        // Position avatar so feet are at y=0
        // Move avatar so bottom of bounding box is at y=0
        const bottomY = box.min.y * scale;
        avatar.position.set(-center.x * scale, -bottomY, -center.z * scale);

        console.log(
          `✅ Avatar normalized: height=${targetHeight}, scale=${scale.toFixed(2)}, position=(${avatar.position.x.toFixed(2)}, ${avatar.position.y.toFixed(2)}, ${avatar.position.z.toFixed(2)})`
        );

        // Enable shadows
        avatar.traverse((child: Object3D) => {
          if (child.type === 'Mesh') {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        resolve(avatar);
      },
      undefined,
      (error: unknown) => {
        console.error('Failed to load Ready Player Me avatar:', error);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    );
  });
}

/**
 * Get Ready Player Me avatar URL from user ID or custom URL
 */
export function getReadyPlayerMeUrl(userIdOrUrl: string, _apiKey?: string): string {
  // If it's already a full URL, return it
  if (userIdOrUrl.startsWith('http://') || userIdOrUrl.startsWith('https://')) {
    return userIdOrUrl;
  }

  // Otherwise, construct Ready Player Me URL
  // Format: https://models.readyplayer.me/{userId}.glb
  const baseUrl = 'https://models.readyplayer.me';
  return `${baseUrl}/${userIdOrUrl}.glb`;
}
