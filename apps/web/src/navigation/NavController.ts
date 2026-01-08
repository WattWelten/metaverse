import { NavMeshSystem } from '@metaverse/navigation';
import * as THREE from 'three';

export class NavController {
  constructor(
    private nav: NavMeshSystem,
    private camera: THREE.PerspectiveCamera
  ) {}

  /** wendet Navmesh-Klemme + "Push-Apart" gegen Avatare an */
  step(oldPos: THREE.Vector3, intended: THREE.Vector3, peers: THREE.Vector3[] = []): THREE.Vector3 {
    // clamp to navmesh
    const clamped = this.nav.clampStep(oldPos, intended);

    // simple character-character collision
    for (const p of peers) {
      const minDist = 0.8; // Kapselradius ~0.4 + 0.4
      const d = clamped.distanceTo(p);
      if (d < minDist && d > 0.0001) {
        const push = minDist - d;
        const dir = clamped.clone().sub(p).normalize();
        clamped.add(dir.multiplyScalar(push)); // schiebt den Spieler vom Peer weg
      }
    }
    // y auf Augenhöhe halten (falls Navmesh bei y=0)
    clamped.y = this.camera.position.y;
    return clamped;
  }
}
