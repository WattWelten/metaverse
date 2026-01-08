/**
 * Zone Visualizer
 * Visualizes zones in 3D space with wireframes and labels
 */

import * as THREE from 'three';

import type { ZoneDef } from './ZoneSystem.js';

export class ZoneVisualizer {
  private scene: THREE.Scene;
  private zoneObjects: Map<string, THREE.Object3D> = new Map();
  private zoneLabels: Map<string, THREE.Object3D> = new Map();
  private enabled: boolean = false;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Enable/disable zone visualization
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.clear();
    }
  }

  /**
   * Visualize zones
   */
  visualizeZones(zones: ZoneDef[]): void {
    if (!this.enabled) return;

    this.clear();

    for (const zone of zones) {
      // Create wireframe geometry
      let geometry: THREE.BufferGeometry;
      if (zone.shape === 'sphere') {
        geometry = new THREE.SphereGeometry(zone.r || 1, 32, 32);
      } else {
        const size = zone.size || [1, 1, 1];
        geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
      }

      // Create wireframe material
      const material = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0x00ff00,
        transparent: true,
        opacity: 0.3,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(zone.pos[0], zone.pos[1], zone.pos[2]);
      mesh.name = `zone-${zone.id}`;
      mesh.userData = { zoneId: zone.id, isZone: true };

      this.scene.add(mesh);
      this.zoneObjects.set(zone.id, mesh);

      // Create label (if label is provided)
      if (zone.label) {
        this.createLabel(zone);
      }
    }
  }

  /**
   * Create 3D label for zone
   */
  private createLabel(zone: ZoneDef): void {
    // For MVP, we'll use a simple sprite or text
    // In production, you might want to use troika-three-text or similar
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = 256;
    canvas.height = 64;

    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#ffffff';
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(zone.label || zone.id, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(2, 0.5, 1);
    sprite.position.set(zone.pos[0], zone.pos[1] + (zone.r || 2) + 1, zone.pos[2]);
    sprite.name = `zone-label-${zone.id}`;

    this.scene.add(sprite);
    this.zoneLabels.set(zone.id, sprite);
  }

  /**
   * Highlight active zone
   */
  highlightZone(zoneId: string | null): void {
    for (const [id, obj] of this.zoneObjects.entries()) {
      const material = (obj as THREE.Mesh).material as THREE.MeshBasicMaterial;
      if (id === zoneId) {
        material.color.setHex(0x00ffff); // Cyan for active
        material.opacity = 0.5;
      } else {
        material.color.setHex(0x00ff00); // Green for inactive
        material.opacity = 0.3;
      }
    }
  }

  /**
   * Clear all zone visualizations
   */
  clear(): void {
    for (const obj of this.zoneObjects.values()) {
      this.scene.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose();
        }
      }
    }
    this.zoneObjects.clear();

    for (const label of this.zoneLabels.values()) {
      this.scene.remove(label);
      if (label instanceof THREE.Sprite) {
        const material = label.material as THREE.SpriteMaterial;
        if (material.map) {
          material.map.dispose();
        }
        material.dispose();
      }
    }
    this.zoneLabels.clear();
  }

  /**
   * Dispose visualizer
   */
  dispose(): void {
    this.clear();
  }
}
