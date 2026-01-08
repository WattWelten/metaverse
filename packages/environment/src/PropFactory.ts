import * as THREE from 'three';

export type PropBench = {
  id: string;
  type: 'bench';
  pos: [number, number, number];
  rotY: number;
  seats?: number;
};

export type PropFire = {
  id: string;
  type: 'firepit';
  pos: [number, number, number];
  rotY: number;
  radius?: number;
};

export type PropSign = {
  id: string;
  type: 'sign';
  pos: [number, number, number];
  rotY: number;
  text?: string;
};

export type AnyProp = PropBench | PropFire | PropSign;

export type BuiltProp = {
  id: string;
  object: THREE.Object3D;
  seatAnchors?: THREE.Object3D[];
};

export class PropFactory {
  static build(scene: THREE.Scene, def: AnyProp): BuiltProp {
    switch (def.type) {
      case 'bench':
        return this.bench(scene, def);
      case 'firepit':
        return this.firepit(scene, def);
      case 'sign':
        return this.sign(scene, def);
      default:
        throw new Error(`Unknown prop type: ${(def as any).type}`);
    }
  }

  private static bench(scene: THREE.Scene, def: PropBench): BuiltProp {
    const g = new THREE.Group();
    g.name = def.id;
    g.position.set(...def.pos);
    g.rotation.y = THREE.MathUtils.degToRad(def.rotY || 0);

    // Sitzfläche
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.08, 0.42),
      new THREE.MeshStandardMaterial({ color: 0x6f6a5a, roughness: 0.8 })
    );
    seat.position.set(0, 0.45, 0);
    g.add(seat);

    // Lehne
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.45, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x6f6a5a, roughness: 0.85 })
    );
    back.position.set(0, 0.78, -0.16);
    g.add(back);

    // Beine
    const legMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.6 });
    const legGeo = new THREE.BoxGeometry(0.08, 0.45, 0.3);
    const leg1 = new THREE.Mesh(legGeo, legMat);
    leg1.position.set(-0.7, 0.23, 0);
    const leg2 = new THREE.Mesh(legGeo, legMat);
    leg2.position.set(0.7, 0.23, 0);
    g.add(leg1, leg2);

    // Sitzplätze als Anker
    const n = Math.max(1, def.seats ?? 3);
    const anchors: THREE.Object3D[] = [];
    for (let i = 0; i < n; i++) {
      const a = new THREE.Object3D();
      const x = -0.6 + i * (1.2 / (n - 1 || 1));
      a.position.set(x, 0.55, 0.05); // leicht vor der Lehne
      a.rotation.y = 0;
      (a.userData as any) = { type: 'seat', propId: def.id };
      g.add(a);
      anchors.push(a);
    }

    scene.add(g);
    return { id: def.id, object: g, seatAnchors: anchors };
  }

  private static firepit(scene: THREE.Scene, def: PropFire): BuiltProp {
    const g = new THREE.Group();
    g.name = def.id;
    g.position.set(...def.pos);
    g.rotation.y = THREE.MathUtils.degToRad(def.rotY || 0);
    const r = def.radius ?? 2.0;

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.1, 10, 32),
      new THREE.MeshStandardMaterial({ color: 0x5a5248, roughness: 0.9 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    g.add(ring);

    const embers = new THREE.Mesh(
      new THREE.CircleGeometry(r - 0.3, 24),
      new THREE.MeshStandardMaterial({ color: 0x2b1e14, roughness: 1 })
    );
    embers.rotation.x = -Math.PI / 2;
    embers.position.y = 0.01;
    g.add(embers);

    scene.add(g);
    return { id: def.id, object: g };
  }

  private static sign(scene: THREE.Scene, def: PropSign): BuiltProp {
    const g = new THREE.Group();
    g.name = def.id;
    g.position.set(...def.pos);
    g.rotation.y = THREE.MathUtils.degToRad(def.rotY || 0);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 1.4, 12),
      new THREE.MeshStandardMaterial({ color: 0x6f5a4a })
    );
    pole.position.y = 0.7;
    g.add(pole);

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.6, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x2a2a2a })
    );
    board.position.set(0, 1.2, 0);
    g.add(board);

    // Optional: Text-Plane als späteres TODO
    scene.add(g);
    return { id: def.id, object: g };
  }
}
