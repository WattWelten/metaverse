import type { NetClientForAvatarManager } from '@metaverse/net';
import { Scene } from 'three';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { AvatarManager } from '../AvatarManager.js';

describe('AvatarManager', () => {
  let avatarManager: AvatarManager;
  let scene: Scene;
  let mockNetClient: NetClientForAvatarManager;

  beforeEach(() => {
    scene = new Scene();
    avatarManager = new AvatarManager(scene);

    mockNetClient = {
      getReplicator: () => ({
        onAvatarUpdate: vi.fn(() => () => {}), // Returns cleanup function
      }),
      updateAvatar: vi.fn(),
    };
  });

  it('should create AvatarManager instance', () => {
    expect(avatarManager).toBeDefined();
    expect(avatarManager.getAllAvatars()).toHaveLength(0);
  });

  it('should create capsule avatar', () => {
    const avatar = avatarManager.createCapsuleAvatar('test-user', { x: 0, y: 0, z: 0 });

    expect(avatar).toBeDefined();
    expect(avatar.userId).toBe('test-user');
    expect(avatar.object).toBeDefined();
    expect(avatarManager.getAvatar('test-user')).toBeDefined();
  });

  it('should set net client', () => {
    avatarManager.setNetClient(mockNetClient);
    expect(avatarManager).toBeDefined();
  });

  it('should update avatar position', () => {
    avatarManager.createCapsuleAvatar('test-user', { x: 0, y: 0, z: 0 });
    avatarManager.setNetClient(mockNetClient);

    avatarManager.updateAvatar('test-user', { x: 1, y: 2, z: 3 }, { x: 0, y: 0, z: 0 });

    const avatar = avatarManager.getAvatar('test-user');
    expect(avatar?.position).toEqual({ x: 1, y: 2, z: 3 });
  });

  it('should remove avatar and cleanup resources', () => {
    avatarManager.createCapsuleAvatar('test-user', { x: 0, y: 0, z: 0 });

    // Verify avatar exists
    expect(avatarManager.getAvatar('test-user')).toBeDefined();

    // Remove avatar
    avatarManager.removeAvatar('test-user');

    // Verify avatar is removed
    expect(avatarManager.getAvatar('test-user')).toBeUndefined();
    expect(avatarManager.getAllAvatars()).toHaveLength(0);
  });

  it('should handle interpolation updates', () => {
    avatarManager.createCapsuleAvatar('test-user', { x: 0, y: 0, z: 0 });

    // Simulate remote update
    const avatar = avatarManager.getAvatar('test-user');
    if (avatar) {
      avatar.targetPosition = { x: 10, y: 0, z: 10 };
      avatar.targetRotation = { x: 0, y: Math.PI, z: 0 };
    }

    // Update interpolation
    avatarManager.updateInterpolation(0.016); // ~60fps delta

    // Avatar should have moved towards target
    const updatedAvatar = avatarManager.getAvatar('test-user');
    expect(updatedAvatar?.position.x).toBeGreaterThan(0);
  });

  it('should handle multiple avatars', () => {
    avatarManager.createCapsuleAvatar('user-1', { x: 0, y: 0, z: 0 });
    avatarManager.createCapsuleAvatar('user-2', { x: 5, y: 0, z: 5 });
    avatarManager.createCapsuleAvatar('user-3', { x: 10, y: 0, z: 10 });

    expect(avatarManager.getAllAvatars()).toHaveLength(3);
  });
});
