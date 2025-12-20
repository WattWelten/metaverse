import { AmbientManager } from '@metaverse/audio';
import { AvatarManager } from '@metaverse/avatars';
import type { TemplateInstance } from '@metaverse/core';
import { setPhysicallyCorrectLights } from '@metaverse/core';
import { NetClient } from '@metaverse/net';
import { VoiceClient } from '@metaverse/voice';
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
import { PostProcessing } from './render/Post';
import { TemplateHost } from './TemplateHost';
import { XRSetup } from './xr/XRSetup';

export class World {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private templateHost: TemplateHost;
  private xrSetup: XRSetup | undefined;
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
  private readonly AVATAR_UPDATE_THROTTLE = 100; // ms
  private soloMode = false;

  // Performance monitoring
  private fps = 0;
  private frameCount = 0;
  private lastFpsUpdate = 0;
  private readonly FPS_UPDATE_INTERVAL = 1000; // ms

  // Event listener cleanup
  private netClientEventCleanups: Array<() => void> = [];

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

    // XR Setup
    const flags = getFeatureFlags();
    if (flags.XR_ENABLED) {
      this.xrSetup = new XRSetup(this.renderer);
    }

    // Post Processing
    this.postProcessing = new PostProcessing(this.renderer, this.scene, this.camera);

    // Clock
    this.clock = new Clock();

    // Initialize Multiplayer & Audio Systems
    this.initMultiplayer(flags);
    this.initAudio(flags);

    // Resize handler - bound function speichern für cleanup
    this.boundHandleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.boundHandleResize);
  }

  private generateUserId(): string {
    return `user-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
  }

  private initMultiplayer(flags: FeatureFlags): void {
    if (!flags.MULTIPLAYER_ENABLED) {
      console.log('Multiplayer disabled via feature flag');
      return;
    }

    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

    this.netClient = new NetClient({
      serverUrl,
      userId: this.userId,
      roomId: 'default-room',
      autoConnect: false, // Manuell verbinden nach Template-Load
    });

    // Avatar Manager initialisieren
    this.avatarManager = new AvatarManager(this.scene);
    if (this.netClient) {
      this.avatarManager.setNetClient(this.netClient.asAvatarManagerClient());
    }

    // Fallback: Solo-Modus wenn Server nicht erreichbar
    const onConnectError = () => {
      console.warn('Server nicht erreichbar - Fallback zu Solo-Modus');
      this.soloMode = true;
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
      this.voiceClient = new VoiceClient({
        userId: this.userId,
        roomId: 'default-room',
        enableSpatialAudio: true,
        netClient: this.netClient.asVoiceClient(),
      });
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
      this.ambientManager.playAll();
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
          this.netClient.joinRoom('default-room');
          // Lokalen Avatar erstellen
          await this.createLocalAvatar();
        } else {
          console.log('Running in solo mode');
        }
      } catch (error) {
        console.warn('Multiplayer-Verbindung fehlgeschlagen:', error);
        this.soloMode = true;
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

    // Update controls
    this.controls.update();

    // Update template host
    this.templateHost.update(delta);

    // Avatar-Interpolation für smooth movement
    if (this.avatarManager) {
      this.avatarManager.updateInterpolation(delta);
    }

    // Avatar-Position synchronisieren (throttled)
    const now = Date.now();
    if (
      this.netClient &&
      this.avatarManager &&
      !this.soloMode &&
      now - this.lastAvatarUpdate > this.AVATAR_UPDATE_THROTTLE
    ) {
      const cameraPos = this.camera.position;
      const cameraRot = this.camera.rotation;

      this.avatarManager.updateAvatar(
        this.userId,
        { x: cameraPos.x, y: cameraPos.y, z: cameraPos.z },
        { x: cameraRot.x, y: cameraRot.y, z: cameraRot.z }
      );

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

    // Rotate rotor if found (90°/s = Math.PI/2 per second)
    if (this.rotorNode) {
      const rotationSpeed = Math.PI / 2; // radians per second
      // Optional: Slow down rotation at distance (temporal aliasing prevention)
      const distance = this.rotorNode.position.distanceTo(this.camera.position);
      const distanceFactor = distance > 50 ? 0.5 : 1.0; // Slow down at >50 units
      this.rotorNode.rotation.y += rotationSpeed * delta * distanceFactor;
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
      this.ambientManager.playAll();
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

    this.templateHost.dispose();
    this.postProcessing.dispose();
    if (this.xrSetup) {
      this.xrSetup.dispose();
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

  isSoloMode(): boolean {
    return this.soloMode;
  }
}
