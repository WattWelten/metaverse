export const REQUIRED_CLIPS = ['idle', 'walk', 'run', 'turn_l', 'turn_r'] as const;
export type ClipName = (typeof REQUIRED_CLIPS)[number];

export type LocoConfig = {
  baseUrl?: string; // default '/animations/'
  files: Partial<Record<ClipName, string>>; // z.B. 'walk': 'walk.glb'
};

export function defaultLocoConfig(): LocoConfig {
  return {
    baseUrl: '/animations/',
    files: {
      idle: 'idle.glb',
      walk: 'walk.glb',
      run: 'run.glb',
      turn_l: 'turn_l.glb',
      turn_r: 'turn_r.glb',
    },
  };
}
