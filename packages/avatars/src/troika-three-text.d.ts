declare module 'troika-three-text' {
  import * as THREE from 'three';
  export class Text extends THREE.Object3D {
    text: string;
    fontSize: number;
    anchorX: 'left' | 'center' | 'right';
    anchorY: 'top' | 'middle' | 'bottom' | 'baseline';
    color: number | string;
    outlineWidth: string;
    outlineColor: number | string;
    sync(): void;
  }
}
