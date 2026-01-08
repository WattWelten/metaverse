import * as THREE from 'three';

export class LipDriver {
  private avatar: THREE.Object3D | null = null;

  attach(avatar: THREE.Object3D): void {
    this.avatar = avatar;
  }

  update(amplitude: number): void {
    if (!this.avatar) return;

    // VRM Expression "aa"
    interface VRMUserData {
      vrm?: {
        expressionManager?: {
          expressions?: {
            Aa?: { weight: number };
          };
        };
      };
    }
    this.avatar.traverse((obj) => {
      const userData = obj.userData as VRMUserData;
      const vrm = userData?.vrm;
      if (vrm && vrm.expressionManager) {
        const expr = vrm.expressionManager.expressions;
        if (expr?.Aa) {
          expr.Aa.weight = Math.min(1, amplitude * 2);
        }
      }
    });

    // Fallback: Jaw-Scale (für non-VRM Avatare)
    if (!this.hasVRM()) {
      this.avatar.traverse((obj) => {
        if (obj.name.toLowerCase().includes('jaw') || obj.name.toLowerCase().includes('mouth')) {
          const scale = 1 + amplitude * 0.3;
          obj.scale.y = scale;
        }
      });
    }
  }

  private hasVRM(): boolean {
    if (!this.avatar) return false;
    let found = false;
    interface VRMUserData {
      vrm?: unknown;
    }
    this.avatar.traverse((obj) => {
      const userData = obj.userData as VRMUserData;
      if (userData?.vrm) {
        found = true;
      }
    });
    return found;
  }
}
