import * as THREE from 'three';

export class ScreenSurface {
  mesh: THREE.Mesh;
  private video = document.createElement('video');
  private tex: THREE.VideoTexture | null = null;

  constructor(pos: [number, number, number], size: [number, number], id?: string) {
    const geo = new THREE.PlaneGeometry(size[0], size[1]);
    const mat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(...pos);
    if (id) {
      this.mesh.name = id;
    }
  }

  attach(stream: MediaStream): void {
    this.video.playsInline = true;
    this.video.muted = true;
    this.video.autoplay = true;
    this.video.srcObject = stream;
    this.video.play().catch(() => {
      // User gesture kommt über EnterOverlay
    });

    this.tex?.dispose();
    this.tex = new THREE.VideoTexture(this.video);
    (this.mesh.material as THREE.MeshBasicMaterial).map = this.tex;
    (this.mesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
  }

  detach(): void {
    (this.mesh.material as THREE.MeshBasicMaterial).map = null;
    (this.mesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
    this.tex?.dispose();
    this.tex = null;
    const ms = this.video.srcObject as MediaStream | null;
    if (ms) {
      ms.getTracks().forEach((t) => t.stop());
    }
    this.video.srcObject = null;
  }
}
