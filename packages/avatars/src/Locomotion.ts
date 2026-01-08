import * as THREE from 'three';
import type { VRM } from '@pixiv/three-vrm';
import { defaultLocoConfig, type ClipName, type LocoConfig } from './retarget/library';
import { retargetMixamoToVRM } from './retarget/mixamo';

type ActionMap = Partial<Record<ClipName, THREE.AnimationAction>>;

export class LocomotionController {
  private vrm?: VRM;
  private mixer?: THREE.AnimationMixer;
  private actions: ActionMap = {};
  private current: ClipName | 'none' = 'none';
  private speed = 0; // m/s
  private yawDelta = 0; // rad/s
  private hasAny = false;
  private fallbackProc?: (dt: number) => void;
  private debug = import.meta.env.VITE_LOCO_DEBUG === 'true';
  private turnFinishedListener?: () => void;

  constructor(vrm?: VRM, obj3D?: THREE.Object3D) {
    if (vrm) {
      this.vrm = vrm;
      this.mixer = new THREE.AnimationMixer(vrm.scene);
    } else if (obj3D) {
      this.mixer = new THREE.AnimationMixer(obj3D);
    }
  }

  async loadSet(vrm: VRM, cfg?: LocoConfig) {
    this.vrm = vrm;
    if (!this.mixer) {
      this.mixer = new THREE.AnimationMixer(vrm.scene);
    }
    const c = cfg || defaultLocoConfig();
    const names: ClipName[] = ['idle', 'walk', 'run', 'turn_l', 'turn_r'];
    const loadPromises: Promise<void>[] = [];

    for (const n of names) {
      const file = c.files[n];
      if (!file) continue;
      const url = (c.baseUrl || '/animations/') + file;

      const loadPromise = (async () => {
        try {
          const clip = await retargetMixamoToVRM(vrm, url, n);
          if (!this.mixer) return;

          const action = this.mixer.clipAction(clip);
          action.clampWhenFinished = true;
          action.loop = n === 'turn_l' || n === 'turn_r' ? THREE.LoopOnce : THREE.LoopRepeat;
          this.actions[n] = action;
          this.hasAny = true;

          if (this.debug) {
            console.log(`[Loco] Loaded clip: ${n} from ${url}`);
          }
        } catch (e) {
          if (this.debug) {
            console.warn(`[Loco] Missing or failed to load ${n}:`, e);
          }
        }
      })();

      loadPromises.push(loadPromise);
    }

    // Wait for all clips to load (or fail)
    await Promise.allSettled(loadPromises);

    if (!this.hasAny) {
      console.warn('[Loco] No clips found – procedural idle fallback active');
      // Fallback wird im AvatarManager gesetzt (prozedurales Atmen)
    } else {
      this.fadeTo('idle', 0);
    }
  }

  setVelocity(speedMS: number, yawDeltaRS: number) {
    this.speed = speedMS;
    this.yawDelta = yawDeltaRS;
  }

  update(dt: number) {
    if (!this.mixer) return;
    this.mixer.update(dt);

    if (!this.hasAny) return; // Fallback an anderer Stelle

    // Don't interrupt turn animations
    if (this.current === 'turn_l' || this.current === 'turn_r') {
      return;
    }

    // State choose
    const s = this.speed;
    const yaw = Math.abs(this.yawDelta);

    // Turn in place (only if not moving forward)
    if (yaw > 1.8 && s < 0.2) {
      this.triggerTurn(this.yawDelta > 0 ? 'turn_r' : 'turn_l');
      return;
    }

    // Movement states
    if (s > 3.0) {
      this.fadeTo('run', 0.12);
    } else if (s > 0.2) {
      this.fadeTo('walk', 0.12);
    } else {
      this.fadeTo('idle', 0.15);
    }
  }

  private triggerTurn(name: 'turn_l' | 'turn_r') {
    if (!this.actions[name] || !this.mixer) return;
    if (this.current === name) return;

    const action = this.actions[name]!;

    // Cleanup previous listener before starting new turn
    if (this.turnFinishedListener) {
      this.mixer.removeEventListener('finished', this.turnFinishedListener);
      this.turnFinishedListener = undefined;
    }

    // Stop current animation
    Object.values(this.actions).forEach((a) => {
      if (a && a !== action) {
        a.fadeOut(0.05);
      }
    });

    // Start turn animation
    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.fadeIn(0.05).play();
    this.current = name;

    // Nach Ende zurück zu Idle
    const onFinished = () => {
      // Only transition to idle if we're still in the same turn state
      if (this.current === name && this.mixer) {
        this.fadeTo('idle', 0.1);
      }
      // Cleanup listener
      if (this.mixer && this.turnFinishedListener === onFinished) {
        this.mixer.removeEventListener('finished', onFinished);
        this.turnFinishedListener = undefined;
      }
    };

    this.turnFinishedListener = onFinished;
    this.mixer.addEventListener('finished', onFinished);
  }

  private fadeTo(name: ClipName, duration = 0.1) {
    if (!this.actions[name]) return;
    if (this.current === name) return;

    const next = this.actions[name]!;

    // Cleanup turn listener when transitioning away from turn animations
    if ((this.current === 'turn_l' || this.current === 'turn_r') && this.mixer) {
      if (this.turnFinishedListener) {
        this.mixer.removeEventListener('finished', this.turnFinishedListener);
        this.turnFinishedListener = undefined;
      }
    }

    // Fade out all other actions, fade in target action
    Object.entries(this.actions).forEach(([k, a]) => {
      if (!a) return;
      if (k === name) {
        a.reset().fadeIn(duration).play();
      } else {
        a.fadeOut(duration);
      }
    });
    this.current = name;
  }

  getCurrentState(): ClipName | 'none' {
    return this.current;
  }

  hasClips(): boolean {
    return this.hasAny;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.mixer && this.turnFinishedListener) {
      this.mixer.removeEventListener('finished', this.turnFinishedListener);
      this.turnFinishedListener = undefined;
    }

    // Stop all actions
    Object.values(this.actions).forEach((action) => {
      if (action) {
        action.stop();
        action.reset();
      }
    });

    this.actions = {};
    this.hasAny = false;
    this.current = 'none';
  }
}
