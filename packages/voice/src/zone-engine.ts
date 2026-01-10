export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

export type Zone = {
  id: string;
  shape: 'circle' | 'polygon';
  center?: Vec2;
  radius?: number;
  points?: Vec2[];
  isStage?: boolean;
  maxParticipants?: number;
};

export function pointInZone(p: Vec2, z: Zone): boolean {
  if (z.shape === 'circle' && z.center && z.radius !== undefined) {
    const dx = p[0] - z.center[0];
    const dy = p[1] - z.center[1];
    return dx * dx + dy * dy <= z.radius * z.radius;
  }
  if (z.shape === 'polygon' && z.points && z.points.length > 0) {
    // Ray casting algorithm
    let inside = false;
    for (let i = 0, j = z.points.length - 1; i < z.points.length; j = i++) {
      const xi = z.points[i]?.[0] ?? 0;
      const yi = z.points[i]?.[1] ?? 0;
      const xj = z.points[j]?.[0] ?? 0;
      const yj = z.points[j]?.[1] ?? 0;
      const intersect =
        yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi || 1e-9) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }
  return false;
}

export function updateZoneMembership(position: Vec3, zones: Zone[]): string | null {
  const pos2d: Vec2 = [position[0], position[2]]; // x, z
  return zoneMembership(pos2d, zones);
}

export function zoneMembership(pos: Vec2, zones: Zone[]): string | null {
  for (const z of zones) {
    if (pointInZone(pos, z)) {
      return z.id;
    }
  }
  return null;
}

export function volumeFor(
  senderPos: Vec2,
  receiverPos: Vec2,
  senderZone: string | null,
  receiverZone: string | null,
  maxDistance = 12,
  rolloff = 1.2
): number {
  // Cross-zone: hard mute
  if (senderZone && receiverZone && senderZone !== receiverZone) {
    return -120; // Hard mute
  }

  // Same zone or no zones: distance-based attenuation
  const dx = senderPos[0] - receiverPos[0];
  const dy = senderPos[1] - receiverPos[1];
  const d = Math.sqrt(dx * dx + dy * dy);

  if (d <= 1) return 0; // Close: no attenuation
  if (d >= maxDistance) return -80; // Far: max attenuation

  const norm = d / maxDistance;
  const att = -(20 * Math.log10(1 + rolloff * norm));
  return Math.max(-80, att);
}

export function isStage(zones: Zone[], zoneId: string | null): boolean {
  if (!zoneId) return false;
  const zone = zones.find((z) => z.id === zoneId);
  return zone?.isStage ?? false;
}
