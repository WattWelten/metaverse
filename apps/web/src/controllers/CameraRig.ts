import * as THREE from 'three';

export type ViewMode = 'fp' | 'tp';

export class CameraRig {
  private cam: THREE.PerspectiveCamera;
  private target: THREE.Object3D;
  private boom = new THREE.Object3D();
  private current: ViewMode = 'fp';
  private desiredPos = new THREE.Vector3();
  private velocity = new THREE.Vector3();
  private tpOffset = new THREE.Vector3(0, 1.4, 3.5); // hinter & über
  private headOffset = new THREE.Vector3(0, 1.6, 0); // FP Kopf
  private tmp = new THREE.Vector3();
  private ray = new THREE.Raycaster();

  constructor(camera: THREE.PerspectiveCamera, target: THREE.Object3D) {
    this.cam = camera;
    this.target = target;
    this.boom.position.copy(this.headOffset);
  }

  get mode(): ViewMode {
    return this.current;
  }

  switch(mode?: ViewMode): void {
    this.current = mode ?? (this.current === 'fp' ? 'tp' : 'fp');
  }

  update(dt: number, scene: THREE.Scene): void {
    const stiffness = 12;
    const damping = 14;

    if (this.current === 'fp') {
      // Kopfposition + minimale Dämpfung
      this.desiredPos.copy(this.target.position).add(this.headOffset);
    } else {
      // Third-Person: offset hinter dem Ziel, Blickrichtung des Ziels (Y-Achse)
      const rotY = this.target.rotation.y;
      const behind = this.tpOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
      this.desiredPos.copy(this.target.position).add(this.headOffset).add(behind);

      // Anti-Clipping: Ray vom Ziel zur gewünschten Kameraposition
      const targetHeadPos = this.target.position.clone().add(this.headOffset);
      const direction = this.desiredPos.clone().sub(targetHeadPos).normalize();
      const distance = targetHeadPos.distanceTo(this.desiredPos);

      this.ray.set(targetHeadPos, direction);
      interface MeshObject {
        isMesh?: boolean;
      }
      const hits = this.ray
        .intersectObjects(scene.children, true)
        .filter((h) => h.distance < distance && (h.object as MeshObject).isMesh);

      if (hits[0]) {
        // Move camera back from hit point
        this.desiredPos.copy(hits[0].point).add(direction.multiplyScalar(-0.2));
      }
    }

    // Geglättete Bewegung (kritisch gedämpft)
    this.tmp.copy(this.desiredPos).sub(this.cam.position);
    this.velocity.addScaledVector(this.tmp, stiffness * dt);
    this.velocity.multiplyScalar(Math.exp(-damping * dt));
    this.cam.position.addScaledVector(this.velocity, dt);

    // Blick auf Ziel (sanft)
    const look = this.target.position.clone().add(this.headOffset);
    this.cam.lookAt(look);
  }
}
