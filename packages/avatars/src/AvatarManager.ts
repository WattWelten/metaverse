import type { NetClientForAvatarManager } from '@metaverse/net';
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
  Vector3,
  AnimationMixer,
  AnimationAction,
  AnimationClip,
  LoopRepeat,
} from 'three';

import { loadReadyPlayerMeAvatar } from './loaders/rpm.js';
import { createNameTag } from './NameTag.js';

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
  // Animation state
  animationMixer?: AnimationMixer;
  animationActions?: Map<string, AnimationAction>;
  currentAnimationAction?: AnimationAction;
}

export class AvatarManager {
  private avatars = new Map<string, Avatar>();
  private scene: Scene;
  private netClient: NetClientForAvatarManager | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  setNetClient(netClient: NetClientForAvatarManager): void {
    this.netClient = netClient;

    // Listen to avatar updates from network
    if (netClient) {
      netClient
        .getReplicator()
        .onAvatarUpdate(
          (update: {
            userId: string;
            position: { x: number; y: number; z: number };
            rotation: { x: number; y: number; z: number };
            animation?: string;
          }) => {
            this.updateRemoteAvatar(update.userId, update);
          }
        );
    }
  }

  async loadAvatar(
    userId: string,
    avatarUrl: string,
    position?: { x: number; y: number; z: number }
  ): Promise<Avatar> {
    console.log(`[AvatarManager] Loading avatar for ${userId} from ${avatarUrl}`);
    try {
      const avatarObject = await loadReadyPlayerMeAvatar(avatarUrl);
      console.log(`[AvatarManager] Avatar object loaded, checking for animations...`);

      // Setup animation mixer if GLTF has animations
      let animationMixer: AnimationMixer | undefined;
      const animationActions = new Map<string, AnimationAction>();

      // Try to load with animations
      try {
        console.log(`[AvatarManager] Loading GLTF with animations from ${avatarUrl}...`);
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(avatarUrl);
        console.log(`[AvatarManager] GLTF loaded, animations: ${gltf.animations?.length || 0}`);

        if (gltf.animations && gltf.animations.length > 0) {
          animationMixer = new AnimationMixer(avatarObject);
          console.log(
            `[AvatarManager] Found ${gltf.animations.length} animation clips for avatar ${userId}:`
          );
          gltf.animations.forEach((clip: AnimationClip) => {
            console.log(`  - "${clip.name}" (duration: ${clip.duration.toFixed(2)}s)`);
            // clipAction signature: clipAction(clip, optionalRoot)
            // Use type assertion to handle Three.js version differences
            interface AnimationMixerWithClipAction extends AnimationMixer {
              clipAction: (clip: AnimationClip, root?: Object3D) => AnimationAction;
            }
            const action = (animationMixer as AnimationMixerWithClipAction).clipAction(
              clip,
              avatarObject
            ) as AnimationAction;
            if (action) {
              // setLoop signature: setLoop(mode: AnimationActionLoopStyles, repetitions?: number)
              interface AnimationActionWithSetLoop extends AnimationAction {
                setLoop: (mode: number, repetitions?: number) => AnimationAction;
              }
              (action as AnimationActionWithSetLoop).setLoop(LoopRepeat, Infinity);
              animationActions.set(clip.name, action);
            }
          });
          console.log(`[AvatarManager] Registered ${animationActions.size} animation actions`);
        } else {
          console.warn(`[AvatarManager] No animations found in avatar ${userId}`);
        }
      } catch (error) {
        // No animations available - continue without animations
        console.warn(`[AvatarManager] Failed to load animations for avatar ${userId}:`, error);
      }

      const avatar: Avatar = {
        id: `avatar-${userId}`,
        userId,
        object: avatarObject,
        position: position || { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        animationMixer,
        animationActions,
      };

      this.scene.add(avatar.object);
      this.avatars.set(userId, avatar);

      // Start idle animation by default if available
      if (animationMixer && animationActions && animationActions.size > 0) {
        console.log(`[AvatarManager] Starting default idle animation for avatar ${userId}`);
        this.playAnimation(avatar, 'idle');
      } else {
        console.warn(
          `[AvatarManager] No animations available for avatar ${userId} - avatar will remain in T-Pose`
        );
      }

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
    const m = lightness / 100 - c / 2;

    let r = 0,
      g = 0,
      b = 0;
    if (hue < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (hue < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (hue < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (hue < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (hue < 300) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    return (
      (Math.round((r + m) * 255) << 16) |
      (Math.round((g + m) * 255) << 8) |
      Math.round((b + m) * 255)
    );
  }

  private createNameTag(name: string): Sprite {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context from canvas');
    }
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

  updateAvatar(
    userId: string,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number },
    animation?: string
  ): void {
    const avatar = this.avatars.get(userId);
    if (!avatar) return;

    avatar.position = { ...position };
    avatar.rotation = { ...rotation };

    // Update animation if changed
    if (animation && animation !== avatar.animation) {
      this.playAnimation(avatar, animation);
      avatar.animation = animation;
    }

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

  private playAnimation(avatar: Avatar, animationName: string): void {
    if (!avatar.animationMixer || !avatar.animationActions) {
      console.warn(
        `[AvatarManager] Cannot play animation "${animationName}": No animationMixer or animationActions`
      );
      return;
    }

    // Stop current animation
    if (avatar.currentAnimationAction) {
      avatar.currentAnimationAction.fadeOut(0.2);
    }

    // Map animation names to clip names (extended with alternatives)
    const animationMap: Record<string, string[]> = {
      idle: ['Idle', 'idle', 'IDLE', 'TPose', 'T-Pose', 'Tpose'],
      walk: ['Walking', 'walk', 'Walk', 'walking', 'WALKING', 'WalkForward', 'walk_forward'],
      wave: ['Wave', 'wave', 'WAVE', 'Waving'],
      dance: ['Dance', 'dance', 'DANCE', 'Dancing'],
      sit: ['Sitting', 'sit', 'Sit', 'SITTING', 'SitDown'],
      jump: ['Jump', 'jump', 'JUMP', 'Jumping'],
      clap: ['Clap', 'clap', 'CLAP', 'Clapping'],
      thumbsup: ['ThumbsUp', 'thumbsup', 'Thumbs_Up', 'thumbs_up'],
    };

    // Try to find animation by exact match or alternatives
    let action: AnimationAction | undefined;
    const alternatives = animationMap[animationName] || [animationName];

    for (const altName of alternatives) {
      action = avatar.animationActions.get(altName);
      if (action) {
        console.log(`[AvatarManager] Playing animation "${animationName}" → "${altName}"`);
        break;
      }
    }

    // If not found by exact match, try case-insensitive partial match
    if (!action) {
      const lowerName = animationName.toLowerCase();
      for (const [name, candidateAction] of avatar.animationActions.entries()) {
        if (name.toLowerCase().includes(lowerName) || lowerName.includes(name.toLowerCase())) {
          action = candidateAction;
          console.log(
            `[AvatarManager] Playing animation "${animationName}" → "${name}" (partial match)`
          );
          break;
        }
      }
    }

    if (action) {
      action.reset().fadeIn(0.2).play();
      avatar.currentAnimationAction = action;
    } else {
      // Log available animations for debugging
      const availableAnimations = Array.from(avatar.animationActions.keys());
      console.warn(
        `[AvatarManager] Animation "${animationName}" not found. Available animations: ${availableAnimations.join(', ')}`
      );

      // Fallback: Try to play first available animation if it's idle-like
      if (availableAnimations.length > 0) {
        const firstAnimation = availableAnimations[0];
        const firstAction = avatar.animationActions.get(firstAnimation);
        if (firstAction) {
          console.log(
            `[AvatarManager] Falling back to first available animation: "${firstAnimation}"`
          );
          firstAction.reset().fadeIn(0.2).play();
          avatar.currentAnimationAction = firstAction;
        }
      }
    }
  }

  updateAnimations(delta: number): void {
    this.avatars.forEach((avatar) => {
      if (avatar.animationMixer) {
        avatar.animationMixer.update(delta);
        // Debug: Log if animation is not running (only once per avatar to avoid spam)
        if (
          avatar.currentAnimationAction &&
          !avatar.currentAnimationAction.isRunning() &&
          !(avatar as Avatar & { animationWarningLogged?: boolean }).animationWarningLogged
        ) {
          console.warn(
            `[AvatarManager] Animation for avatar ${avatar.userId} is not running. Current action: ${avatar.currentAnimationAction.getClip().name}`
          );
          // Mark as logged to avoid spam
          (avatar as Avatar & { animationWarningLogged?: boolean }).animationWarningLogged = true;
        }
      }
    });
  }

  private updateRemoteAvatar(
    userId: string,
    update: {
      position: { x: number; y: number; z: number };
      rotation: { x: number; y: number; z: number };
      animation?: string;
    }
  ): void {
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

  updateInterpolation(_delta: number): void {
    const interpolationSpeed = 0.2; // Lerp-Faktor (0.1-0.3 für smooth movement)

    this.avatars.forEach((avatar) => {
      if (!avatar.targetPosition || !avatar.targetRotation) return;

      // Interpoliere Position
      const currentPos = avatar.object.position;
      const targetPos = avatar.targetPosition;

      currentPos.lerp(
        new Vector3(targetPos.x, targetPos.y, targetPos.z),
        Math.min(1, interpolationSpeed)
      );

      // Interpoliere Rotation
      const currentRot = avatar.object.rotation;
      const targetRot = avatar.targetRotation;

      currentRot.x = this.lerpAngle(currentRot.x, targetRot.x, Math.min(1, interpolationSpeed));
      currentRot.y = this.lerpAngle(currentRot.y, targetRot.y, Math.min(1, interpolationSpeed));
      currentRot.z = this.lerpAngle(currentRot.z, targetRot.z, Math.min(1, interpolationSpeed));

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
      // Three.js Resource Cleanup
      avatar.object.traverse((child) => {
        if (child instanceof Mesh) {
          if (child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
              // Dispose texture if present
              if ('map' in child.material && child.material.map) {
                child.material.map.dispose();
              }
            }
          }
        }
      });

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

  setLocalVisibleHead(visible: boolean, userId?: string): void {
    // If userId is provided, use it; otherwise try 'me' as fallback
    const localAvatar = userId ? this.avatars.get(userId) : this.avatars.get('me');
    if (!localAvatar) {
      console.warn(
        `[AvatarManager] setLocalVisibleHead: Avatar not found (userId: ${userId || 'me'})`
      );
      return;
    }

    localAvatar.object.traverse((obj) => {
      if ((obj as Mesh).isMesh) {
        const mesh = obj as Mesh;
        const name = mesh.name.toLowerCase();
        // Hide head meshes in first-person mode
        if (/head|skull|face|hair|hat|cap/i.test(name)) {
          mesh.visible = visible;
        }
      }
    });
  }

  setName(userId: string, name: string): void {
    const avatar = this.avatars.get(userId);
    if (!avatar) return;

    // Find nameTag in avatar object
    interface TextObject {
      text?: string;
      sync?: () => void;
    }
    let nameTag: (Object3D & TextObject) | Sprite | null = null;
    avatar.object.traverse((obj) => {
      // Check if it's a troika-three-text Text object
      const textObj = obj as Object3D & TextObject;
      if (textObj.text !== undefined && textObj.sync) {
        nameTag = textObj;
      }
      // Check if it's a Sprite (existing implementation)
      if ((obj as Sprite).isSprite) {
        nameTag = obj as Sprite;
      }
    });

    if (nameTag) {
      // Update troika-three-text
      const textObj = nameTag as Object3D & TextObject;
      if (typeof textObj.text !== 'undefined' && textObj.sync) {
        textObj.text = name || 'Gast';
        textObj.sync();
      } else {
        // Update Sprite (existing implementation)
        const spriteTag = nameTag as Sprite;
        if (spriteTag.isSprite) {
          // Recreate sprite with new name
          const oldPos = spriteTag.position.clone();
          const oldParent = spriteTag.parent;
          if (oldParent) {
            oldParent.remove(spriteTag);
            const newTag = this.createNameTag(name);
            newTag.position.copy(oldPos);
            oldParent.add(newTag);
          }
        }
      }
    } else {
      // Create new nameTag if none exists
      try {
        const newTag = createNameTag(name);
        avatar.object.add(newTag);
      } catch {
        // Fallback: use existing createNameTag method
        const newTag = this.createNameTag(name);
        avatar.object.add(newTag);
      }
    }
  }
}
