/**
 * Type definitions for NetClient event system
 */

export interface NetClientEventEmitter {
  on(event: string, callback: (data: unknown) => void): void | (() => void);
  off(event: string, callback?: (...args: unknown[]) => void): void;
  emit(event: string, data: unknown): void;
}

export interface NetClientReplicator {
  onAvatarUpdate(callback: (update: {
    userId: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    animation?: string;
  }) => void): () => void;
}

export interface NetClientForAvatarManager {
  getReplicator: () => NetClientReplicator;
  updateAvatar: (
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number },
    animation?: string
  ) => void;
}

export interface NetClientForVoice {
  on: (event: string, callback: (data: unknown) => void) => void | (() => void);
  off?: (event: string, callback?: (...args: unknown[]) => void) => void;
  emit?: (event: string, data: unknown) => void;
}

