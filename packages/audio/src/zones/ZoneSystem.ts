import * as THREE from 'three';

export type ZoneDef = {
  id: string;
  label?: string;
  shape: 'sphere' | 'box';
  pos: [number, number, number];
  r?: number;
  size?: [number, number, number];
  gain: number;
  reverb?: 'none' | 'hall';
};

export class ZoneSystem {
  private zones: ZoneDef[] = [];
  private activeId: string | null = null;

  constructor(zones: ZoneDef[]) {
    this.zones = zones;
  }

  which(pos: THREE.Vector3): string {
    for (const z of this.zones) {
      if (z.shape === 'sphere') {
        const zonePos = new THREE.Vector3(...z.pos);
        const d = zonePos.distanceTo(pos);
        if (d <= (z.r || 0)) {
          return z.id;
        }
      } else {
        // box shape
        const p = new THREE.Vector3(...z.pos);
        const s = z.size || [1, 1, 1];
        if (
          Math.abs(pos.x - p.x) <= s[0] / 2 &&
          Math.abs(pos.y - p.y) <= s[1] / 2 &&
          Math.abs(pos.z - p.z) <= s[2] / 2
        ) {
          return z.id;
        }
      }
    }
    return 'world';
  }

  gainFor(id: string): number {
    const z = this.zones.find((x) => x.id === id);
    return z?.gain ?? 1.0;
  }

  setActive(id: string): void {
    this.activeId = id;
  }

  getActive(): string | null {
    return this.activeId;
  }

  /**
   * Get reverb type for zone
   */
  reverbFor(id: string): 'none' | 'hall' | null {
    const z = this.zones.find((x) => x.id === id);
    return z?.reverb || null;
  }

  /**
   * Get zone definition by ID
   */
  getZone(id: string): ZoneDef | null {
    return this.zones.find((z) => z.id === id) || null;
  }

  /**
   * Get all zones
   */
  getAllZones(): ZoneDef[] {
    return [...this.zones];
  }

  /**
   * Check if position is in any zone
   */
  isInZone(pos: THREE.Vector3): boolean {
    return this.which(pos) !== 'world';
  }

  /**
   * Get zone label
   */
  getLabel(id: string): string | null {
    const z = this.zones.find((x) => x.id === id);
    return z?.label || null;
  }

  /**
   * Add zone dynamically
   */
  addZone(zone: ZoneDef): void {
    this.zones.push(zone);
  }

  /**
   * Remove zone
   */
  removeZone(id: string): void {
    this.zones = this.zones.filter((z) => z.id !== id);
    if (this.activeId === id) {
      this.activeId = null;
    }
  }
}
