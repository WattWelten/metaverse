import { AgentBridge } from '@metaverse/ai';
import { AmbientManager, Ambience3D, ZoneSystem, ZoneVisualizer } from '@metaverse/audio';
import {
  AvatarManager,
  EmoteSystem,
  LipDriver,
  SpotlightMarker,
  type EmoteId,
} from '@metaverse/avatars';
import { ScreenSurface } from '@metaverse/collab';
import type { TemplateInstance } from '@metaverse/core';
import { MediaBillboard, setPhysicallyCorrectLights } from '@metaverse/core';
import { PropFactory, type BuiltProp } from '@metaverse/environment';
import { SeatingSystem } from '@metaverse/interactions';
import { StageManager, parseStageMessage } from '@metaverse/moderation';
import { NavMeshSystem } from '@metaverse/navigation';
import { extractHolesFromScene } from '@metaverse/navigation';
import { NetClient } from '@metaverse/net';
import { VoiceClient, MicAnalyser } from '@metaverse/voice';
import type { IXRAdapter } from '@metaverse/xr';
import { createXRAdapter } from '@metaverse/xr';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  ACESFilmicToneMapping,
  SRGBColorSpace,
  Color,
  Clock,
  Object3D,
  HemisphereLight,
  DirectionalLight,
  Texture,
  Vector3,
} from 'three';
import { PMREMGenerator } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import { CameraRig } from './controllers/CameraRig';
import { PlayerController } from './controllers/PlayerController';
import { buildEco } from './environment/Eco';
import { buildEcoAuto } from './environment/EcoAuto';
import { getFeatureFlags, type FeatureFlags } from './FeatureFlags';
import { InteractionManager } from './interactions/InteractionManager';
import { NavController } from './navigation/NavController';
import { PostProcessing } from './render/Post';
import { TemplateHost } from './TemplateHost';
import type { VoiceClientWithProvider } from './types/voiceProvider';

// import { buildEcoProfessional } from './environment/EcoProfessional'; // Not used yet

export class World {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private playerController: PlayerController | null = null;
  private templateHost: TemplateHost;
  private xrAdapter: IXRAdapter | null = null;
  private postProcessing: PostProcessing;
  private clock: Clock;
  private animationFrameId: number | null = null;
  private container: HTMLElement;
  private boundHandleResize: () => void; // Speichere bound function für cleanup
  private pmremGenerator: PMREMGenerator | null = null;
  private defaultLights: { hemi: HemisphereLight; sun: DirectionalLight } | null = null;
  private navMeshSystem: NavMeshSystem | null = null;
  private navController: NavController | null = null;
  private cameraRig: CameraRig | null = null;
  private ecoAutoBuilt = false; // Track if procedural scene was built

  // Multiplayer & Networking
  private netClient: NetClient | null = null;
  private avatarManager: AvatarManager | null = null;
  private ambientManager: AmbientManager | null = null;
  private voiceClient: VoiceClient | null = null;
  private agentBridge: AgentBridge | null = null;
  private userId: string;
  private sessionId: string | null = null;
  private lastAvatarUpdate = 0;
  private readonly AVATAR_UPDATE_THROTTLE = 33; // ms (30 Hz)
  private soloMode = false;

  // Performance monitoring
  private fps = 0;
  private frameCount = 0;
  private lastFpsUpdate = 0;
  private readonly FPS_UPDATE_INTERVAL = 1000; // ms

  // Event listener cleanup
  private netClientEventCleanups: Array<() => void> = [];

  // Chat
  private chatMessages: Array<{ userId: string; message: string; timestamp: number }> = [];
  private chatMessageCallbacks: Array<
    (message: { userId: string; message: string; timestamp: number }) => void
  > = [];

  // Media Sharing
  private mediaBillboards = new Map<string, MediaBillboard>();

  // Interactions
  private interactionManager: InteractionManager | null = null;
  private isSitting = false;
  private seatingSystem: SeatingSystem | null = null;
  private props: BuiltProp[] = [];
  private zoneSystem: ZoneSystem | null = null;
  private zoneVisualizer: ZoneVisualizer | null = null;
  private ambience3D: Ambience3D | null = null;
  private screens: ScreenSurface[] = [];
  private emoteSystem: EmoteSystem | null = null;
  private micAnalyser: MicAnalyser | null = null;
  private lipDriver: LipDriver | null = null;
  private stageManager: StageManager | null = null;
  private spotlightMarkers: Map<string, SpotlightMarker> = new Map();

  // Avatar Movement Controls
  private keysPressed = new Set<string>();
  private avatarPosition = { x: 0, y: 1.6, z: 0 }; // Start position (eye height)
  private avatarRotation = { x: 0, y: 0, z: 0 };
  private moveSpeed = 5; // units per second
  private cameraDistance = 8; // Third-person camera distance
  private cameraHeight = 3; // Camera height above avatar
  private boundHandleKeyDown: (e: KeyboardEvent) => void;
  private boundHandleKeyUp: (e: KeyboardEvent) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.userId = this.generateUserId();

    // Scene
    this.scene = new Scene();
    this.scene.background = new Color(0x000000);

