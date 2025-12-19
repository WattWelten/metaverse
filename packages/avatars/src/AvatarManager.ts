import { Object3D, Scene } from 'three';
import { loadReadyPlayerMeAvatar } from './loaders/rpm.js';

export interface Avatar {
  id: string;
  userId: string;
  object: Object3D;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  animation?: string;
}

export class AvatarManager {
  private avatars = new Map<string, Avatar>();
  private scene: Scene;
  private netClient: {
    getReplicator: () => {
      onAvatarUpdate: (callback: (update: {
        userId: string;
        position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number };
        animation?: string;
      }) => void) => () => void;
    };
    updateAvatar: (position: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number }, animation?: string) => void;
  } | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  setNetClient(netClient: AvatarManager['netClient']): void {
    this.netClient = netClient;
    
    // Listen to avatar updates from network
    if (netClient) {
      netClient.getReplicator().onAvatarUpdate((update) => {
        this.updateRemoteAvatar(update.userId, update);
      });
    }
  }

  async loadAvatar(userId: string, avatarUrl: string, position?: { x: number; y: number; z: number }): Promise<Avatar> {
    try {
      const avatarObject = await loadReadyPlayerMeAvatar(avatarUrl);
      
      const avatar: Avatar = {
        id: `avatar-${userId}`,
        userId,
        object: avatarObject,
        position: position || { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      };

      this.scene.add(avatar.object);
      this.avatars.set(userId, avatar);

      return avatar;
    } catch (error) {
      console.error(`Failed to load avatar for user ${userId}:`, error);
      throw error;
    }
  }

  updateAvatar(userId: string, position: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number }, animation?: string): void {
    const avatar = this.avatars.get(userId);
    if (!avatar) return;

    avatar.position = { ...position };
    avatar.rotation = { ...rotation };
    avatar.animation = animation;

    avatar.object.position.set(position.x, position.y, position.z);
    avatar.object.rotation.set(rotation.x, rotation.y, rotation.z);

    // Sync to network
    if (this.netClient) {
      this.netClient.updateAvatar(
        { x: position.x, y: position.y, z: position.z },
        { x: rotation.x, y: rotation.y, z: rotation.z },
        animation
      );
    }
  }

  private updateRemoteAvatar(userId: string, update: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    animation?: string;
  }): void {
    const avatar = this.avatars.get(userId);
    if (!avatar) return;

    avatar.position = { ...update.position };
    avatar.rotation = { ...update.rotation };
    avatar.animation = update.animation;

    avatar.object.position.set(update.position.x, update.position.y, update.position.z);
    avatar.object.rotation.set(update.rotation.x, update.rotation.y, update.rotation.z);
  }

  removeAvatar(userId: string): void {
    const avatar = this.avatars.get(userId);
    if (avatar) {
      this.scene.remove(avatar.object);
      this.avatars.delete(userId);
    }
  }

  getAvatar(userId: string): Avatar | undefined {
    return this.avatars.get(userId);
  }

  getAllAvatars(): Avatar[] {
    return Array.from(this.avatars.values());
  }
}

