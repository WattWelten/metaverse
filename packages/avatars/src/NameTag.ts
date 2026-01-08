import type * as THREE from 'three';
import { Text } from 'troika-three-text';

export function createNameTag(text: string): THREE.Object3D {
  const t = new Text();
  t.text = text || 'Guest';
  t.fontSize = 0.25;
  t.anchorX = 'center';
  t.anchorY = 'bottom';
  t.position.set(0, 2.1, 0);
  t.color = 0xffffff;
  t.outlineWidth = '2%';
  t.outlineColor = 0x000000;
  t.sync();
  return t;
}
