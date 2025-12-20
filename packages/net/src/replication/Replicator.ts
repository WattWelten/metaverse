interface AvatarUpdate {
  userId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  animation?: string;
}

type AvatarUpdateCallback = (update: AvatarUpdate) => void;

export class Replicator {
  private avatarUpdates = new Map<string, AvatarUpdate>();
  private callbacks = new Set<AvatarUpdateCallback>();

  handleAvatarUpdate(userId: string, update: AvatarUpdate): void {
    this.avatarUpdates.set(userId, update);
    
    this.callbacks.forEach((callback) => {
      callback(update);
    });
  }

  getAvatarUpdate(userId: string): AvatarUpdate | undefined {
    return this.avatarUpdates.get(userId);
  }

  getAllAvatarUpdates(): Map<string, AvatarUpdate> {
    return new Map(this.avatarUpdates);
  }

  onAvatarUpdate(callback: AvatarUpdateCallback): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  clear(): void {
    this.avatarUpdates.clear();
  }
}



