import * as THREE from 'three';
import { Text } from 'troika-three-text';

export type EmoteId = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

const EMOTE_MAP: Record<EmoteId, string> = {
  '1': '👍',
  '2': '❤️',
  '3': '😂',
  '4': '🎉',
  '5': '🔥',
  '6': '👏',
  '7': '💯',
  '8': '✨',
  '9': '🎊',
};

export class EmoteSystem {
  private activeEmotes = new Map<string, THREE.Object3D>();

  trigger(avatar: THREE.Object3D, emoteId: EmoteId): void {
    const emoji = EMOTE_MAP[emoteId];
    if (!emoji) return;

    // Remove existing emote if any
    this.remove(avatar);

    // Create emoji bubble
    const text = new Text();
    text.text = emoji;
    text.fontSize = 0.4;
    text.anchorX = 'center';
    text.anchorY = 'bottom';
    text.position.set(0, 2.5, 0);
    text.color = 0xffffff;
    text.outlineWidth = '3%';
    text.outlineColor = 0x000000;
    text.sync();

    avatar.add(text);
    this.activeEmotes.set(avatar.uuid, text);

    // Optional: VRM Expression "Joy"
    interface VRMUserData {
      vrm?: {
        expressionManager?: {
          expressions?: {
            Joy?: { weight: number };
          };
        };
      };
    }
    avatar.traverse((obj) => {
      const userData = obj.userData as VRMUserData;
      const vrm = userData?.vrm;
      if (vrm && vrm.expressionManager) {
        const expr = vrm.expressionManager.expressions;
        if (expr?.Joy) {
          expr.Joy.weight = 1.0;
          setTimeout(() => {
            if (expr.Joy) expr.Joy.weight = 0;
          }, 1600);
        }
      }
    });

    // Auto-remove after 1.6s
    setTimeout(() => {
      this.remove(avatar);
    }, 1600);
  }

  remove(avatar: THREE.Object3D): void {
    const existing = this.activeEmotes.get(avatar.uuid);
    if (existing) {
      avatar.remove(existing);
      interface Disposable {
        dispose?: () => void;
      }
      const disposable = existing as THREE.Object3D & Disposable;
      if (disposable.dispose) {
        disposable.dispose();
      }
      this.activeEmotes.delete(avatar.uuid);
    }
  }

  dispose(): void {
    interface Disposable {
      dispose?: () => void;
    }
    this.activeEmotes.forEach((emote, uuid) => {
      const avatar = this.findAvatarByUuid(uuid);
      if (avatar) {
        avatar.remove(emote);
        const disposable = emote as THREE.Object3D & Disposable;
        if (disposable.dispose) {
          disposable.dispose();
        }
      }
    });
    this.activeEmotes.clear();
  }

  private findAvatarByUuid(uuid: string): THREE.Object3D | null {
    // This is a simplified lookup - in practice, you'd pass the avatar object directly
    // For now, we'll search through the scene
    for (const emote of this.activeEmotes.values()) {
      if (emote.parent && emote.parent.uuid === uuid) {
        return emote.parent;
      }
    }
    return null;
  }
}
