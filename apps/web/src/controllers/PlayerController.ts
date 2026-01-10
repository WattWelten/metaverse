import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

import { NavController } from '../navigation/NavController';

type Keys = {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  shift: boolean;
  space: boolean;
};

interface SpawnConfig {
  position?: [number, number, number];
  rotationY?: number;
}

export class PlayerController {
  private navController: NavController | null = null;
  private remotePeers: THREE.Vector3[] = [];
  public controls: PointerLockControls;
  private dom: HTMLElement;
  private keys: Keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
    space: false,
  };
  private velocity = new THREE.Vector3();
  private dir = new THREE.Vector3();
  private onGround = true;
  private baseY = 1.6;
  private mouseInvert = false;
  private lastRotationX = 0;
  private lastRotationY = 0;
  private angularVelocityY = 0;

  constructor(
    private camera: THREE.PerspectiveCamera,
    dom: HTMLElement,
    spawn?: SpawnConfig
  ) {
    this.dom = dom;
    this.controls = new PointerLockControls(camera, dom);
    addEventListener('keydown', (e: KeyboardEvent) => this.onKey(e, true));
    addEventListener('keyup', (e: KeyboardEvent) => this.onKey(e, false));

    if (spawn?.position) {
      camera.position.set(...spawn.position);
      this.baseY = spawn.position[1] ?? 1.6;
    } else {
      camera.position.set(0, this.baseY, 6);
    }

    if (typeof spawn?.rotationY === 'number') {
      camera.rotation.y = spawn.rotationY;
    }
  }

  lock(): void {
    this.controls.lock();
    // Focus auf Canvas setzen für Keyboard-Events
    (this.dom as HTMLCanvasElement)?.focus?.();
  }

  unlock(): void {
    this.controls.unlock();
  }

  attachNavController(navCtrl: NavController): void {
    this.navController = navCtrl;
  }

  setRemotePeers(peers: THREE.Vector3[]): void {
    this.remotePeers = peers;
  }

  setMouseInvert(invert: boolean): void {
    this.mouseInvert = invert;
    if (invert) {
      this.lastRotationX = this.camera.rotation.x;
    }
  }

  isMoving(): boolean {
    // Check if player is moving horizontally (x or z velocity)
    return Math.abs(this.velocity.x) > 0.01 || Math.abs(this.velocity.z) > 0.01;
  }

  getVelocity(): THREE.Vector3 {
    return this.velocity.clone();
  }

  private onKey(e: KeyboardEvent, down: boolean): void {
    const m = new Map([
      ['KeyW', 'w'],
      ['KeyA', 'a'],
      ['KeyS', 's'],
      ['KeyD', 'd'],
      ['ShiftLeft', 'shift'],
      ['ShiftRight', 'shift'],
      ['Space', 'space'],
    ]);
    const k = m.get(e.code) as keyof Keys | undefined;
    if (k) {
      this.keys[k] = down;
    }
  }

  update(dt: number): void {
    // Debug: Log key presses (only in dev mode, throttled)
    if (
      import.meta.env.DEV &&
      Math.random() < 0.01 &&
      (this.keys.w || this.keys.a || this.keys.s || this.keys.d)
    ) {
      console.debug('[PlayerController] Keys:', {
        w: this.keys.w,
        a: this.keys.a,
        s: this.keys.s,
        d: this.keys.d,
      });
    }
    const accel = this.keys.shift ? 10 : 6;
    this.dir.set(0, 0, 0);

    if (this.keys.w) this.dir.z -= 1;
    if (this.keys.s) this.dir.z += 1;
    if (this.keys.a) this.dir.x -= 1;
    if (this.keys.d) this.dir.x += 1;

    if (this.dir.lengthSq() > 0) {
      this.dir.normalize();
    }

    this.velocity.x *= 0.9;
    this.velocity.z *= 0.9;
    this.velocity.x += this.dir.x * accel * dt;
    this.velocity.z += this.dir.z * accel * dt;

    if (!this.onGround) {
      this.velocity.y -= 9.81 * dt;
    }

    const nextY = this.camera.position.y + this.velocity.y * dt;

    if (nextY <= this.baseY) {
      this.camera.position.y = this.baseY;
      this.velocity.y = 0;
      this.onGround = true;
    } else {
      this.camera.position.y = nextY;
      this.onGround = false;
    }

    // Calculate intended movement direction
    const forward = new THREE.Vector3();
    this.controls.getDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3()
      .crossVectors(forward, new THREE.Vector3(0, 1, 0))
      .multiplyScalar(-1);

    // Calculate intended position delta
    const delta = new THREE.Vector3()
      .addScaledVector(forward, this.velocity.z * dt)
      .addScaledVector(right, this.velocity.x * dt);
    const from = this.camera.position.clone();
    let to = from.clone().add(delta);

    // Apply navmesh clamping and character collisions if NavController is attached
    if (this.navController) {
      to = this.navController.step(from, to, this.remotePeers);
    } else {
      // Fallback: use original moveForward/moveRight
      this.controls.moveForward(this.velocity.z * dt);
      this.controls.moveRight(this.velocity.x * dt);
    }

    // Set position directly (if NavController is active)
    if (this.navController) {
      this.camera.position.copy(to);
    }

    if (this.keys.space && this.onGround) {
      this.velocity.y = 4.5;
      this.onGround = false;
    }

    // Mouse Invert: Pitch-Rotation (X-Achse) invertieren wenn aktiviert
    if (this.mouseInvert && this.controls.isLocked) {
      const currentRotationX = this.camera.rotation.x;
      const deltaX = currentRotationX - this.lastRotationX;
      // Invertiere die Änderung
      this.camera.rotation.x = this.lastRotationX - deltaX;
      this.lastRotationX = this.camera.rotation.x;
    } else {
      this.lastRotationX = this.camera.rotation.x;
    }

    // Calculate angular velocity Y (yaw)
    // Only calculate if dt is valid to avoid division by zero
    if (dt > 0) {
      const currentRotationY = this.camera.rotation.y;
      const deltaY = currentRotationY - this.lastRotationY;
      // Normalize delta to [-PI, PI] range
      let normalizedDelta = deltaY;
      while (normalizedDelta > Math.PI) normalizedDelta -= 2 * Math.PI;
      while (normalizedDelta < -Math.PI) normalizedDelta += 2 * Math.PI;
      this.angularVelocityY = normalizedDelta / dt; // rad/s
      this.lastRotationY = currentRotationY;
    }
  }

  getAngularVelocityY(): number {
    return this.angularVelocityY;
  }
}
