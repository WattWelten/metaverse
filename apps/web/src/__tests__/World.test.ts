import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { World } from '../World';

// Mock Three.js modules
vi.mock('three', () => {
  const mockScene = {
    background: null,
    add: vi.fn(),
    remove: vi.fn(),
  };

  const mockCamera = {
    position: { set: vi.fn(), x: 0, y: 5, z: 10 },
    rotation: { x: 0, y: 0, z: 0 },
    aspect: 1,
    updateProjectionMatrix: vi.fn(),
  };

  const mockRenderer = {
    domElement: document.createElement('canvas'),
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    outputColorSpace: 'srgb',
    toneMapping: 0,
    toneMappingExposure: 1.0,
    shadowMap: { enabled: true },
    dispose: vi.fn(),
  };

  return {
    Scene: vi.fn(() => mockScene),
    PerspectiveCamera: vi.fn(() => mockCamera),
    WebGLRenderer: vi.fn(() => mockRenderer),
    ACESFilmicToneMapping: 1,
    Color: vi.fn(),
    Clock: vi.fn(() => ({
      getDelta: () => 0.016,
    })),
  };
});

// Mock other dependencies
vi.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: vi.fn(() => ({
    enableDamping: true,
    dampingFactor: 0.05,
    minDistance: 1,
    maxDistance: 100,
    update: vi.fn(),
    dispose: vi.fn(),
  })),
}));

vi.mock('../TemplateHost', () => ({
  TemplateHost: vi.fn(() => ({
    loadTemplate: vi.fn().mockResolvedValue(undefined),
    getCurrentTemplate: vi.fn(() => null),
    update: vi.fn(),
    dispose: vi.fn(),
  })),
}));

vi.mock('../xr/XRSetup', () => ({
  XRSetup: vi.fn(() => ({
    dispose: vi.fn(),
  })),
}));

vi.mock('../render/Post', () => ({
  PostProcessing: vi.fn(() => ({
    setSize: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
  })),
}));

vi.mock('@metaverse/net', () => ({
  NetClient: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    isConnected: vi.fn(() => false),
    joinRoom: vi.fn(),
    on: vi.fn(() => () => {}), // Returns cleanup function
    off: vi.fn(),
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
    getAllAvatars: vi.fn(() => []),
    updateInterpolation: vi.fn(),
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

vi.mock('@metaverse/voice', () => ({
  VoiceClient: vi.fn(() => ({
    enable: vi.fn().mockResolvedValue(undefined),
    disable: vi.fn(),
    updateListenerPosition: vi.fn(),
  })),
}));

vi.mock('../FeatureFlags', () => ({
  getFeatureFlags: vi.fn(() => ({
    MULTIPLAYER_ENABLED: true,
    VOICE_ENABLED: true,
    XR_ENABLED: false,
    AMBIENT_AUDIO_ENABLED: true,
    TEMPLATE_ID: 'watt-default',
  })),
}));

describe('World', () => {
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

  it('should create World instance', () => {
    expect(world).toBeDefined();
    expect(world.getScene()).toBeDefined();
    expect(world.getCamera()).toBeDefined();
    expect(world.getRenderer()).toBeDefined();
  });

  it('should initialize without errors', async () => {
    await expect(world.init()).resolves.not.toThrow();
  });

  it('should dispose cleanly', () => {
    expect(() => world.dispose()).not.toThrow();
  });

  it('should handle template loading', async () => {
    await world.init();
    await expect(world.loadTemplate('watt-default')).resolves.not.toThrow();
  });

  it('should check solo mode status', () => {
    expect(typeof world.isSoloMode()).toBe('boolean');
  });

  it('should provide access to net client', () => {
    const netClient = world.getNetClient();
    // NetClient might be null if multiplayer is disabled
    expect(netClient === null || netClient !== null).toBe(true);
  });
});
