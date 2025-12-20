import type { AmbientConfig } from '../AmbientManager.js';

export interface AmbientPreset {
  name: string;
  sources: AmbientConfig[];
}

export const naturePreset: AmbientPreset = {
  name: 'nature',
  sources: [
    {
      id: 'birds',
      file: '/templates/watt-default/ambient/birds.mp3',
      volume: 0.3,
      loop: true,
    },
    {
      id: 'water',
      file: '/templates/watt-default/ambient/water.mp3',
      volume: 0.2,
      loop: true,
      position: { x: 0, y: 0, z: -10 },
    },
  ],
};

export const urbanPreset: AmbientPreset = {
  name: 'urban',
  sources: [
    {
      id: 'traffic',
      file: '/templates/watt-default/ambient/traffic.mp3',
      volume: 0.4,
      loop: true,
    },
    {
      id: 'city',
      file: '/templates/watt-default/ambient/city.mp3',
      volume: 0.3,
      loop: true,
    },
  ],
};

export const indoorPreset: AmbientPreset = {
  name: 'indoor',
  sources: [
    {
      id: 'ambient',
      file: '/templates/watt-default/ambient/indoor.mp3',
      volume: 0.2,
      loop: true,
    },
  ],
};

export const ambientPresets: Record<string, AmbientPreset> = {
  nature: naturePreset,
  urban: urbanPreset,
  indoor: indoorPreset,
};



