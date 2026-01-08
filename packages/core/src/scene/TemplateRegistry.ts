import type { Scene, Object3D } from 'three';

import type { LightingPreset } from '../lighting/Preset.js';
import type { ThemeTokens } from '../theme/ThemeTokens.js';

export interface TemplateManifest {
  id?: string;
  name: string;
  version: string;
  routes?: string[];
  spawn?:
    | {
        x: number;
        y: number;
        z: number;
      }
    | [number, number, number]
    | {
        position: [number, number, number];
        rotationY?: number;
      };
  lighting?: LightingPreset & {
    exposure?: number;
    hdri?: string;
  };
  skybox?: string;
  uiSkin?: string;
  assets?: {
    scene?: string;
    hdri?: string;
    navmesh?: string;
    models?: string[];
    textures?: {
      ground?: string;
      path?: string;
      [key: string]: string | undefined;
    };
  };
  placedAssets?: Array<{
    id: string;
    model: string;
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    variant?: number;
  }>;
  portals?: Array<{
    id: string;
    position: { x: number; y: number; z: number };
    target?: string;
  }>;
  ambient?: {
    sources: Array<{
      id: string;
      file: string;
      volume: number;
      loop: boolean;
      position?: { x: number; y: number; z: number };
    }>;
  };
  interactions?: Array<{
    id: string;
    type: 'portal' | 'panel' | 'poll' | 'custom';
    position: { x: number; y: number; z: number };
    data?: Record<string, unknown>;
  }>;
  props?: Array<
    | {
        id: string;
        type: 'bench';
        pos: [number, number, number];
        rotY: number;
        seats?: number;
      }
    | {
        id: string;
        type: 'firepit';
        pos: [number, number, number];
        rotY: number;
        radius?: number;
      }
    | {
        id: string;
        type: 'sign';
        pos: [number, number, number];
        rotY: number;
        text?: string;
      }
  >;
  zones?: Array<{
    id: string;
    label?: string;
    shape: 'sphere' | 'box';
    pos: [number, number, number];
    r?: number;
    size?: [number, number, number];
    gain: number;
    reverb?: 'none' | 'hall';
  }>;
  screens?: Array<{
    id: string;
    pos: [number, number, number];
    size: [number, number];
  }>;
  ambience?: Array<{
    id: string;
    type: 'loop';
    pos: [number, number, number];
    url: string;
    maxDist?: number;
  }>;
}

export interface TemplateInstance {
  manifest: TemplateManifest;
  scene: Object3D | null;
  mount: (scene: Scene) => Promise<void>;
  unmount: () => void;
  applyTheme: (tokens: ThemeTokens) => void;
}

export type TemplateLoader = (manifest: TemplateManifest) => Promise<TemplateInstance>;

class TemplateRegistry {
  private templates = new Map<string, TemplateLoader>();
  private currentInstance: TemplateInstance | null = null;

  register(id: string, loader: TemplateLoader): void {
    this.templates.set(id, loader);
  }

  async load(id: string, scene: Scene): Promise<TemplateInstance> {
    const loader = this.templates.get(id);
    if (!loader) {
      throw new Error(`Template "${id}" not found. Falling back to watt-default.`);
    }

    // Unmount current template
    if (this.currentInstance) {
      this.currentInstance.unmount();
    }

    // Load default template manifest as fallback
    const defaultManifest: TemplateManifest = {
      name: 'watt-default',
      version: '1.0.0',
      spawn: { x: 0, y: 0, z: 0 },
    };

    try {
      // Try to load manifest, fallback to default
      const manifest = await this.loadManifest(id).catch(() => defaultManifest);
      const instance = await loader(manifest);
      await instance.mount(scene);
      this.currentInstance = instance;
      return instance;
    } catch (error) {
      console.error(`Failed to load template "${id}":`, error);
      // Fallback to default
      if (id !== 'watt-default') {
        return this.load('watt-default', scene);
      }
      throw error;
    }
  }

  private async loadManifest(id: string): Promise<TemplateManifest> {
    const response = await fetch(`/templates/${id}/manifest.json`);
    if (!response.ok) {
      throw new Error(`Failed to load manifest for template "${id}"`);
    }
    return response.json() as Promise<TemplateManifest>;
  }

  getCurrentInstance(): TemplateInstance | null {
    return this.currentInstance;
  }

  unload(): void {
    if (this.currentInstance) {
      this.currentInstance.unmount();
      this.currentInstance = null;
    }
  }
}

export const templateRegistry = new TemplateRegistry();
