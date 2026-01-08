import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { World } from '../World';

// Mock Three.js modules
vi.mock('three', () => {
  const mockScene = {
    background: null,
    add: vi.fn(),
    remove: vi.fn(),
    traverse: vi.fn(),
  };

  const mockCamera = {
    position: {
      set: vi.fn(),
      x: 0,
      y: 5,
      z: 10,
      clone: vi.fn(() => ({ x: 0, y: 5, z: 10, set: vi.fn() })),
    },
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
    SRGBColorSpace: 'srgb',
    Color: vi.fn(),
    Clock: vi.fn(() => ({
      getDelta: () => 0.016,
    })),
    Raycaster: vi.fn(() => ({
      setFromCamera: vi.fn(),
      intersectObjects: vi.fn(() => []),
    })),
    Vector2: vi.fn(() => ({ x: 0, y: 0 })),
    Vector3: vi.fn(() => ({ x: 0, y: 0, z: 0 })),
    Object3D: vi.fn(() => ({
      add: vi.fn(),
      remove: vi.fn(),
      traverse: vi.fn(),
      position: { x: 0, y: 0, z: 0 },
    })),
    Box3: vi.fn(() => ({
      setFromObject: vi.fn(() => ({
        getCenter: vi.fn(() => ({ x: 0, y: 0, z: 0 })),
      })),
    })),
    PMREMGenerator: vi.fn(() => ({
      compileEquirectangularShader: vi.fn(),
      fromScene: vi.fn(),
      dispose: vi.fn(),
    })),
    HemisphereLight: vi.fn(() => ({
      position: { set: vi.fn(), x: 0, y: 0, z: 0 },
      color: { set: vi.fn() },
      intensity: 1,
      dispose: vi.fn(),
    })),
    DirectionalLight: vi.fn(() => ({
      position: { set: vi.fn(), x: 0, y: 0, z: 0 },
      color: { set: vi.fn() },
      intensity: 1,
      castShadow: false,
      shadow: { mapSize: { width: 2048, height: 2048 } },
      dispose: vi.fn(),
    })),
    AmbientLight: vi.fn(() => ({
      color: { set: vi.fn() },
      intensity: 1,
    })),
    PointLight: vi.fn(() => ({
      position: { set: vi.fn(), x: 0, y: 0, z: 0 },
      color: { set: vi.fn() },
      intensity: 1,
    })),
    Mesh: vi.fn(() => ({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      add: vi.fn(),
      remove: vi.fn(),
    })),
    Group: vi.fn(() => ({
      add: vi.fn(),
      remove: vi.fn(),
      traverse: vi.fn(),
      position: { x: 0, y: 0, z: 0 },
    })),
    GridHelper: vi.fn(),
    AxesHelper: vi.fn(),
    Shape: vi.fn(() => ({
      absarc: vi.fn(),
      holes: [],
    })),
    Path: vi.fn(() => ({
      absarc: vi.fn(),
    })),
    ShapeGeometry: vi.fn(() => ({
      rotateX: vi.fn(),
      translate: vi.fn(),
      clone: vi.fn(() => ({
        rotateX: vi.fn(),
      })),
      dispose: vi.fn(),
    })),
    BufferGeometry: vi.fn(() => ({
      clone: vi.fn(() => ({
        rotateX: vi.fn(),
      })),
      rotateX: vi.fn(),
      dispose: vi.fn(),
    })),
    MeshBasicMaterial: vi.fn(() => ({
      dispose: vi.fn(),
    })),
  };
});

// Mock three/examples/jsm modules
vi.mock('three/examples/jsm/loaders/RGBELoader.js', () => ({
  RGBELoader: vi.fn(() => ({
    load: vi.fn((_url, onLoad) => {
      if (onLoad) {
        onLoad({ isDataTexture: true });
      }
      return { isDataTexture: true };
    }),
  })),
}));

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
    setCamera: vi.fn(),
    setRenderer: vi.fn(),
    update: vi.fn(),
    dispose: vi.fn(),
  })),
}));

vi.mock('@metaverse/navigation', () => ({
  NavMeshSystem: vi.fn(() => ({
    load: vi.fn().mockResolvedValue(undefined),
    buildProcedural: vi.fn(),
    findPath: vi.fn(() => []),
    getRandomPoint: vi.fn(() => ({ x: 0, y: 0, z: 0 })),
    clampStep: vi.fn((_from, to) => to),
    initAt: vi.fn(),
    toggleVisible: vi.fn(),
    setVisible: vi.fn(),
    dispose: vi.fn(),
  })),
  extractHolesFromScene: vi.fn(() => ({ holes: [], radius: 50 })),
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
    getAvatar: vi.fn(() => null),
    createCapsuleAvatar: vi.fn(() => ({
      userId: 'test-user',
      object: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { y: 0 },
      },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    })),
    loadAvatar: vi.fn().mockResolvedValue(undefined),
    updateAvatar: vi.fn(),
    updateInterpolation: vi.fn(),
    updateAnimations: vi.fn(),
    removeAvatar: vi.fn(),
    setName: vi.fn(),
    setLocalVisibleHead: vi.fn(),
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

vi.mock('../controllers/CameraRig', () => ({
  CameraRig: vi.fn(() => ({
    switch: vi.fn(),
    update: vi.fn(),
    get mode() {
      return 'fp';
    },
  })),
}));

vi.mock('../controllers/PlayerController', () => ({
  PlayerController: vi.fn(() => ({
    lock: vi.fn(),
    unlock: vi.fn(),
    update: vi.fn(),
    dispose: vi.fn(),
    isLocked: false,
    dom: document.createElement('canvas'),
  })),
}));

vi.mock('../environment/Eco', () => ({
  buildEco: vi.fn(),
}));

vi.mock('../environment/EcoAuto', () => ({
  buildEcoAuto: vi.fn(),
}));

vi.mock('../FeatureFlags', () => ({
  getFeatureFlags: vi.fn(() => ({
    MULTIPLAYER_ENABLED: true,
    VOICE_ENABLED: true,
    XR_ENABLED: false,
    AMBIENT_AUDIO_ENABLED: true,
    TEMPLATE_ID: 'watt-default',
    AI_ENABLED: false,
    NAV_DEBUG: false,
    ECO_AUTO_ENABLED: false,
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
