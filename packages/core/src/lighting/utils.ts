import type { WebGLRenderer } from 'three';

export function setPhysicallyCorrectLights(renderer: WebGLRenderer): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (renderer as any).useLegacyLights = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (renderer as any).physicallyCorrectLights = true;
}
