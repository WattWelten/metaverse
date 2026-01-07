import { vi } from 'vitest';

/**
 * Zentrale Mock-Datei für wiederverwendbare Test-Mocks
 * Diese Datei enthält Mocks für alle Packages und Dependencies, die in Tests verwendet werden.
 *
 * Verwendung:
 * ```typescript
 * import { setupMocks } from './mocks';
 * setupMocks();
 * ```
 */

/**
 * Mock für Three.js
 */
export function mockThree() {
  const mockScene = {
    background: null,
    add: vi.fn(),
    remove: vi.fn(),
    traverse: vi.fn(),
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
    render: vi.fn(),
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
    })),
    DirectionalLight: vi.fn(() => ({
      position: { set: vi.fn(), x: 0, y: 0, z: 0 },
      color: { set: vi.fn() },
      intensity: 1,
      castShadow: false,
      shadow: { mapSize: { width: 2048, height: 2048 } },
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
  };
}

/**
 * Mock für @metaverse/net
 */
export function mockNetClient() {
  return {
    NetClient: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      isConnected: vi.fn(() => false),
      joinRoom: vi.fn(),
      on: vi.fn(() => () => {}), // Returns cleanup function
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
  };
}

/**
 * Mock für @metaverse/avatars
 */
export function mockAvatarManager() {
  return {
    AvatarManager: vi.fn(() => ({
      setNetClient: vi.fn(),
      loadAvatar: vi.fn().mockResolvedValue({}),
      updateAvatar: vi.fn(),
      updateInterpolation: vi.fn(),
      updateAnimations: vi.fn(),
      getAllAvatars: vi.fn(() => []),
      getAvatar: vi.fn(() => null),
      removeAvatar: vi.fn(),
      createCapsuleAvatar: vi.fn(() => ({
        userId: 'test-user',
        object: {},
        position: { x: 0, y: 0, z: 0 },
      })),
      setName: vi.fn(),
      setLocalVisibleHead: vi.fn(),
    })),
    EmoteSystem: vi.fn(() => ({
      playEmote: vi.fn(),
      stopEmote: vi.fn(),
      dispose: vi.fn(),
    })),
    LipDriver: vi.fn(() => ({
      update: vi.fn(),
      dispose: vi.fn(),
    })),
    SpotlightMarker: vi.fn(() => ({
      show: vi.fn(),
      hide: vi.fn(),
      dispose: vi.fn(),
    })),
  };
}

/**
 * Mock für @metaverse/voice
 */
export function mockVoiceClient() {
  return {
    VoiceClient: vi.fn(() => ({
      enable: vi.fn().mockResolvedValue(undefined),
      disable: vi.fn(),
      updateListenerPosition: vi.fn(),
      isEnabled: vi.fn(() => false),
    })),
    MicAnalyser: vi.fn(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      getAmplitude: vi.fn(() => 0),
      dispose: vi.fn(),
    })),
  };
}

/**
 * Mock für @metaverse/audio
 */
export function mockAmbientManager() {
  return {
    AmbientManager: vi.fn(() => ({
      loadFromTemplate: vi.fn(),
      playAll: vi.fn(),
      stopAll: vi.fn(),
      setMasterVolume: vi.fn(),
      getContext: vi.fn(() => mockAudioContext()),
      resumeContext: vi.fn().mockResolvedValue(undefined),
      dispose: vi.fn(),
    })),
    Ambience3D: vi.fn(() => ({
      play: vi.fn(),
      stop: vi.fn(),
      dispose: vi.fn(),
    })),
    ZoneSystem: vi.fn(() => ({
      addZone: vi.fn(),
      removeZone: vi.fn(),
      update: vi.fn(),
      dispose: vi.fn(),
    })),
    ZoneVisualizer: vi.fn(() => ({
      update: vi.fn(),
      dispose: vi.fn(),
    })),
  };
}

/**
 * Mock für @metaverse/environment
 */
export function mockEnvironment() {
  return {
    PropFactory: vi.fn(() => ({
      createBench: vi.fn(() => ({
        object: {},
        seatAnchors: [],
      })),
      createFirepit: vi.fn(() => ({
        object: {},
        seatAnchors: [],
      })),
      createSign: vi.fn(() => ({
        object: {},
        seatAnchors: [],
      })),
    })),
  };
}

/**
 * Mock für @metaverse/interactions
 */
export function mockInteractions() {
  return {
    SeatingSystem: vi.fn(() => ({
      registerSeat: vi.fn(),
      unregisterSeat: vi.fn(),
      sit: vi.fn(),
      stand: vi.fn(),
      update: vi.fn(),
      dispose: vi.fn(),
    })),
  };
}

