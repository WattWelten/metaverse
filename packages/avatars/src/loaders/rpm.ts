import { Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

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
        
        // Scale and position adjustments for Ready Player Me avatars
        avatar.scale.set(1, 1, 1);
        avatar.position.set(0, 0, 0);
        
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

