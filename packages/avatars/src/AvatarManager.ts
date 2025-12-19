import { 
  Object3D, 
  Scene, 
  Mesh, 
  CylinderGeometry, 
  SphereGeometry, 
  MeshStandardMaterial,
  Sprite,
  SpriteMaterial,
  CanvasTexture,
  Group,
  Vector3
} from 'three';
import { loadReadyPlayerMeAvatar } from './loaders/rpm.js';

export interface Avatar {
  id: string;
  userId: string;
  object: Object3D;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  animation?: string;
  // Interpolation für smooth movement
  targetPosition?: { x: number; y: number; z: number };
  targetRotation?: { x: number; y: number; z: number };
  lastUpdateTime?: number;
}

export class AvatarManager {
  private avatars = new Map<string, Avatar>();
  private scene: Scene;
  private netClient: {
    getReplicator: () => {
      onAvatarUpdate: (callback: (update: {
        userId: string;
        position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number };
        animation?: string;
      }) => void) => () => void;
    };
    updateAvatar: (position: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number }, animation?: string) => void;
  } | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  setNetClient(netClient: AvatarManager['netClient']): void {
    this.netClient = netClient;
    
    // Listen to avatar updates from network
    if (netClient) {
      netClient.getReplicator().onAvatarUpdate((update) => {
        this.updateRemoteAvatar(update.userId, update);
      });
    }
  }

  async loadAvatar(userId: string, avatarUrl: string, position?: { x: number; y: number; z: number }): Promise<Avatar> {
    try {
      const avatarObject = await loadReadyPlayerMeAvatar(avatarUrl);
      
      const avatar: Avatar = {
        id: `avatar-${userId}`,
        userId,
        object: avatarObject,
        position: position || { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      };

      this.scene.add(avatar.object);
      this.avatars.set(userId, avatar);

      return avatar;
    } catch (error) {
      console.error(`Failed to load avatar for user ${userId}:`, error);
      // Fallback zu Kapsel-Avatar
      return this.createCapsuleAvatar(userId, position);
    }
  }

  createCapsuleAvatar(userId: string, position?: { x: number; y: number; z: number }): Avatar {
    const group = new Group();
    
    // Kapsel-Geometrie (Cylinder + 2 Halbkugeln)
    const radius = 0.3;
    const height = 1.2;
    
    // Körper (Cylinder)
    const bodyGeometry = new CylinderGeometry(radius, radius, height, 16);
    const bodyMaterial = new MeshStandardMaterial({ 
      color: this.getColorForUserId(userId),
      metalness: 0.3,
      roughness: 0.7,
    });
    const body = new Mesh(bodyGeometry, bodyMaterial);
    body.position.y = height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Kopf (Kugel)
    const headGeometry = new SphereGeometry(radius * 0.8, 16, 16);
    const headMaterial = new MeshStandardMaterial({ 
      color: 0xffdbac, // Hautfarbe
      metalness: 0.1,
      roughness: 0.9,
    });
    const head = new Mesh(headGeometry, headMaterial);
    head.position.y = height + radius * 0.8;
    head.castShadow = true;
    head.receiveShadow = true;
    group.add(head);

    // Name-Tag (Billboard Sprite)
    const nameTag = this.createNameTag(userId);
    nameTag.position.set(0, height + radius * 1.5, 0);
    group.add(nameTag);

    // Position setzen
    const pos = position || { x: 0, y: 0, z: 0 };
    group.position.set(pos.x, pos.y, pos.z);

    const avatar: Avatar = {
      id: `avatar-${userId}`,
      userId,
      object: group,
      position: { ...pos },
      rotation: { x: 0, y: 0, z: 0 },
    };

    this.scene.add(avatar.object);
    this.avatars.set(userId, avatar);

    return avatar;
  }

  private getColorForUserId(userId: string): number {
    // Generiere konsistente Farbe basierend auf userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Konvertiere zu Hex-Farbe (hellere Töne)
    const hue = Math.abs(hash) % 360;
    const saturation = 60 + (Math.abs(hash) % 20); // 60-80%
    const lightness = 50 + (Math.abs(hash) % 20); // 50-70%
    
    // HSL zu RGB (vereinfacht)
    const c = (1 - Math.abs(2 * (lightness / 100) - 1)) * (saturation / 100);
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = (lightness / 100) - c / 2;
    
    let r = 0, g = 0, b = 0;
    if (hue < 60) { r = c; g = x; b = 0; }
    else if (hue < 120) { r = x; g = c; b = 0; }
    else if (hue < 180) { r = 0; g = c; b = x; }
    else if (hue < 240) { r = 0; g = x; b = c; }
    else if (hue < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    return ((Math.round((r + m) * 255) << 16) | 
            (Math.round((g + m) * 255) << 8) | 
            Math.round((b + m) * 255));
  }

  private createNameTag(name: string): Sprite {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 512;
    canvas.height = 128;
    
    // Hintergrund mit abgerundeten Ecken
    context.fillStyle = 'rgba(0, 0, 0, 0.75)';
    context.beginPath();
    // roundRect ist in modernen Browsern verfügbar, Fallback für ältere
    if (context.roundRect) {
      context.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 10);
    } else {
      // Fallback: Rechteck ohne abgerundete Ecken
      context.rect(10, 10, canvas.width - 20, canvas.height - 20);
    }
    context.fill();
    
    // Border
    context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    context.lineWidth = 2;
    context.stroke();
    
    // Text
    context.fillStyle = '#ffffff';
    context.font = 'bold 32px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Kürze Namen wenn zu lang
    const displayName = name.length > 15 ? name.substring(0, 12) + '...' : name;
    context.fillText(displayName, canvas.width / 2, canvas.height / 2);
    
    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const spriteMaterial = new SpriteMaterial({ 
      map: texture,
      transparent: true,
      alphaTest: 0.1,
    });
    const sprite = new Sprite(spriteMaterial);
    sprite.scale.set(2, 0.5, 1);
    
    return sprite;
  }

  updateAvatar(userId: string, position: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number }, animation?: string): void {
    const avatar = this.avatars.get(userId);
    if (!avatar) return;

    avatar.position = { ...position };
    avatar.rotation = { ...rotation };
    avatar.animation = animation;

    avatar.object.position.set(position.x, position.y, position.z);
    avatar.object.rotation.set(rotation.x, rotation.y, rotation.z);

    // Sync to network
    if (this.netClient) {
      this.netClient.updateAvatar(
        { x: position.x, y: position.y, z: position.z },
        { x: rotation.x, y: rotation.y, z: rotation.z },
        animation
      );
    }
  }

  private updateRemoteAvatar(userId: string, update: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    animation?: string;
  }): void {
    let avatar = this.avatars.get(userId);
    
    // Erstelle Avatar falls nicht vorhanden (für neue Spieler)
    if (!avatar) {
      avatar = this.createCapsuleAvatar(userId, update.position);
    }

    // Interpolation: Setze Ziel-Position statt sofort zu bewegen
    avatar.targetPosition = { ...update.position };
    avatar.targetRotation = { ...update.rotation };
    avatar.animation = update.animation;
    avatar.lastUpdateTime = Date.now();
  }

  updateInterpolation(delta: number): void {
    const interpolationSpeed = 10; // Lerp-Faktor
    
    this.avatars.forEach((avatar) => {
      if (!avatar.targetPosition || !avatar.targetRotation) return;
      
      // Interpoliere Position
      const currentPos = avatar.object.position;
      const targetPos = avatar.targetPosition;
      
      currentPos.lerp(
        new Vector3(targetPos.x, targetPos.y, targetPos.z),
        Math.min(1, delta * interpolationSpeed)
      );
      
      // Interpoliere Rotation
      const currentRot = avatar.object.rotation;
      const targetRot = avatar.targetRotation;
      
      currentRot.x = this.lerpAngle(currentRot.x, targetRot.x, Math.min(1, delta * interpolationSpeed));
      currentRot.y = this.lerpAngle(currentRot.y, targetRot.y, Math.min(1, delta * interpolationSpeed));
      currentRot.z = this.lerpAngle(currentRot.z, targetRot.z, Math.min(1, delta * interpolationSpeed));
      
      // Update Avatar-Position für Konsistenz
      avatar.position = {
        x: currentPos.x,
        y: currentPos.y,
        z: currentPos.z,
      };
      avatar.rotation = {
        x: currentRot.x,
        y: currentRot.y,
        z: currentRot.z,
      };
    });
  }

  private lerpAngle(a: number, b: number, t: number): number {
    // Normalisiere Winkel für korrekte Interpolation
    const diff = ((b - a + Math.PI) % (2 * Math.PI)) - Math.PI;
    return a + diff * t;
  }

  removeAvatar(userId: string): void {
    const avatar = this.avatars.get(userId);
    if (avatar) {
      this.scene.remove(avatar.object);
      this.avatars.delete(userId);
    }
  }

  getAvatar(userId: string): Avatar | undefined {
    return this.avatars.get(userId);
  }

  getAllAvatars(): Avatar[] {
    return Array.from(this.avatars.values());
  }
}

