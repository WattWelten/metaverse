import * as THREE from 'three';

/**
 * SpotlightMarker creates a visual marker (star/glow) above an avatar
 * to indicate they are spotlighted
 */
export class SpotlightMarker {
  private object: THREE.Object3D;
  private glowMesh: THREE.Mesh;
  private starMesh: THREE.Mesh;

  constructor() {
    this.object = new THREE.Group();
    this.object.name = 'SpotlightMarker';

    // Glow effect (circular glow)
    const glowGeometry = new THREE.RingGeometry(0.3, 0.8, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700, // Gold color
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    this.glowMesh.rotation.x = -Math.PI / 2; // Horizontal
    this.glowMesh.position.y = 0.1;
    this.object.add(this.glowMesh);

    // Star shape (simple 5-pointed star)
    const starShape = new THREE.Shape();
    const outerRadius = 0.4;
    const innerRadius = 0.2;
    const spikes = 5;
    const step = (Math.PI * 2) / spikes;

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * step) / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) {
        starShape.moveTo(x, y);
      } else {
        starShape.lineTo(x, y);
      }
    }
    starShape.closePath();

    const starGeometry = new THREE.ShapeGeometry(starShape);
    const starMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    this.starMesh = new THREE.Mesh(starGeometry, starMaterial);
    this.starMesh.rotation.x = -Math.PI / 2;
    this.starMesh.position.y = 0.15;
    this.object.add(this.starMesh);

    // Animate rotation
    this.animate();
  }

  private animate(): void {
    const animate = () => {
      if (this.object.parent) {
        // Rotate star slowly
        this.starMesh.rotation.z += 0.01;
        // Pulse glow
        const pulse = Math.sin(Date.now() * 0.003) * 0.1 + 1;
        this.glowMesh.scale.set(pulse, pulse, 1);
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  attachTo(avatarObject: THREE.Object3D): void {
    // Position above avatar head
    this.object.position.set(0, 2.5, 0);
    avatarObject.add(this.object);
  }

  detach(): void {
    if (this.object.parent) {
      this.object.parent.remove(this.object);
    }
  }

  dispose(): void {
    this.detach();
    this.glowMesh.geometry.dispose();
    (this.glowMesh.material as THREE.Material).dispose();
    this.starMesh.geometry.dispose();
    (this.starMesh.material as THREE.Material).dispose();
  }

  getObject(): THREE.Object3D {
    return this.object;
  }
}
