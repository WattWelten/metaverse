import { AmbientManager } from '@metaverse/audio';
import { AvatarManager } from '@metaverse/avatars';
import type { TemplateInstance } from '@metaverse/core';
import { MediaBillboard, setPhysicallyCorrectLights } from '@metaverse/core';
import { NetClient } from '@metaverse/net';
import { VoiceClient } from '@metaverse/voice';
import type { IXRAdapter } from '@metaverse/xr';
import { createXRAdapter } from '@metaverse/xr';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  ACESFilmicToneMapping,
  Color,
  Clock,
  Object3D,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { getFeatureFlags, type FeatureFlags } from './FeatureFlags';
import { InteractionManager } from './interactions/InteractionManager';
import { PostProcessing } from './render/Post';
import { TemplateHost } from './TemplateHost';

export class World {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private templateHost: TemplateHost;
  private xrAdapter: IXRAdapter | null = null;
  private postProcessing: PostProcessing;
  private clock: Clock;
  private animationFrameId: number | null = null;
  private container: HTMLElement;
  private boundHandleResize: () => void; // Speichere bound function für cleanup

  // Multiplayer & Networking
  private netClient: NetClient | null = null;
  private avatarManager: AvatarManager | null = null;
  private ambientManager: AmbientManager | null = null;
  private voiceClient: VoiceClient | null = null;
  private userId: string;
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
    this.renderer.outputColorSpace = 'srgb';
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    setPhysicallyCorrectLights(this.renderer);
    container.appendChild(this.renderer.domElement);

    // WebGL Context Lost Handler
    this.renderer.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      console.warn('WebGL context lost - attempting to restore...');
    });

    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored');
      // Re-initialize renderer settings
      this.renderer.outputColorSpace = 'srgb';
      this.renderer.toneMapping = ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.0;
      this.renderer.shadowMap.enabled = true;
      setPhysicallyCorrectLights(this.renderer);
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
    if (!flags.MULTIPLAYER_ENABLED) {
      console.log('Multiplayer disabled via feature flag');
      return;
    }

    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    const roomId = this.getRoomIdFromURL();

    this.netClient = new NetClient({
      serverUrl,
      userId: this.userId,
      roomId,
      autoConnect: false, // Manuell verbinden nach Template-Load
    });

    // Stoppe Reconnection-Versuche nach Timeout
    // Note: connectionTimeout and stopReconnection are reserved for future use

    // Avatar Manager initialisieren
    this.avatarManager = new AvatarManager(this.scene);
    if (this.netClient) {
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

  private initAudio(flags: FeatureFlags): void {
    // Ambient Audio
    if (flags.AMBIENT_AUDIO_ENABLED) {
      this.ambientManager = new AmbientManager();
    }

    // Voice Client
    if (flags.VOICE_ENABLED && this.netClient) {
      const roomId = this.getRoomIdFromURL();
      this.voiceClient = new VoiceClient({
        userId: this.userId,
        roomId,
        enableSpatialAudio: true,
        netClient: this.netClient.asVoiceClient(),
      });
    }
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

    // Load default template
    await this.templateHost.loadTemplate(flags.TEMPLATE_ID);

    // Apply lighting from template manifest
    const template = this.templateHost.getCurrentTemplate();
    if (template) {
      await this.applyTemplateLighting(template);
    }

    // Ambient Audio aus Template laden
    if (this.ambientManager && template) {
      this.ambientManager.loadFromTemplate(template.manifest);
      // playAll() is async and handles context resume automatically
      this.ambientManager.playAll().catch((error) => {
        console.warn('Failed to play ambient audio:', error);
      });
    }

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
    }

    // Multiplayer verbinden (nach Template-Load)
    if (this.netClient && flags.MULTIPLAYER_ENABLED) {
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
          const roomId = this.getRoomIdFromURL();
          this.netClient.joinRoom(roomId);
          // Lokalen Avatar erstellen
          await this.createLocalAvatar();
          // Chat-Events setzen
          this.setupChat();
        } else {
          console.log('Running in solo mode');
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

    // Start render loop
    this.animate();
  }

  private async applyTemplateLighting(_template: TemplateInstance): Promise<void> {
    // Lighting wird von TemplateHost.applyLighting() behandelt
    // Diese Methode wird beim mount() aufgerufen
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

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    // Update avatar movement (WASD controls)
    this.updateAvatarMovement(delta);

    // Update controls (for camera rotation)
    this.controls.update();

    // Update template host
    this.templateHost.update(delta);

    // Avatar-Interpolation für smooth movement
    if (this.avatarManager) {
      this.avatarManager.updateInterpolation(delta);
      // Update avatar animations
      this.avatarManager.updateAnimations(delta);
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
    } catch (error) {
      console.error('Failed to enable voice:', error);
      throw error;
    }
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

  setExposure(exposure: number): void {
    this.renderer.toneMappingExposure = Math.max(0.1, Math.min(3.0, exposure));
  }

  async loadTemplate(templateId: string): Promise<void> {
    await this.templateHost.loadTemplate(templateId);

    // Apply lighting from new template
    const template = this.templateHost.getCurrentTemplate();
    if (template) {
      await this.applyTemplateLighting(template);
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

    if (this.voiceClient) {
      this.voiceClient.disable();
    }

    // Cleanup media billboards
    this.mediaBillboards.forEach((billboard) => {
      billboard.dispose();
      this.scene.remove(billboard.getObject());
    });
    this.mediaBillboards.clear();

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