/**
 * Mock für @metaverse/moderation
 */
export function mockModeration() {
  return {
    StageManager: vi.fn(() => ({
      lock: vi.fn(),
      unlock: vi.fn(),
      setSpotlight: vi.fn(),
      addRaisedHand: vi.fn(),
      removeRaisedHand: vi.fn(),
      promoteHost: vi.fn(),
      demoteHost: vi.fn(),
      on: vi.fn(() => () => {}),
      off: vi.fn(),
      dispose: vi.fn(),
    })),
    parseStageMessage: vi.fn(),
  };
}

/**
 * Mock für @metaverse/navigation
 */
export function mockNavigation() {
  return {
    NavMeshSystem: vi.fn(() => ({
      load: vi.fn().mockResolvedValue(undefined),
      findPath: vi.fn(() => []),
      getRandomPoint: vi.fn(() => ({ x: 0, y: 0, z: 0 })),
      dispose: vi.fn(),
    })),
    extractHolesFromScene: vi.fn(() => []),
  };
}

/**
 * Mock für @metaverse/collab
 */
export function mockCollab() {
  return {
    ScreenSurface: vi.fn(() => ({
      setVideoTexture: vi.fn(),
      dispose: vi.fn(),
    })),
  };
}

/**
 * Mock für @metaverse/ai
 */
export function mockAI() {
  return {
    AgentBridge: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      sendMessage: vi.fn(),
      on: vi.fn(() => () => {}),
      off: vi.fn(),
      dispose: vi.fn(),
    })),
  };
}

/**
 * Mock für @metaverse/xr
 */
export function mockXR() {
  return {
    createXRAdapter: vi.fn(() => ({
      isSupported: vi.fn(() => false),
      isSessionActive: vi.fn(() => false),
      requestSession: vi.fn().mockResolvedValue(undefined),
      endSession: vi.fn(),
      update: vi.fn(),
      dispose: vi.fn(),
    })),
  };
}

/**
 * Mock für @metaverse/core
 */
export function mockCore() {
  return {
    MediaBillboard: vi.fn(() => ({
      setMedia: vi.fn(),
      dispose: vi.fn(),
    })),
    setPhysicallyCorrectLights: vi.fn(),
  };
}

/**
 * Mock für AudioContext
 */
export function mockAudioContext(): AudioContext {
  const mockContext = {
    state: 'running' as AudioContextState,
    destination: {} as AudioDestinationNode,
    sampleRate: 44100,
    currentTime: 0,
    suspend: vi.fn().mockResolvedValue(undefined),
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    createGain: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: { value: 1 },
    })),
    createAnalyser: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteFrequencyData: vi.fn(),
      getByteTimeDomainData: vi.fn(),
    })),
    createMediaStreamSource: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as AudioContext;

  return mockContext;
}

/**
 * Mock für Three.js Examples
 */
export function mockThreeExamples() {
  return {
    OrbitControls: vi.fn(() => ({
      enableDamping: true,
      dampingFactor: 0.05,
      minDistance: 1,
      maxDistance: 100,
      update: vi.fn(),
      dispose: vi.fn(),
    })),
    RGBELoader: vi.fn(() => ({
      load: vi.fn((_url, onLoad) => {
        if (onLoad) {
          onLoad({ isDataTexture: true });
        }
        return { isDataTexture: true };
      }),
    })),
  };
}

/**
 * Setup alle Mocks für Tests
 */
export function setupMocks() {
  // Mock Three.js
  vi.mock('three', () => mockThree());
  vi.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
    OrbitControls: mockThreeExamples().OrbitControls,
  }));
  vi.mock('three/examples/jsm/loaders/RGBELoader.js', () => ({
    RGBELoader: mockThreeExamples().RGBELoader,
  }));

  // Mock Metaverse Packages
  vi.mock('@metaverse/net', () => mockNetClient());
  vi.mock('@metaverse/avatars', () => mockAvatarManager());
  vi.mock('@metaverse/voice', () => mockVoiceClient());
  vi.mock('@metaverse/audio', () => mockAmbientManager());
  vi.mock('@metaverse/environment', () => mockEnvironment());
  vi.mock('@metaverse/interactions', () => mockInteractions());
  vi.mock('@metaverse/moderation', () => mockModeration());
  vi.mock('@metaverse/navigation', () => mockNavigation());
  vi.mock('@metaverse/collab', () => mockCollab());
  vi.mock('@metaverse/ai', () => mockAI());
  vi.mock('@metaverse/xr', () => mockXR());
  vi.mock('@metaverse/core', () => mockCore());

  // Mock AudioContext
  global.AudioContext = vi.fn(() => mockAudioContext()) as typeof AudioContext;
}
