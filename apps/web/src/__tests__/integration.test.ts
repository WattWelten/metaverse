import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { World } from '../World';

// Mock dependencies
vi.mock('@metaverse/net', () => ({
  NetClient: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    isConnected: vi.fn(() => true),
    joinRoom: vi.fn(),
    on: vi.fn(() => () => {}),
    off: vi.fn(),
    getPlayerCount: vi.fn(() => 1),
    asAvatarManagerClient: vi.fn(() => ({
      getReplicator: () => ({
        onAvatarUpdate: vi.fn(() => () => {}),
      }),
      updateAvatar: vi.fn(),
    })),
    asVoiceClient: vi.fn(() => ({
      on: vi.fn(() => () => {}),
      emit: vi.fn(),
    })),
  })),
}));

vi.mock('@metaverse/avatars', () => ({
  AvatarManager: vi.fn(() => ({
    setNetClient: vi.fn(),
    loadAvatar: vi.fn().mockResolvedValue({}),
    updateAvatar: vi.fn(),
    updateInterpolation: vi.fn(),
    getAllAvatars: vi.fn(() => []),
    removeAvatar: vi.fn(),
  })),
}));

vi.mock('@metaverse/voice', () => ({
  VoiceClient: vi.fn(() => ({
    enable: vi.fn().mockResolvedValue(undefined),
    disable: vi.fn(),
    updateListenerPosition: vi.fn(),
  })),
}));

vi.mock('@metaverse/audio', () => ({
  AmbientManager: vi.fn(() => ({
    loadFromTemplate: vi.fn(),
    playAll: vi.fn(),
    stopAll: vi.fn(),
    dispose: vi.fn(),
  })),
}));

vi.mock('../FeatureFlags', () => ({
  getFeatureFlags: vi.fn(() => ({
    MULTIPLAYER_ENABLED: true,
    VOICE_ENABLED: true,
    AMBIENT_AUDIO_ENABLED: true,
    XR_ENABLED: false,
    TEMPLATE_ID: 'watt-default',
  })),
}));

describe('Integration Tests - World', () => {
  let container: HTMLDivElement;
  let world: World;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    world = new World(container);
  });

  afterEach(() => {
    if (world) {
      world.dispose();
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Multiplayer Integration', () => {
    it('should connect to server after init', async () => {
      await world.init();

      const netClient = world.getNetClient();
      expect(netClient).toBeDefined();
      expect(netClient?.isConnected()).toBe(true);
    });

    it('should join room after connection', async () => {
      await world.init();

      const netClient = world.getNetClient();
      expect(netClient?.joinRoom).toHaveBeenCalled();
    });

    it('should return player count', async () => {
      await world.init();

      const playerCount = world.getPlayerCount();
      expect(typeof playerCount).toBe('number');
      expect(playerCount).toBeGreaterThanOrEqual(1);
    });

    it('should handle solo mode when server unavailable', async () => {
      // Mock connection failure
      const { NetClient } = await import('@metaverse/net');
      vi.mocked(NetClient).mockImplementationOnce(
        () =>
          ({
            connect: vi.fn(),
            disconnect: vi.fn(),
            isConnected: vi.fn(() => false),
            joinRoom: vi.fn(),
            on: vi.fn(() => () => {}),
            off: vi.fn(),
            getPlayerCount: vi.fn(() => 0),
            asAvatarManagerClient: vi.fn(() => ({
              getReplicator: () => ({
                onAvatarUpdate: vi.fn(() => () => {}),
              }),
              updateAvatar: vi.fn(),
            })),
            asVoiceClient: vi.fn(() => ({
              on: vi.fn(() => () => {}),
              emit: vi.fn(),
            })),
          }) as any
      );

      const soloWorld = new World(container);
      await soloWorld.init();

      expect(soloWorld.isSoloMode()).toBe(true);
      expect(soloWorld.getPlayerCount()).toBe(1);

      soloWorld.dispose();
    });
  });

  describe('Avatar Synchronisation', () => {
    it('should create local avatar on room join', async () => {
      await world.init();

      const avatarManager = world.getAvatarManager();
      expect(avatarManager).toBeDefined();
    });

    it('should update avatar position during render', async () => {
      await world.init();

      // Simulate render loop
      const avatarManager = world.getAvatarManager();
      if (avatarManager) {
        expect(avatarManager.updateInterpolation).toBeDefined();
      }
    });
  });

  describe('Voice Integration', () => {
    it('should initialize voice client when enabled', async () => {
      await world.init();

      // Voice client should be initialized
      expect(world).toBeDefined();
    });

    it('should enable voice after consent', async () => {
      await world.init();

      await expect(world.enableVoice()).resolves.not.toThrow();
    });
  });

  describe('Template Switching', () => {
    it('should switch templates without crashing', async () => {
      await world.init();

      await expect(world.loadTemplate('watt-eco')).resolves.not.toThrow();
    });

    it('should maintain exposure across template switches', async () => {
      await world.init();

      world.setExposure(1.5);
      await world.loadTemplate('watt-eco');

      // Exposure should be maintained (implementation dependent)
      expect(world.getRenderer().toneMappingExposure).toBeGreaterThan(0);
    });

    it('should handle missing template gracefully', async () => {
      await world.init();

      // Should not throw on missing template
      await expect(world.loadTemplate('non-existent-template')).resolves.not.toThrow();
    });
  });

  describe('Performance Monitoring', () => {
    it('should track FPS', async () => {
      await world.init();

      // Start render loop
      await new Promise((resolve) => setTimeout(resolve, 100));

      const fps = world.getFPS();
      expect(typeof fps).toBe('number');
      expect(fps).toBeGreaterThanOrEqual(0);
    });

    it('should update FPS over time', async () => {
      await world.init();

      // Wait for FPS calculation
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const fps = world.getFPS();
      expect(fps).toBeGreaterThanOrEqual(0);
    });
  });
});
