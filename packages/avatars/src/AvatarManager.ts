import { Object3D, Scene, Vector3 } from 'three';
import { loadReadyPlayerMeAvatar } from './loaders/rpm.js';
import type { NetClient } from '@metaverse/net';

export interface Avatar {
  id: string;
  userId: string;
  object: Object3D;
  position: Vector3;
  rotation: Vector3;
  animation?: string;
}

export class AvatarManager {
  private avatars = new Map<string, Avatar>();
  private scene: Scene;
  private netClient: NetClient | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  setNetClient(netClient: NetClient): void {
    this.netClient = netClient;
    
    // Listen to avatar updates from network
    netClient.getReplicator().onAvatarUpdate((update) => {
      this.updateRemoteAvatar(update.userId, update);
    });
  }

  async loadAvatar(userId: string, avatarUrl: string, position?: Vector3): Promise<Avatar> {
    try {
      const avatarObject = await loadReadyPlayerMeAvatar(avatarUrl);
      
      const avatar: Avatar = {
        id: `avatar-${userId}`,
        userId,
        object: avatarObject,
        position: position || new Vector3(0, 0, 0),
        rotation: new Vector3(0, 0, 0),
      };

      this.scene.add(avatar.object);
      this.avatars.set(userId, avatar);

      return avatar;
    } catch (error) {
      console.error(`Failed to load avatar for user ${userId}:`, error);
      throw error;
    }
  }

  updateAvatar(userId: string, position: Vector3, rotation: Vector3, animation?: string): void {
    const avatar = this.avatars.get(userId);
    if (!avatar) return;

    avatar.position.copy(position);
    avatar.rotation.copy(rotation);
    avatar.animation = animation;

    avatar.object.position.copy(position);
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

    avatar.position.set(update.position.x, update.position.y, update.position.z);
    avatar.rotation.set(update.rotation.x, update.rotation.y, update.rotation.z);
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

