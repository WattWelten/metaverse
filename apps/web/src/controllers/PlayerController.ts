import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

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
  public controls: PointerLockControls;
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

  constructor(
    private camera: THREE.PerspectiveCamera,
    dom: HTMLElement,
    spawn?: SpawnConfig
  ) {
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
  }

  unlock(): void {
    this.controls.unlock();
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

    this.controls.moveForward(this.velocity.z * dt);
    this.controls.moveRight(this.velocity.x * dt);

    if (this.keys.space && this.onGround) {
      this.velocity.y = 4.5;
      this.onGround = false;
    }
  }
}