    // Camera
    this.camera = new PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);

    // Renderer
    this.renderer = new WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    setPhysicallyCorrectLights(this.renderer);
    container.appendChild(this.renderer.domElement);

    // PMREM Generator für HDRI
    this.pmremGenerator = new PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    // Default Lights (Fallback, falls kein HDRI geladen wird)
    const hemi = new HemisphereLight(0xffffff, 0x223344, 0.6);
    this.scene.add(hemi);
    const sun = new DirectionalLight(0xffffff, 1.4);
    sun.position.set(5, 10, 2);
    sun.castShadow = true;
    this.scene.add(sun);
    this.defaultLights = { hemi, sun };

    // WebGL Context Lost Handler
    this.renderer.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      console.warn('WebGL context lost - attempting to restore...');
    });

    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored');
      // Re-initialize renderer settings
      this.renderer.outputColorSpace = SRGBColorSpace;
      this.renderer.toneMapping = ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.0;
      this.renderer.shadowMap.enabled = true;
      setPhysicallyCorrectLights(this.renderer);
      // Recreate PMREM Generator
      if (this.pmremGenerator) {
        this.pmremGenerator.dispose();
      }
      this.pmremGenerator = new PMREMGenerator(this.renderer);
      this.pmremGenerator.compileEquirectangularShader();
    });

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 100;

    // Template Host
    this.templateHost = new TemplateHost(this.scene, this.renderer);
    // Set camera reference for LOD calculations
    this.templateHost.setCamera(this.camera);

    // XR Setup - using new adapter pattern
    const flags = getFeatureFlags();
    if (flags.XR_ENABLED) {
      this.initXR();
    }

    // Post Processing
    this.postProcessing = new PostProcessing(this.renderer, this.scene, this.camera);

    // Clock
    this.clock = new Clock();

    // Initialize Multiplayer & Audio Systems
    this.initMultiplayer(flags);
    this.initAudio(flags);
    this.initAgentBridge(flags);

    // Initialize Interaction Manager
    this.interactionManager = new InteractionManager(this.scene);

    // Resize handler - bound function speichern für cleanup
    this.boundHandleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.boundHandleResize);

    // Setup click handler for interactions
    this.setupInteractionHandlers();

    // Setup keyboard controls for avatar movement
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
    window.addEventListener('keydown', this.boundHandleKeyDown);
    window.addEventListener('keyup', this.boundHandleKeyUp);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Ignore if typing in input fields
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      this.keysPressed.add(key);
      e.preventDefault();
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();
    this.keysPressed.delete(key);
  }

  private updateAvatarMovement(delta: number): void {
    if (!this.avatarManager) return;

    // Calculate movement direction based on pressed keys
    let moveX = 0;
    let moveZ = 0;

    if (this.keysPressed.has('w') || this.keysPressed.has('arrowup')) {
      moveZ -= 1; // Forward
    }
    if (this.keysPressed.has('s') || this.keysPressed.has('arrowdown')) {
      moveZ += 1; // Backward
    }
    if (this.keysPressed.has('a') || this.keysPressed.has('arrowleft')) {
      moveX -= 1; // Left
    }
    if (this.keysPressed.has('d') || this.keysPressed.has('arrowright')) {
      moveX += 1; // Right
    }

    // Normalize diagonal movement
    if (moveX !== 0 && moveZ !== 0) {
      moveX *= 0.707; // 1/sqrt(2)
      moveZ *= 0.707;
    }

    // Calculate movement based on camera rotation (relative to camera view)
    const cameraYaw = this.camera.rotation.y;
    const cosYaw = Math.cos(cameraYaw);
    const sinYaw = Math.sin(cameraYaw);

    // Transform movement to world space
    const worldMoveX = moveX * cosYaw - moveZ * sinYaw;
    const worldMoveZ = moveX * sinYaw + moveZ * cosYaw;

    // Update avatar position
    const speed = this.moveSpeed * delta;
    this.avatarPosition.x += worldMoveX * speed;
    this.avatarPosition.z += worldMoveZ * speed;

    // Keep avatar on ground (simple ground plane at y=0)
    this.avatarPosition.y = 1.6; // Eye height

    // Update avatar rotation to face movement direction
    if (moveX !== 0 || moveZ !== 0) {
      this.avatarRotation.y = Math.atan2(worldMoveX, worldMoveZ);
    }

    // Update avatar in AvatarManager
    const animation = moveX !== 0 || moveZ !== 0 ? 'walk' : 'idle';
    this.avatarManager.updateAvatar(
      this.userId,
      this.avatarPosition,
      this.avatarRotation,
      animation
    );

    // Update camera to follow avatar (third-person view)
    const cameraOffsetX = Math.sin(cameraYaw) * this.cameraDistance;
    const cameraOffsetZ = Math.cos(cameraYaw) * this.cameraDistance;

    this.camera.position.set(
      this.avatarPosition.x - cameraOffsetX,
      this.avatarPosition.y + this.cameraHeight,
      this.avatarPosition.z - cameraOffsetZ
    );

    // Camera looks at avatar
    this.camera.lookAt(this.avatarPosition.x, this.avatarPosition.y, this.avatarPosition.z);
    this.controls.target.set(this.avatarPosition.x, this.avatarPosition.y, this.avatarPosition.z);
  }

  private generateUserId(): string {
    return `user-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
  }

  private getRoomIdFromURL(): string {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');
    return roomId || 'default-room';
  }

  private initMultiplayer(flags: FeatureFlags): void {
    // Avatar Manager immer initialisieren (auch im Solo-Modus)
    if (!this.avatarManager) {
      this.avatarManager = new AvatarManager(this.scene);
    }

    if (!flags.MULTIPLAYER_ENABLED) {
      console.log('[World] Multiplayer disabled via feature flag');
      return;
    }

    console.log('[World] Initializing Multiplayer...');
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    const roomId = this.getRoomIdFromURL();
    console.log(
      `[World] Multiplayer config: serverUrl=${serverUrl}, roomId=${roomId}, userId=${this.userId}`
    );

    this.netClient = new NetClient({
      serverUrl,
      userId: this.userId,
      roomId,
      autoConnect: false, // Manuell verbinden nach Template-Load
      sessionId: this.sessionId || undefined,
    });
    console.log('[World] ✅ NetClient created');

    // Stoppe Reconnection-Versuche nach Timeout
    // Note: connectionTimeout and stopReconnection are reserved for future use

    // NetClient an AvatarManager anbinden (nur im Multiplayer-Modus)
    if (this.netClient && this.avatarManager) {
      this.avatarManager.setNetClient(this.netClient.asAvatarManagerClient());
    }

    // Fallback: Solo-Modus wenn Server nicht erreichbar
    let connectionErrorCount = 0;
    const onConnectError = () => {
      connectionErrorCount++;
      if (connectionErrorCount === 1) {
        // Nur einmal loggen, nicht bei jedem Reconnection-Versuch
        console.warn('Server nicht erreichbar - Fallback zu Solo-Modus');
      }
      this.soloMode = true;

      // Stoppe Reconnection nach 3 Fehlern (entspricht reconnectionAttempts: 3)
      if (connectionErrorCount >= 3 && this.netClient) {
        console.log('Stopping reconnection attempts after multiple failures');
        this.netClient.disconnect();
      }
    };

    const onConnect = () => {
      console.log('✅ Connected to multiplayer server');
      this.soloMode = false;
    };

    this.netClient.on('connect_error', onConnectError);
    this.netClient.on('connect', onConnect);

    // Cleanup-Funktionen speichern
    this.netClientEventCleanups.push(
      () => this.netClient?.off('connect_error', onConnectError),
      () => this.netClient?.off('connect', onConnect)
    );
  }

  private initAgentBridge(flags: FeatureFlags): void {
    if (!flags.AI_ENABLED) {
      console.log('[AI] AgentBridge disabled via feature flag');
      return;
    }

    try {
      this.agentBridge = new AgentBridge({
        baseUrl: flags.WATTOS_BASE_URL || 'https://api.wattos.local',
        wsUrl: flags.WATTOS_WS_URL || 'wss://api.wattos.local/realtime',
        apiKey: flags.WATTOS_API_KEY || '',
        tenant: flags.WATTOS_TENANT,
        sessionId: this.userId,
        userId: this.userId,
      });

      this.agentBridge.connect().catch((error) => {
        console.error('[AI] Failed to connect AgentBridge:', error);
      });

      // Event-Handler für AI-Events
      this.agentBridge.on('agent_speech', (data) => {
        console.log('[AI] Agent speech:', data);
        // Optional: Zeige AI-Nachricht in UI
      });

      this.agentBridge.on('tool_call', (data) => {
        console.log('[AI] Tool call:', data);
        // Optional: Führe Aktion aus (z.B. Objekt platzieren)
      });

      this.agentBridge.on('connected', () => {
        console.log('[AI] AgentBridge connected');
      });

      this.agentBridge.on('disconnected', () => {
        console.log('[AI] AgentBridge disconnected');
      });

      this.agentBridge.on('error', (error) => {
        console.error('[AI] AgentBridge error:', error);
      });
    } catch (error) {
      console.error('[AI] Failed to initialize AgentBridge:', error);
    }
  }

  private initAudio(flags: FeatureFlags): void {
    // Ambient Audio
    if (flags.AMBIENT_AUDIO_ENABLED) {
      console.log('[World] Initializing Ambient Audio...');
      this.ambientManager = new AmbientManager();
      console.log('[World] ✅ AmbientManager created');
    } else {
      console.log('[World] Ambient Audio disabled via feature flag');
    }

    // Voice Client
    if (flags.VOICE_ENABLED) {
      if (!this.netClient) {
        console.warn(
          '[World] Voice enabled but NetClient not available. Voice requires Multiplayer.'
        );
        return;
      }
      console.log('[World] Initializing Voice Client...');
      const roomId = this.getRoomIdFromURL();
      this.voiceClient = new VoiceClient({
        userId: this.userId,
        roomId,
        enableSpatialAudio: true,
        netClient: this.netClient.asVoiceClient(),
      });
      console.log(`[World] ✅ VoiceClient created (roomId=${roomId}, spatialAudio=true)`);

      // Initialize StageManager for moderation features
      if (import.meta.env.VITE_STAGE_ENABLED === 'true') {
        console.log('[World] Initializing StageManager...');
        this.stageManager = new StageManager();
        this.setupStageModeration();
        console.log('[World] ✅ StageManager created');
      }
    } else {
      console.log('[World] Voice disabled via feature flag');
    }
  }

  private setupStageModeration(): void {
    if (!this.voiceClient || !this.stageManager) return;

    const provider = (this.voiceClient as VoiceClientWithProvider).provider;
    if (!provider || typeof provider.onData !== 'function') return;

    // Subscribe to data channel messages
    provider.onData((data: string, _participantId: string) => {
      const message = parseStageMessage(data);
      if (message) {
        this.stageManager?.handleMessage(message);
      }
    });

    // Subscribe to stage state changes
    this.stageManager.onStateChange((state) => {
      // Update spotlight markers
      if (state.spotlight) {
        this.setSpotlight(state.spotlight, true);
      } else {
        // Remove all spotlights
        this.spotlightMarkers.forEach((marker, userId) => {
          marker.detach();
          marker.dispose();
          this.spotlightMarkers.delete(userId);
        });
      }
    });
  }

  setSpotlight(participantId: string, enabled: boolean): void {
    if (!this.avatarManager) return;

    const avatar = this.avatarManager.getAvatar(participantId);
    if (!avatar) return;

    if (enabled) {
      // Add spotlight marker
      if (!this.spotlightMarkers.has(participantId)) {
        const marker = new SpotlightMarker();
        marker.attachTo(avatar.object);
        this.spotlightMarkers.set(participantId, marker);
      }
    } else {
      // Remove spotlight marker
      const marker = this.spotlightMarkers.get(participantId);
      if (marker) {
        marker.detach();
        marker.dispose();
        this.spotlightMarkers.delete(participantId);
      }
    }
  }

  getStageManager(): StageManager | null {
    return this.stageManager;
  }

  getZoneSystem(): ZoneSystem | null {
    return this.zoneSystem;
  }

  private async initXR(): Promise<void> {
    // Verhindere Mehrfach-Initialisierung
    if (this.xrAdapter) {
      return;
    }

    try {
      const adapter = await createXRAdapter();
      if (!adapter) {
        return;
      }

      // Check if XR is supported
      if (await adapter.supported()) {
        await adapter.enable(this.renderer, this.scene, this.camera);
        this.xrAdapter = adapter;

        // Optional: Adjust exposure when XR starts/ends
        adapter.onStart?.(() => {
          // Reduce exposure in VR for better comfort
          this.renderer.toneMappingExposure = 0.8;
        });

        adapter.onEnd?.(() => {
          // Restore normal exposure
          this.renderer.toneMappingExposure = 1.0;
        });
      } else {
        console.warn('XR is not supported on this device');
      }
    } catch (error) {
      console.error('Failed to initialize XR:', error);
    }
  }

  async init(): Promise<void> {
    const flags = getFeatureFlags();

    // Load default template (this will also initialize PlayerController if spawn is defined)
    await this.loadTemplate(flags.TEMPLATE_ID);

    // Build Eco environment if template is watt-eco (only once)
    if (
      !this.ecoAutoBuilt &&
      (flags.TEMPLATE_ID === 'watt-eco' || import.meta.env.VITE_ECO_ENABLED === 'true')
    ) {
      // Use buildEcoAuto if explicitly enabled, otherwise fallback to buildEco
      if (import.meta.env.VITE_ECO_AUTO_ENABLED === 'true') {
        await buildEcoAuto(this.scene);
      } else {
        buildEco(this.scene);
      }
      this.ecoAutoBuilt = true;
    }

    // Initialize Navigation (Navmesh)
    await this.initNavigation();

    // Ambient Audio aus Template laden
    const template = this.templateHost.getCurrentTemplate();
    if (this.ambientManager && template) {
      this.ambientManager.loadFromTemplate(template.manifest);
      // playAll() is async and handles context resume automatically
      this.ambientManager.playAll().catch((error) => {
        console.warn('Failed to play ambient audio:', error);
      });
    }

    // Initialize Template++ Features: Props, Seating, Zones, Ambience, Screens
    await this.initTemplateFeatures(template);

    // Create local avatar for WASD controls
    if (this.avatarManager) {
      // Create capsule avatar as fallback if no Ready Player Me avatar is loaded
      const existingAvatar = this.avatarManager.getAvatar(this.userId);
      if (!existingAvatar) {
        this.avatarManager.createCapsuleAvatar(this.userId, this.avatarPosition);
      } else {
        // Update position to match current avatar position
        this.avatarPosition = { ...existingAvatar.position };
        this.avatarRotation = { ...existingAvatar.rotation };
      }

      // Initialize CameraRig with local avatar as target
      const localAvatar = this.avatarManager.getAvatar(this.userId);
      if (localAvatar && !this.cameraRig) {
        this.cameraRig = new CameraRig(this.camera, localAvatar.object);
        // Start in first-person mode
        this.cameraRig.switch('fp');
      }
    }

    // Multiplayer verbinden (nach Template-Load)
    if (this.netClient && flags.MULTIPLAYER_ENABLED) {
      console.log('[World] Connecting to multiplayer server...');
      try {
        this.netClient.connect();

        // Warte auf Verbindung mit Timeout
        await new Promise<void>((resolve) => {
          if (!this.netClient) {
            resolve();
            return;
          }

          let timeout: NodeJS.Timeout | null = null;
          let checkInterval: NodeJS.Timeout | null = null;
          let resolved = false;

          const cleanup = () => {
            if (timeout) clearTimeout(timeout);
            if (checkInterval) clearInterval(checkInterval);
            resolved = true;
          };

          const safeResolve = () => {
            if (!resolved) {
              cleanup();
              resolve();
            }
          };

          timeout = setTimeout(() => {
            console.warn('Connection timeout - continuing in solo mode');
            this.soloMode = true;
            // Stoppe Reconnection-Versuche nach Timeout
            if (this.netClient) {
              this.netClient.disconnect();
            }
            safeResolve();
          }, 3000);

          // Socket.io 'connect' Event wird bereits von NetClient intern behandelt
          // Wir prüfen einfach isConnected() in einem Intervall
          checkInterval = setInterval(() => {
            if (this.netClient?.isConnected()) {
              safeResolve();
            }
          }, 100);

          // Prüfe ob bereits verbunden
          if (this.netClient.isConnected()) {
            safeResolve();
          }
        });

        if (this.netClient.isConnected() && !this.soloMode) {
          console.log('[World] ✅ Connected to multiplayer server');
          const roomId = this.getRoomIdFromURL();
          console.log(`[World] Joining room: ${roomId}`);
          this.netClient.joinRoom(roomId);
          // Lokalen Avatar erstellen
          await this.createLocalAvatar();
          // Chat-Events setzen
          this.setupChat();
          console.log('[World] ✅ Multiplayer fully initialized');
        } else {
          console.log('[World] Running in solo mode (server not reachable or connection failed)');
          // Create avatar even in solo mode for WASD controls
          if (this.avatarManager) {
            const existingAvatar = this.avatarManager.getAvatar(this.userId);
            if (!existingAvatar) {
              this.avatarManager.createCapsuleAvatar(this.userId, this.avatarPosition);
            }
          }
        }
      } catch (error) {
        console.warn('Multiplayer-Verbindung fehlgeschlagen:', error);
        this.soloMode = true;
        // Create avatar even if multiplayer fails
        if (this.avatarManager) {
          const existingAvatar = this.avatarManager.getAvatar(this.userId);
          if (!existingAvatar) {
            this.avatarManager.createCapsuleAvatar(this.userId, this.avatarPosition);
          }
        }
      }
    } else {
      // Solo mode - create avatar for WASD controls
      if (this.avatarManager) {
        const existingAvatar = this.avatarManager.getAvatar(this.userId);
        if (!existingAvatar) {
          this.avatarManager.createCapsuleAvatar(this.userId, this.avatarPosition);
        }
      }
    }

    // Load avatar from prefs (after all initialization)
    if (this.avatarManager) {
      try {
        const { loadPrefs } = await import('./state/prefs');
        const prefs = loadPrefs();
        if (prefs.avatarUrl) {
          await this.avatarManager.setLocalAvatarUrl(prefs.avatarUrl);
          console.log('[World] ✅ Local avatar loaded from prefs:', prefs.avatarUrl);
        }
        if (prefs.username) {
          this.avatarManager.setName('me', prefs.username);
          console.log('[World] ✅ Avatar name set:', prefs.username);
        }
      } catch (error) {
        console.warn('[World] Failed to load avatar from prefs:', error);
      }
    }

    // Start render loop
    this.animate();
    console.log('[World] ready – pointer lock via EnterOverlay');
  }

  async initNavigation(): Promise<void> {
    const template = this.templateHost.getCurrentTemplate();
    const manifest = template?.manifest;

    this.navMeshSystem = new NavMeshSystem();

    // 1) Wenn Template ein navmesh.glb definiert: laden
    const navUrl = manifest?.assets?.navmesh
      ? `/templates/${manifest.id}/${manifest.assets.navmesh}`
      : null;

    if (navUrl) {
      try {
        await this.navMeshSystem.loadFromGLB(navUrl, this.scene);
        console.log('✅ Navmesh loaded from GLB:', navUrl);
      } catch (error) {
        console.warn('⚠️ Failed to load navmesh GLB, using procedural:', error);
        // Fallback auf prozedural
        const { holes, radius } = extractHolesFromScene(this.scene);
        this.navMeshSystem.buildProcedural(this.scene, { radius, holes, y: 0 });
      }
    } else {
      // 2) Prozedural aus Szene
      const { holes, radius } = extractHolesFromScene(this.scene);
      this.navMeshSystem.buildProcedural(this.scene, { radius, holes, y: 0 });
      console.log('✅ Procedural navmesh built with', holes.length, 'holes');
    }

    // Startknoten bestimmen
    const startPos = this.camera.position.clone();
    startPos.y = 0; // Navmesh ist bei y=0
    this.navMeshSystem.initAt(startPos);

    // NavController erstellen und an PlayerController anhängen
    if (this.playerController) {
      this.navController = new NavController(this.navMeshSystem, this.camera);
      this.playerController.attachNavController(this.navController);
    }

    // Set visibility based on VITE_NAV_DEBUG
    if (this.navMeshSystem.overlay) {
      this.navMeshSystem.setVisible(import.meta.env.VITE_NAV_DEBUG === 'true');
    }

    // Debug-Toggle (Taste H)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h' && this.navMeshSystem?.overlay) {
        this.navMeshSystem.toggleVisible();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    // Cleanup wird in dispose() gemacht
  }

  private cleanupTemplateFeatures(): void {
    console.log('[World] Cleaning up template features...');

    // Cleanup Props
    this.props.forEach((prop) => {
      this.scene.remove(prop.object);
      interface Disposable {
        dispose?: () => void;
      }
      prop.object.traverse((obj) => {
        const disposable = obj as Object3D & Disposable;
        if (disposable.dispose) {
          disposable.dispose();
        }
      });
    });
    this.props = [];

    // Cleanup Screens
    this.screens.forEach((screen) => {
      screen.detach();
      this.scene.remove(screen.mesh);
    });
    this.screens = [];

    // Cleanup Ambience3D
    if (this.ambience3D) {
      this.ambience3D.dispose();
      this.ambience3D = null;
    }

    // Cleanup ZoneSystem and ZoneVisualizer
    if (this.zoneVisualizer) {
      this.zoneVisualizer.dispose();
      this.zoneVisualizer = null;
    }
    this.zoneSystem = null;

    // Cleanup Navmesh
    if (this.navMeshSystem) {
      this.navMeshSystem.dispose();
      this.navMeshSystem = null;
    }
    this.navController = null;

    // Cleanup SeatingSystem
    if (this.seatingSystem) {
      // SeatingSystem doesn't have a dispose method, just reset it
      this.seatingSystem = null;
    }

    console.log('[World] Template features cleaned up');
  }

  private async initTemplateFeatures(template: TemplateInstance | null): Promise<void> {
    if (!template) return;
    const manifest = template.manifest;

    // 1. Props erstellen
    if (manifest.props) {
      this.props = [];
      manifest.props.forEach((propDef) => {
        try {
          const prop = PropFactory.build(this.scene, propDef);
          this.props.push(prop);
          // Registriere Sitzplätze
          if (prop.seatAnchors && prop.seatAnchors.length > 0) {
            if (!this.seatingSystem) {
              this.seatingSystem = new SeatingSystem();
              console.log('[World] SeatingSystem created');
            }
            this.seatingSystem.registerAnchors(prop.seatAnchors);
            console.log(
              `[World] Registered ${prop.seatAnchors.length} seat anchors from prop ${propDef.id}`
            );
          }
        } catch (error) {
          console.warn(`Failed to build prop ${propDef.id}:`, error);
        }
      });
      console.log(`✅ Built ${this.props.length} props`);
    }

    // 2. Zones initialisieren
    if (manifest.zones) {
      this.zoneSystem = new ZoneSystem(manifest.zones);
      console.log(`✅ Initialized ${manifest.zones.length} zones`);

      // Initialize ZoneVisualizer if debug mode is enabled
      if (import.meta.env.VITE_ZONE_DEBUG === 'true' || import.meta.env.DEV) {
        this.zoneVisualizer = new ZoneVisualizer(this.scene);
        this.zoneVisualizer.setEnabled(true);
        this.zoneVisualizer.visualizeZones(manifest.zones);
        console.log('✅ Zone visualization enabled');
      }
    }

    // 3. Ambience3D initialisieren
    if (manifest.ambience && manifest.ambience.length > 0) {
      this.ambience3D = new Ambience3D();
      for (const amb of manifest.ambience) {
        try {
          await this.ambience3D.addLoop(amb.id, amb.url, amb.pos, amb.maxDist);
        } catch (error) {
          console.warn(`Failed to load ambience ${amb.id}:`, error);
        }
      }
      console.log(`✅ Initialized ${manifest.ambience.length} 3D ambience sources`);
    }

    // 4. Screens erstellen
    if (manifest.screens) {
      this.screens = [];
      manifest.screens.forEach((screenDef) => {
        const screen = new ScreenSurface(screenDef.pos, screenDef.size, screenDef.id);
        this.scene.add(screen.mesh);
        this.screens.push(screen);
      });
      console.log(`✅ Created ${this.screens.length} screens`);
    }

    // Resume Ambience3D audio context
    if (this.ambience3D) {
      this.ambience3D.resume();
    }

    // 5. Initialize EmoteSystem, MicAnalyser & LipDriver
    if (this.avatarManager && !this.emoteSystem) {
      this.emoteSystem = new EmoteSystem();
      console.log('✅ EmoteSystem initialized');
    }

    if (this.voiceClient && this.avatarManager && !this.micAnalyser) {
      this.micAnalyser = new MicAnalyser();
      this.lipDriver = new LipDriver();
      console.log('✅ MicAnalyser and LipDriver initialized');
    }

    // 6. E-Taste Handler für Seating
    if (this.seatingSystem) {
      console.log('[World] Seating system initialized - E key to sit/stand');
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'e' && this.playerController?.controls.isLocked) {
          const avatar = this.avatarManager?.getAvatar(this.userId);
          if (this.seatingSystem) {
            const wasSeated = this.seatingSystem.isSeated();
            const seated = this.seatingSystem.trySeat(this.camera, avatar?.object);
            if (seated) {
              this.isSitting = this.seatingSystem.isSeated();
              console.log(
                `[World] ${this.isSitting ? 'Sitting' : 'Standing'} (was: ${wasSeated ? 'sitting' : 'standing'})`
              );
            }
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      // Cleanup wird in dispose() gemacht
    } else {
      console.log('[World] Seating system not initialized (no seats in template)');
    }
  }

  private async applyTemplateLighting(template: TemplateInstance): Promise<void> {
    const manifest = template.manifest;
    if (!manifest) return;

    // Load HDRI if available
    if (manifest.assets?.hdri && this.pmremGenerator) {
      // Use same path pattern as TemplateHost (templates/{id}/...)
      const hdriPath = `/templates/${manifest.id}/${manifest.assets.hdri}`;
      try {
        const texture = await new Promise<Texture>((resolve, reject) => {
          new RGBELoader().load(
            hdriPath,
            (tex) => resolve(tex),
            undefined,
            (err) => reject(err)
          );
        });

        const envMap = this.pmremGenerator.fromEquirectangular(texture).texture;
        this.scene.environment = envMap;
        this.scene.background = envMap;

        // Hide default lights when HDRI is loaded
        if (this.defaultLights) {
          this.scene.remove(this.defaultLights.hemi);
          this.scene.remove(this.defaultLights.sun);
          this.defaultLights.hemi.dispose();
          this.defaultLights.sun.dispose();
          this.defaultLights = null;
        }

        texture.dispose();
        console.log('✅ HDRI loaded:', hdriPath);
      } catch (error) {
        console.warn('⚠️ Failed to load HDRI, using default lights:', error);
        // Keep default lights if HDRI fails
      }
    } else {
      // No HDRI in manifest, ensure default lights are active
      if (!this.defaultLights) {
        const hemi = new HemisphereLight(0xffffff, 0x223344, 0.6);
        this.scene.add(hemi);
        const sun = new DirectionalLight(0xffffff, 1.4);
        sun.position.set(5, 10, 2);
        sun.castShadow = true;
        this.scene.add(sun);
        this.defaultLights = { hemi, sun };
      }
      console.log('ℹ️ No HDRI in manifest, using default lights');
    }

    // Apply exposure from manifest if specified
    if (manifest.lighting?.exposure !== undefined) {
      this.renderer.toneMappingExposure = manifest.lighting.exposure;
    }
  }

  private async createLocalAvatar(): Promise<void> {
    if (!this.avatarManager || !this.netClient || this.soloMode) return;

    try {
      // Versuche Ready Player Me Avatar zu laden (Placeholder URL)
      const avatarUrl =
        import.meta.env.VITE_READY_PLAYER_ME_AVATAR_URL ||
        'https://models.readyplayer.me/placeholder.glb';

      await this.avatarManager.loadAvatar(this.userId, avatarUrl, { x: 0, y: 0, z: 0 });
    } catch (error) {
      console.warn('Failed to load Ready Player Me avatar, using capsule:', error);
      // Fallback: Einfache Kapsel erstellen
      await this.createCapsuleAvatar();
    }
  }

  private async createCapsuleAvatar(): Promise<void> {
    if (!this.avatarManager) return;

    // Erstelle Kapsel-Avatar als Fallback
    this.avatarManager.createCapsuleAvatar(this.userId, {
      x: this.camera.position.x,
      y: 0,
      z: this.camera.position.z,
    });
  }

  private handleResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.postProcessing.setSize(width, height);
  }

  private validateCameraPosition(): void {
    // Validate camera position - reset to spawn if invalid
    const pos = this.camera.position;
    const isValid =
      isFinite(pos.x) &&
      isFinite(pos.y) &&
      isFinite(pos.z) &&
      pos.y >= -10 &&
      pos.y <= 100 &&
      Math.abs(pos.x) < 1000 &&
      Math.abs(pos.z) < 1000;

    if (!isValid) {
      console.warn('[World] Invalid camera position detected, resetting to spawn');
      const template = this.templateHost.getCurrentTemplate();
      if (template?.manifest?.spawn) {
        const spawn = template.manifest.spawn;
        let spawnPos: [number, number, number];
        if (Array.isArray(spawn)) {
          spawnPos = spawn as [number, number, number];
        } else if ('position' in spawn && Array.isArray(spawn.position)) {
          spawnPos = spawn.position as [number, number, number];
        } else {
          spawnPos = [0, 1.6, 6];
        }
        this.camera.position.set(spawnPos[0], spawnPos[1], spawnPos[2]);
        this.controls.target.set(spawnPos[0], spawnPos[1], spawnPos[2]);
        this.controls.update();
      } else {
        // Fallback to default position
        this.camera.position.set(0, 1.6, 6);
        this.controls.target.set(0, 1.6, 6);
        this.controls.update();
      }
    }
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    // Validate camera position periodically (every 60 frames ~1 second at 60fps)
    if (this.frameCount % 60 === 0) {
      this.validateCameraPosition();
    }

    // Update PlayerController if active (ALWAYS update when locked, for WASD movement)
    if (this.playerController && this.playerController.controls.isLocked) {
      // Collect remote avatar positions for collision detection
      const remotePeers: Vector3[] = [];
      if (this.avatarManager) {
        const allAvatars = this.avatarManager.getAllAvatars();
        allAvatars.forEach((avatar) => {
          if (avatar.userId !== this.userId) {
            remotePeers.push(new Vector3(avatar.position.x, avatar.position.y, avatar.position.z));
          }
        });
      }

      // Update PlayerController with remote peers for collision detection
      this.playerController.setRemotePeers(remotePeers);

      // Disable OrbitControls when PointerLock is active (prevents setPointerCapture error)
      this.controls.enabled = false;

      // Update CameraRig if active (only in TP mode, FP mode uses PlayerController directly)
      if (this.cameraRig && this.avatarManager) {
        const localAvatar = this.avatarManager.getAvatar(this.userId);
        if (localAvatar) {
          const isFP = this.cameraRig.mode === 'fp';

          if (isFP) {
            // FP mode: PlayerController moves camera directly, CameraRig should NOT override
            // Only sync avatar position to camera
            this.playerController.update(delta);
            // Avatar position: camera is at head level (y=1.6), avatar feet should be at y=0
            // Ready Player Me avatars are normalized to 1.7m height, so head is at y≈1.7
            // Position avatar so feet are at y=0 (avatar center is typically at y≈0.85)
            localAvatar.object.position.set(
              this.camera.position.x,
              this.camera.position.y - 1.7, // Avatar feet at y=0, head at y≈1.7
              this.camera.position.z
            );
            localAvatar.object.rotation.y = this.camera.rotation.y;
            // Ensure avatar is visible in FP mode (body should be visible when looking down)
            localAvatar.object.visible = true;

            // Update avatar animation based on movement
            const animation = this.playerController.isMoving() ? 'walk' : 'idle';
            this.avatarManager.updateAvatar(
              this.userId,
              {
                x: localAvatar.object.position.x,
                y: localAvatar.object.position.y,
                z: localAvatar.object.position.z,
              },
              {
                x: localAvatar.object.rotation.x,
                y: localAvatar.object.rotation.y,
                z: localAvatar.object.rotation.z,
              },
              animation
            );
            // DO NOT call cameraRig.update() in FP mode - it would override PlayerController!
          } else {
            // TP mode: PlayerController moves camera, then CameraRig repositions it behind avatar
            // BUT: We need to sync avatar position FIRST, then let CameraRig position camera
            this.playerController.update(delta);

            // Sync avatar to camera position BEFORE CameraRig updates
            // Avatar feet at y=0, head at y≈1.7
            localAvatar.object.position.set(
              this.camera.position.x,
              this.camera.position.y - 1.7,
              this.camera.position.z
            );
            localAvatar.object.rotation.y = this.camera.rotation.y;
            // Ensure avatar is fully visible in TP mode
            localAvatar.object.visible = true;

            // Update avatar animation based on movement
            const animation = this.playerController.isMoving() ? 'walk' : 'idle';
            this.avatarManager.updateAvatar(
              this.userId,
              {
                x: localAvatar.object.position.x,
                y: localAvatar.object.position.y,
                z: localAvatar.object.position.z,
              },
              {
                x: localAvatar.object.rotation.x,
                y: localAvatar.object.rotation.y,
                z: localAvatar.object.rotation.z,
              },
              animation
            );

            // Now CameraRig can reposition camera behind avatar
            this.cameraRig.update(delta, this.scene);
          }
        } else {
          // No avatar, just update PlayerController
          this.playerController.update(delta);
        }
      } else {
        // No CameraRig, just update PlayerController (CRITICAL: This enables WASD movement!)
        this.playerController.update(delta);

        // Sync avatar position and animation when no CameraRig
        if (this.avatarManager) {
          const localAvatar = this.avatarManager.getAvatar(this.userId);
          if (localAvatar) {
            // Avatar feet at y=0, head at y≈1.7
            localAvatar.object.position.set(
              this.camera.position.x,
              this.camera.position.y - 1.7,
              this.camera.position.z
            );
            localAvatar.object.rotation.y = this.camera.rotation.y;
            // Ensure avatar is visible
            localAvatar.object.visible = true;

            // Update avatar animation based on movement
            const animation = this.playerController.isMoving() ? 'walk' : 'idle';
            this.avatarManager.updateAvatar(
              this.userId,
              {
                x: localAvatar.object.position.x,
                y: localAvatar.object.position.y,
                z: localAvatar.object.position.z,
              },
              {
                x: localAvatar.object.rotation.x,
                y: localAvatar.object.rotation.y,
                z: localAvatar.object.rotation.z,
              },
              animation
            );
          }
        }
      }
    } else {
      // Pointer Lock nicht aktiv - synchronisiere avatarPosition mit aktueller Kamera-Position
      // bevor updateAvatarMovement() aufgerufen wird
      if (this.avatarManager) {
        const localAvatar = this.avatarManager.getAvatar(this.userId);
        if (localAvatar) {
          // Synchronisiere avatarPosition mit Avatar-Objekt
          this.avatarPosition = {
            x: localAvatar.object.position.x,
            y: localAvatar.object.position.y,
            z: localAvatar.object.position.z,
          };
          this.avatarRotation = {
            x: localAvatar.object.rotation.x,
            y: localAvatar.object.rotation.y,
            z: localAvatar.object.rotation.z,
          };
        } else {
          // Fallback: Synchronisiere mit Kamera-Position (minus eye height)
          this.avatarPosition = {
            x: this.camera.position.x,
            y: this.camera.position.y - 1.6,
            z: this.camera.position.z,
          };
          this.avatarRotation = {
            x: 0,
            y: this.camera.rotation.y,
            z: 0,
          };
        }
      }

      // Pointer Lock nicht aktiv - OrbitControls für Kamera-Rotation
      this.controls.enabled = true;

      // Update avatar movement (WASD controls) - fallback to OrbitControls
      this.updateAvatarMovement(delta);
      // Update controls (for camera rotation)
      this.controls.update();
    }

    // Update template host
    this.templateHost.update(delta);

    // Avatar-Interpolation für smooth movement
    if (this.avatarManager) {
      this.avatarManager.updateInterpolation(delta);
      // Update avatar animations
      this.avatarManager.updateAnimations(delta);

      // Update procedural idle fallback if no animations available
      const local = this.avatarManager.getLocal();
      if (
        local &&
        (local as any).proceduralIdle &&
        typeof (local as any).proceduralIdle === 'function'
      ) {
        (local as any).proceduralIdle(delta);
      }
    }

    // Avatar-Position synchronisieren (throttled) - nur wenn nicht WASD-Steuerung aktiv
    // WASD-Steuerung aktualisiert Avatar direkt, hier nur für Multiplayer-Sync
    const now = Date.now();
    if (
      this.netClient &&
      this.avatarManager &&
      !this.soloMode &&
      now - this.lastAvatarUpdate > this.AVATAR_UPDATE_THROTTLE
    ) {
      // Sync current avatar position to network
      const avatar = this.avatarManager.getAvatar(this.userId);
      if (avatar) {
        this.netClient.updateAvatar(avatar.position, avatar.rotation, avatar.animation);
      }
      this.lastAvatarUpdate = now;
    }

    // Spatial Audio: Listener-Position aktualisieren
    if (this.voiceClient) {
      const cameraPos = this.camera.position;
      this.voiceClient.updateListenerPosition({
        x: cameraPos.x,
        y: cameraPos.y,
        z: cameraPos.z,
      });

      // Update peer positions for spatial audio (if LiveKitProvider supports it)
      if (this.avatarManager && getFeatureFlags().VOICE_ENABLED) {
        const allAvatars = this.avatarManager.getAllAvatars();
        allAvatars.forEach((avatar) => {
          if (avatar.userId !== this.userId) {
            // Try to update peer position via voice client
            const voiceProvider = (this.voiceClient as VoiceClientWithProvider)?.provider;
            if (voiceProvider && typeof voiceProvider.setPeerPosition === 'function') {
              voiceProvider.setPeerPosition(
                avatar.userId,
                avatar.position.x,
                avatar.position.y,
                avatar.position.z
              );
            }
          }
        });
      }
    }

    // Update ZoneSystem - check zone every frame
    if (this.zoneSystem) {
      const zoneId = this.zoneSystem.which(this.camera.position);
      const currentActive = this.zoneSystem.getActive();
      if (zoneId !== currentActive) {
        this.zoneSystem.setActive(zoneId);
        // Update zone visualizer if enabled
        if (this.zoneVisualizer) {
          this.zoneVisualizer.highlightZone(zoneId);
        }
        // Apply zone-specific audio settings (gain, reverb)
        if (this.voiceClient && getFeatureFlags().VOICE_ENABLED) {
          const zoneGain = this.zoneSystem.gainFor(zoneId);
          const zoneReverb = this.zoneSystem.reverbFor(zoneId);
          this.voiceClient.applyZoneSettings(zoneGain, zoneReverb || undefined);
        }
      }
    }

    // Update Ambience3D Listener
    if (this.ambience3D) {
      this.ambience3D.setListener(
        this.camera.position.x,
        this.camera.position.y,
        this.camera.position.z
      );
    }

    // Update Lip-Sync
    if (this.micAnalyser && this.lipDriver && this.avatarManager) {
      const amplitude = this.micAnalyser.sample();
      const avatar = this.avatarManager.getAvatar(this.userId);
      if (avatar) {
        this.lipDriver.update(amplitude);
      }
    }

    // Update FPS
    this.updateFPS();

    // Windrad-Rotor Rotation (if present)
    this.updateWindTurbineRotation(delta);

    // Render
    this.postProcessing.render(delta);
  }

  private rotorNode: Object3D | null = null;
  private rotorFound = false;

  private updateWindTurbineRotation(delta: number): void {
    // Find rotor node on first frame (throttled search)
    if (!this.rotorFound && this.scene) {
      this.scene.traverse((obj) => {
        const name = obj.name.toLowerCase();
        if ((name.includes('rotor') || name.includes('blade')) && !this.rotorNode) {
          this.rotorNode = obj;
          this.rotorFound = true;
        }
      });
    }

    // Rotate rotor if found (90°/s = Math.PI/2 per second, horizontal rotation around z-axis)
    if (this.rotorNode) {
      const rotationSpeed = Math.PI / 2; // radians per second
      // Optional: Slow down rotation at distance (temporal aliasing prevention)
      const distance = this.rotorNode.position.distanceTo(this.camera.position);
      const distanceFactor = distance > 50 ? 0.5 : 1.0; // Slow down at >50 units
      this.rotorNode.rotation.z += rotationSpeed * delta * distanceFactor;
    }
  }

  private updateFPS(): void {
    this.frameCount++;
    const now = Date.now();
    if (now - this.lastFpsUpdate >= this.FPS_UPDATE_INTERVAL) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }

  getFPS(): number {
    return this.fps;
  }

  getPlayerCount(): number {
    if (!this.netClient || this.soloMode) return 1;
    return this.netClient.getPlayerCount() || 1;
  }

  async enableVoice(): Promise<void> {
    if (!this.voiceClient) {
      console.warn('VoiceClient not initialized');
      return;
    }
    try {
      await this.voiceClient.enable();
      console.log('Voice enabled successfully');

      // Attach mic stream to MicAnalyser for lip-sync
      if (this.micAnalyser && this.voiceClient) {
        const provider = (this.voiceClient as VoiceClientWithProvider).provider;
        if (provider && provider.room) {
          // Type assertion for room object (structure depends on provider)
          const room = provider.room as {
            localParticipant?: {
              audioTrackPublications?: Map<string, unknown>;
            };
          };
          const audioTracks = room.localParticipant?.audioTrackPublications;
          if (audioTracks) {
            const firstTrack = Array.from(audioTracks.values())[0] as
              | { track?: { mediaStreamTrack?: MediaStreamTrack } }
              | undefined;
            if (firstTrack?.track?.mediaStreamTrack) {
              const stream = new MediaStream([firstTrack.track.mediaStreamTrack]);
              await this.micAnalyser.attach(stream);
            }
          }
        }
      }

      // Attach avatar to LipDriver
      if (this.lipDriver && this.avatarManager) {
        const avatar = this.avatarManager.getAvatar(this.userId);
        if (avatar) {
          this.lipDriver.attach(avatar.object);
        }
      }
    } catch (error) {
      console.error('Failed to enable voice:', error);
      throw error;
    }
  }

  attachLocalMicStream(stream: MediaStream): void {
    if (this.micAnalyser) {
      this.micAnalyser.attach(stream).catch((err) => {
        console.warn('Failed to attach mic stream:', err);
      });
    }
    if (this.lipDriver && this.avatarManager) {
      const avatar = this.avatarManager.getAvatar(this.userId);
      if (avatar) {
        this.lipDriver.attach(avatar.object);
      }
    }
  }

  getMicLevel(): number {
    return this.micAnalyser?.sample() || 0;
  }

  disableVoice(): void {
    if (!this.voiceClient) {
      return;
    }

    this.voiceClient.disable();
  }

  getScene(): Scene {
    return this.scene;
  }

  getCamera(): PerspectiveCamera {
    return this.camera;
  }

  getRenderer(): WebGLRenderer {
    return this.renderer;
  }

  getCurrentTemplate(): TemplateInstance | null {
    return this.templateHost.getCurrentTemplate();
  }

  lockPointer(): void {
    if (this.playerController) {
      this.playerController.lock();
      console.log('[PointerLock] Lock requested');
    }
  }

  unlockPointer(): void {
    if (this.playerController) {
      this.playerController.unlock();
    }
  }

  togglePointerLock(): void {
    if (this.playerController) {
      if (this.playerController.controls.isLocked) {
        this.playerController.unlock();
      } else {
        this.playerController.lock();
      }
    }
  }

  setAudioVolume(volume: number): void {
    if (this.ambientManager) {
      this.ambientManager.setMasterVolume(volume);
    }
    // VoiceClient hat keine direkte Volume-API, daher nur AmbientManager
  }

  setMouseInvert(invert: boolean): void {
    if (this.playerController) {
      this.playerController.setMouseInvert(invert);
    }
  }

  hasPlayerController(): boolean {
    return this.playerController !== null;
  }

  setExposure(exposure: number): void {
    this.renderer.toneMappingExposure = Math.max(0.1, Math.min(3.0, exposure));
  }

  async loadTemplate(templateId: string): Promise<void> {
    console.log(`[World] Switching to template: ${templateId}`);

    // Cleanup old template features before loading new template
    this.cleanupTemplateFeatures();

    // Load new template
    await this.templateHost.loadTemplate(templateId);

    // Rebuild Eco environment if needed (after template load/unmount might have cleared scene)
    const flags = getFeatureFlags();
    if (
      this.ecoAutoBuilt &&
      (flags.TEMPLATE_ID === 'watt-eco' || import.meta.env.VITE_ECO_ENABLED === 'true')
    ) {
      if (import.meta.env.VITE_ECO_AUTO_ENABLED === 'true') {
        // Check if scene was cleared (no Ground object)
        const hasGround = this.scene.children.some((obj) => obj.name === 'Ground');
        if (!hasGround) {
          console.log('[World] Rebuilding procedural scene after template load');
          await buildEcoAuto(this.scene);
        }
      }
    }

    // Apply lighting from new template
    const template = this.templateHost.getCurrentTemplate();
    if (template) {
      await this.applyTemplateLighting(template);

      // Reinitialize template features (Props, Zones, Screens, Ambience3D)
      await this.initTemplateFeatures(template);

      // Reinitialize navigation mesh for new template
      await this.initNavigation();

      // Set camera to spawn position from manifest (even if PlayerController not yet created)
      if (template.manifest?.spawn) {
        const spawn = template.manifest.spawn;
        let spawnPos: [number, number, number];
        let spawnRotY = 0;

        // Handle different spawn formats
        if (Array.isArray(spawn)) {
          // Format: [x, y, z]
          spawnPos = spawn as [number, number, number];
        } else if ('position' in spawn && Array.isArray(spawn.position)) {
          // Format: { position: [x, y, z], rotationY?: number }
          spawnPos = spawn.position as [number, number, number];
          spawnRotY = spawn.rotationY || 0;
        } else if ('x' in spawn || 'y' in spawn || 'z' in spawn) {
          // Format: { x: number, y: number, z: number }
          spawnPos = [
            (spawn as { x?: number }).x || 0,
            (spawn as { y?: number }).y || 1.6,
            (spawn as { z?: number }).z || 6,
          ];
        } else {
          // Fallback - position camera to see the scene better
          spawnPos = [0, 1.6, 8]; // Further back to see more of the scene
        }

        // Set camera position immediately
        this.camera.position.set(spawnPos[0], spawnPos[1], spawnPos[2]);
        this.camera.rotation.y = spawnRotY;
        this.controls.target.set(spawnPos[0], spawnPos[1], spawnPos[2]);
        this.controls.update();
        console.log(
          `[World] Camera positioned at spawn: (${spawnPos[0]}, ${spawnPos[1]}, ${spawnPos[2]}), rotationY: ${spawnRotY}`
        );
        console.log(
          `[World] Camera looking at: (${this.controls.target.x}, ${this.controls.target.y}, ${this.controls.target.z})`
        );

        // Initialize PlayerController with spawn position from manifest
        if (!this.playerController) {
          this.playerController = new PlayerController(this.camera, this.renderer.domElement, {
            position: spawnPos,
            rotationY: spawnRotY,
          });

          // Attach NavController if already initialized
          if (this.navController) {
            this.playerController.attachNavController(this.navController);
          }
        }
      } else {
        // No spawn in manifest - initialize PlayerController with default position
        if (!this.playerController) {
          const defaultSpawn: [number, number, number] = [0, 1.6, 6];
          this.camera.position.set(...defaultSpawn);
          this.controls.target.set(...defaultSpawn);
          this.controls.update();
          console.log(
            `[World] No spawn in manifest, using default position: (${defaultSpawn[0]}, ${defaultSpawn[1]}, ${defaultSpawn[2]})`
          );
          this.playerController = new PlayerController(this.camera, this.renderer.domElement, {
            position: defaultSpawn,
            rotationY: 0,
          });

          // Attach NavController if already initialized
          if (this.navController) {
            this.playerController.attachNavController(this.navController);
          }
        }
      }
    }

    // Load ambient audio from new template
    if (this.ambientManager && template) {
      this.ambientManager.stopAll();
      this.ambientManager.loadFromTemplate(template.manifest);
      // playAll() is async and handles context resume automatically
      this.ambientManager.playAll().catch((error) => {
        console.warn('Failed to play ambient audio:', error);
      });
    }
  }

  dispose(): void {
    // Cleanup Navigation
    if (this.navMeshSystem) {
      this.navMeshSystem.dispose();
      this.navMeshSystem = null;
    }
    this.navController = null;

    // Cleanup PMREM Generator
    if (this.pmremGenerator) {
      this.pmremGenerator.dispose();
      this.pmremGenerator = null;
    }

    // Cleanup default lights
    if (this.defaultLights) {
      this.scene.remove(this.defaultLights.hemi);
      this.scene.remove(this.defaultLights.sun);
      this.defaultLights.hemi.dispose();
      this.defaultLights.sun.dispose();
      this.defaultLights = null;
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Event listener cleanup
    window.removeEventListener('resize', this.boundHandleResize);

    // NetClient event cleanup
    this.netClientEventCleanups.forEach((cleanup) => cleanup());
    this.netClientEventCleanups = [];

    // Cleanup Multiplayer
    if (this.netClient) {
      this.netClient.disconnect();
    }

    // Cleanup Avatars
    if (this.avatarManager) {
      // Alle Avatare entfernen
      const allAvatars = this.avatarManager.getAllAvatars();
      allAvatars.forEach((avatar) => {
        this.avatarManager?.removeAvatar(avatar.userId);
      });
    }

    // Cleanup Audio
    if (this.ambientManager) {
      this.ambientManager.dispose();
    }

    if (this.ambience3D) {
      this.ambience3D.dispose();
    }

    if (this.voiceClient) {
      this.voiceClient.disable();
    }

    // Cleanup MicAnalyser & LipDriver
    if (this.micAnalyser) {
      this.micAnalyser.dispose();
      this.micAnalyser = null;
    }
    this.lipDriver = null;

    // Cleanup Template++ Features
    this.props.forEach((prop) => {
      this.scene.remove(prop.object);
      interface Disposable {
        dispose?: () => void;
      }
      prop.object.traverse((obj) => {
        const disposable = obj as Object3D & Disposable;
        if (disposable.dispose) {
          disposable.dispose();
        }
      });
    });
    this.props = [];

    this.screens.forEach((screen) => {
      screen.detach();
      this.scene.remove(screen.mesh);
    });
    this.screens = [];

    // Cleanup media billboards
    this.mediaBillboards.forEach((billboard) => {
      billboard.dispose();
      this.scene.remove(billboard.getObject());
    });
    this.mediaBillboards.clear();

    // Cleanup zone visualizer
    if (this.zoneVisualizer) {
      this.zoneVisualizer.dispose();
      this.zoneVisualizer = null;
    }

    this.templateHost.dispose();
    this.postProcessing.dispose();
    if (this.xrAdapter && 'dispose' in this.xrAdapter) {
      (this.xrAdapter as { dispose: () => void }).dispose();
    }
    this.controls.dispose();
    this.renderer.dispose();

    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }

  getNetClient(): NetClient | null {
    return this.netClient;
  }

  getAvatarManager(): AvatarManager | null {
    return this.avatarManager;
  }

  getRig(): CameraRig | null {
    return this.cameraRig;
  }

  getAgentBridge(): AgentBridge | null {
    return this.agentBridge;
  }

  switchView(): void {
    if (this.cameraRig) {
      this.cameraRig.switch();
      const isFP = this.cameraRig.mode === 'fp';
      // Hide local avatar head in FP mode
      if (this.avatarManager) {
        this.avatarManager.setLocalVisibleHead(!isFP, this.userId);
      }
      console.log(
        '[CameraRig] Switched to',
        this.cameraRig.mode === 'fp' ? 'First-Person' : 'Third-Person'
      );
    }
  }

  async loadAvatarFromUrl(url: string): Promise<void> {
    if (!this.avatarManager) {
      console.warn('AvatarManager not initialized');
      return;
    }

    try {
      await this.avatarManager.setLocalAvatarUrl(url);
      console.log('✅ Avatar loaded from URL:', url);
    } catch (error) {
      console.error('Failed to load avatar from URL:', error);
      // Fallback: Capsule Avatar
      const spawnPos = this.camera.position;
      const position = {
        x: spawnPos.x,
        y: spawnPos.y - 1.6,
        z: spawnPos.z,
      };
      this.avatarManager.createCapsuleAvatar(this.userId, position);
    }
  }

  getRoomId(): string {
    return this.getRoomIdFromURL();
  }

  getVoiceClient(): VoiceClient | null {
    return this.voiceClient;
  }

  isSoloMode(): boolean {
    return this.soloMode;
  }

  getUserId(): string {
    return this.userId;
  }

  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
    // Update NetClient if it exists
    if (this.netClient) {
      // Reconnect with new session ID if needed
      // Note: NetClient doesn't have a setSessionId method, so we may need to reconnect
      // For now, we just store it and it will be used on next connection
    }
  }

  buildStageScreen(screenId: string = 'main'): ScreenSurface | null {
    return this.screens.find((s) => s.mesh.name === screenId) || this.screens[0] || null;
  }

  attachLocalStream(stream: MediaStream): void {
    const screen = this.buildStageScreen();
    if (screen) {
      screen.attach(stream);
    }
  }

  attachRemoteStream(_participantId: string, stream: MediaStream | null): void {
    const screen = this.buildStageScreen();
    if (screen) {
      if (stream) {
        screen.attach(stream);
      } else {
        screen.detach();
      }
    }
  }

  triggerEmote(emoteId: EmoteId): void {
    if (!this.emoteSystem || !this.avatarManager) return;
    const avatar = this.avatarManager.getAvatar(this.userId);
    if (avatar) {
      this.emoteSystem.trigger(avatar.object, emoteId);
    }
  }

  private setupChat(): void {
    if (!this.netClient) return;

    this.netClient.onChat((data) => {
      this.chatMessages.push(data);
      // Limit to last 100 messages
      if (this.chatMessages.length > 100) {
        this.chatMessages.shift();
      }
      // Notify callbacks
      this.chatMessageCallbacks.forEach((cb) => cb(data));
    });

    // Media Sharing
    this.netClient.onMediaShare((data) => {
      this.addMediaBillboard(data);
    });

    // File Sharing
    this.netClient.onFileShare((data) => {
      this.handleFileShare(data);
    });
  }

  private addMediaBillboard(data: {
    userId: string;
    url: string;
    type: 'image' | 'video';
    position: { x: number; y: number; z: number };
    width?: number;
    height?: number;
  }): void {
    const billboardId = `media-${data.userId}-${Date.now()}`;
    const billboard = new MediaBillboard({
      url: data.url,
      type: data.type,
      position: data.position,
      width: data.width,
      height: data.height,
    });

    // Look at camera
    billboard.lookAt(this.camera.position);
    this.scene.add(billboard.getObject());
    this.mediaBillboards.set(billboardId, billboard);

    // Auto-remove after 5 minutes
    setTimeout(
      () => {
        const b = this.mediaBillboards.get(billboardId);
        if (b) {
          b.dispose();
          this.scene.remove(b.getObject());
          this.mediaBillboards.delete(billboardId);
        }
      },
      5 * 60 * 1000
    );
  }

  shareMedia(
    url: string,
    type: 'image' | 'video',
    position?: { x: number; y: number; z: number }
  ): void {
    if (!this.netClient || this.soloMode) return;

    const pos = position || {
      x: this.camera.position.x,
      y: this.camera.position.y + 1,
      z: this.camera.position.z + 2,
    };

    this.netClient.shareMedia({
      url,
      type,
      position: pos,
      width: 4,
      height: 3,
    });

    // Add locally immediately
    this.addMediaBillboard({ userId: this.userId, url, type, position: pos });
  }

  shareFile(
    file: { id: string; url: string; mimeType: string; originalName: string },
    position?: { x: number; y: number; z: number }
  ): void {
    if (!this.netClient || this.soloMode) return;

    const pos = position || {
      x: this.camera.position.x,
      y: this.camera.position.y + 1,
      z: this.camera.position.z + 2,
    };

    this.netClient.shareFile({
      fileId: file.id,
      url: file.url,
      mimeType: file.mimeType,
      originalName: file.originalName,
      position: pos,
    });

    // Handle locally immediately
    this.handleFileShare({
      userId: this.userId,
      fileId: file.id,
      url: file.url,
      mimeType: file.mimeType,
      originalName: file.originalName,
      position: pos,
      timestamp: Date.now(),
    });
  }

  private handleFileShare(data: {
    userId: string;
    fileId: string;
    url: string;
    mimeType: string;
    originalName: string;
    position?: { x: number; y: number; z: number };
    timestamp: number;
  }): void {
    // For images/videos, use media billboard
    if (data.mimeType.startsWith('image/') || data.mimeType.startsWith('video/')) {
      this.addMediaBillboard({
        userId: data.userId,
        url: data.url,
        type: data.mimeType.startsWith('image/') ? 'image' : 'video',
        position: data.position || {
          x: this.camera.position.x,
          y: this.camera.position.y + 1,
          z: this.camera.position.z + 2,
        },
      });
    }
    // For PDFs and other files, we could add a 3D file icon or link
    // For MVP, files are accessible via Pinboard
  }

  setAvatarAnimation(animation: string): void {
    if (!this.avatarManager || !this.netClient || this.soloMode) return;
    const avatar = this.avatarManager.getAvatar(this.userId);
    if (!avatar) return;

    // Handle sitting animation specially
    if (animation === 'sit' && !this.isSitting) {
      this.handleSit();
      return;
    } else if (animation !== 'sit' && this.isSitting) {
      this.handleStand();
      return;
    }

    const cameraPos = this.camera.position;
    const cameraRot = this.camera.rotation;
    this.avatarManager.updateAvatar(this.userId, cameraPos, cameraRot, animation);
  }

  private setupInteractionHandlers(): void {
    this.renderer.domElement.addEventListener('click', (e) => {
      if (!this.interactionManager || this.soloMode) return;

      const rect = this.renderer.domElement.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const interactable = this.interactionManager.raycastFromCamera(
        this.camera,
        mouseX,
        mouseY,
        rect.width,
        rect.height
      );

      if (interactable && interactable.type === 'chair' && !this.isSitting) {
        this.handleSit(interactable);
      }
    });
  }

  private handleSit(interactable?: { position: { x: number; y: number; z: number } }): void {
    if (this.isSitting) return;

    let sitPosition: { x: number; y: number; z: number };

    if (interactable) {
      sitPosition = interactable.position;
    } else {
      // Find nearest interactable
      const nearest = this.interactionManager?.findNearestInteractable(this.camera.position, 2.0);
      if (nearest) {
        sitPosition = nearest.position;
      } else {
        // Default sit position (slightly below camera)
        sitPosition = {
          x: this.camera.position.x,
          y: this.camera.position.y - 1,
          z: this.camera.position.z,
        };
      }
    }

    this.isSitting = true;

    // Update avatar animation
    if (this.avatarManager) {
      this.avatarManager.updateAvatar(
        this.userId,
        sitPosition,
        { x: 0, y: this.camera.rotation.y, z: 0 },
        'sit'
      );
    }

    // Lock camera position (optional - can be disabled for better UX)
    // this.controls.enabled = false;
  }

  private handleStand(): void {
    if (!this.isSitting) return;

    this.isSitting = false;

    // Restore camera controls
    // this.controls.enabled = true;

    // Update avatar animation back to idle
    if (this.avatarManager) {
      const cameraPos = this.camera.position;
      const cameraRot = this.camera.rotation;
      this.avatarManager.updateAvatar(this.userId, cameraPos, cameraRot, 'idle');
    }
  }

  sendChatMessage(message: string): void {
    if (!this.netClient || this.soloMode) return;
    this.netClient.sendChat(message);
  }

  getChatMessages(): Array<{ userId: string; message: string; timestamp: number }> {
    return [...this.chatMessages];
  }

  onChatMessage(
    callback: (message: { userId: string; message: string; timestamp: number }) => void
  ): () => void {
    this.chatMessageCallbacks.push(callback);
    return () => {
      const index = this.chatMessageCallbacks.indexOf(callback);
      if (index > -1) {
        this.chatMessageCallbacks.splice(index, 1);
      }
    };
  }
}
