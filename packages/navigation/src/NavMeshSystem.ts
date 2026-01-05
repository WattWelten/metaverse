import * as THREE from 'three';
import { Pathfinding } from 'three-pathfinding';

export type Hole = { center: THREE.Vector2; radius: number };
export type BuildOptions = {
  radius: number;
  holes?: Hole[];
  y?: number;
  segments?: number;
};

export class NavMeshSystem {
  private pf = new Pathfinding();
  private zoneId = 'level1';
  private group = 0;
  private currentNode: any = null;
  private mesh: THREE.Mesh | null = null;

  get overlay(): THREE.Mesh | null {
    return this.mesh;
  }

  /** Lädt Navmesh aus GLB (wenn vorhanden) und registriert Zone. */
  async loadFromGLB(url: string, scene: THREE.Scene): Promise<void> {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(url);
    const nav =
      (gltf.scene.getObjectByName('NavMesh') as THREE.Mesh) ||
      (gltf.scene.children.find((o: THREE.Object3D) => (o as any).isMesh) as THREE.Mesh);
    if (!nav) throw new Error('No mesh in navmesh.glb');
    const geo = (nav.geometry as THREE.BufferGeometry).clone();
    geo.rotateX(0); // anpassbar
    this._registerZoneFromGeometry(geo, scene);
  }

  /** Baut prozedural: Kreis mit Löchern (z. B. See + Bäume). */
  buildProcedural(scene: THREE.Scene, opts: BuildOptions): void {
    const y = opts.y ?? 0;
    const shape = new THREE.Shape();
    shape.absarc(0, 0, opts.radius, 0, Math.PI * 2, false);
    (opts.holes || []).forEach((h) => {
      const holePath = new THREE.Path();
      holePath.absarc(h.center.x, h.center.y, h.radius, 0, Math.PI * 2, true);
      shape.holes.push(holePath);
    });
    const geom = new THREE.ShapeGeometry(shape, opts.segments ?? 32);
    geom.rotateX(-Math.PI / 2);
    geom.translate(0, y, 0);
    this._registerZoneFromGeometry(geom, scene);
  }

  /** clampStep für jeden Bewegungs-Frame */
  clampStep(from: THREE.Vector3, to: THREE.Vector3): THREE.Vector3 {
    if (!this.mesh || !this.currentNode) return to;
    const endTarget = new THREE.Vector3();
    const updatedNode = this.pf.clampStep(
      from,
      to,
      this.currentNode,
      this.zoneId,
      this.group,
      endTarget
    );
    this.currentNode = updatedNode;
    return endTarget;
  }

  initAt(position: THREE.Vector3): void {
    this.group = this.pf.getGroup(this.zoneId, position);
    this.currentNode = this.pf.getClosestNode(position, this.zoneId, this.group);
  }

  toggleVisible(v?: boolean): void {
    if (!this.mesh) return;
    const visible = v === undefined ? !this.mesh.visible : v;
    this.mesh.visible = visible;
  }

  setVisible(visible: boolean): void {
    if (this.mesh) {
      this.mesh.visible = visible;
    }
  }

  private _registerZoneFromGeometry(geom: THREE.BufferGeometry, scene: THREE.Scene): void {
    // Debug-Overlay Mesh
    const mat = new THREE.MeshBasicMaterial({
      color: 0x3bb2a3,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const navMesh = new THREE.Mesh(geom, mat);
    navMesh.name = 'NavMeshOverlay';
    // Visibility wird von außen gesetzt (z.B. via VITE_NAV_DEBUG)
    navMesh.visible = false;
    scene.add(navMesh);
    this.mesh = navMesh;

    // Zone erzeugen
    const zone = Pathfinding.createZone(geom);
    this.pf.setZoneData(this.zoneId, zone);
  }

  dispose(): void {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
    }
  }
}
