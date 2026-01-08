import type { Vector3 } from 'three';

export interface LightingPreset {
  hdri?: string;
  ambient: {
    color: string;
    intensity: number;
  };
  directional: {
    color: string;
    intensity: number;
    position: Vector3 | { x: number; y: number; z: number };
  };
  fill?: {
    color: string;
    intensity: number;
    position: Vector3 | { x: number; y: number; z: number };
  };
  rim?: {
    color: string;
    intensity: number;
    position: Vector3 | { x: number; y: number; z: number };
  };
}

export const defaultLightingPreset: LightingPreset = {
  ambient: {
    color: '#ffffff',
    intensity: 0.4,
  },
  directional: {
    color: '#ffffff',
    intensity: 0.8,
    position: { x: 5, y: 10, z: 5 },
  },
  fill: {
    color: '#4a90e2',
    intensity: 0.3,
    position: { x: -5, y: 5, z: -5 },
  },
};

export const outdoorLightingPreset: LightingPreset = {
  hdri: '/templates/watt-default/hdri.hdr',
  ambient: {
    color: '#87ceeb',
    intensity: 0.6,
  },
  directional: {
    color: '#fff8dc',
    intensity: 1.2,
    position: { x: 10, y: 20, z: 5 },
  },
  fill: {
    color: '#87ceeb',
    intensity: 0.4,
    position: { x: -10, y: 10, z: -5 },
  },
};

export const indoorLightingPreset: LightingPreset = {
  ambient: {
    color: '#ffffff',
    intensity: 0.5,
  },
  directional: {
    color: '#fff8dc',
    intensity: 0.6,
    position: { x: 0, y: 5, z: 0 },
  },
  fill: {
    color: '#e6e6fa',
    intensity: 0.3,
    position: { x: -3, y: 3, z: -3 },
  },
};
