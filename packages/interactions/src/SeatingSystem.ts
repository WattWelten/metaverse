import * as THREE from 'three';

export class SeatingSystem {
  private seats: { anchor: THREE.Object3D; occupiedBy?: string }[] = [];
  private seated = false;

  registerAnchors(anchors: THREE.Object3D[]): void {
    anchors.forEach((a) => this.seats.push({ anchor: a }));
  }

  trySeat(camera: THREE.PerspectiveCamera, avatar?: THREE.Object3D): boolean {
    if (this.seated) {
      return this.stand(camera, avatar);
    }

    const me = camera.position.clone();
    let best: { anchor: THREE.Object3D; dist: number } | null = null;

    for (const s of this.seats) {
      if (s.occupiedBy) continue;
      const worldPos = new THREE.Vector3();
      s.anchor.getWorldPosition(worldPos);
      const d = worldPos.distanceTo(me);
      if (!best || d < best.dist) {
        best = { anchor: s.anchor, dist: d };
      }
    }

    if (!best || best.dist > 1.2) {
      return false; // zu weit
    }

    this.seated = true;

    // Setze Kamera/Avatar auf Sitzposition + Blick nach vorne
    const p = new THREE.Vector3();
    const q = new THREE.Quaternion();
    best.anchor.getWorldPosition(p);
    best.anchor.getWorldQuaternion(q);

    camera.position.set(p.x, p.y + 0.95, p.z);
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
    const look = p.clone().add(forward);
    camera.lookAt(look);

    if (avatar) {
      avatar.position.set(p.x, p.y - 0.5, p.z);
      const euler = new THREE.Euler().setFromQuaternion(q);
      avatar.rotation.y = euler.y;
    }

    return true;
  }

  stand(_camera: THREE.PerspectiveCamera, avatar?: THREE.Object3D): boolean {
    this.seated = false;
    if (avatar) {
      avatar.position.y = Math.max(avatar.position.y, 1.1);
    }
    return true;
  }

  isSeated(): boolean {
    return this.seated;
  }
}
