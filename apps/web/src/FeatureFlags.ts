export interface FeatureFlags {
  AI_ENABLED: boolean;
  VOICE_ENABLED: boolean;
  XR_ENABLED: boolean;
  CMS_PROVIDER: 'local' | 'strapi';
  TEMPLATE_ID: string;
  MULTIPLAYER_ENABLED: boolean;
  AMBIENT_AUDIO_ENABLED: boolean;
  READY_PLAYER_ME_API_KEY?: string;
}

const defaultFlags: FeatureFlags = {
  AI_ENABLED: import.meta.env.VITE_AI_ENABLED === 'true',
  VOICE_ENABLED: import.meta.env.VITE_VOICE_ENABLED === 'true',
  XR_ENABLED: import.meta.env.VITE_XR_ENABLED === 'true',
  CMS_PROVIDER: (import.meta.env.VITE_CMS_PROVIDER as 'local' | 'strapi') || 'local',
  TEMPLATE_ID: import.meta.env.VITE_TEMPLATE_ID || 'watt-default',
  MULTIPLAYER_ENABLED: import.meta.env.VITE_MULTIPLAYER_ENABLED === 'true', // Explizit 'true' erforderlich
  AMBIENT_AUDIO_ENABLED: import.meta.env.VITE_AMBIENT_AUDIO_ENABLED === 'true',
  READY_PLAYER_ME_API_KEY: import.meta.env.VITE_READY_PLAYER_ME_API_KEY,
};

let flags: FeatureFlags = { ...defaultFlags };

export function getFeatureFlags(): FeatureFlags {
  return { ...flags };
}

export function setFeatureFlags(newFlags: Partial<FeatureFlags>): void {
  flags = { ...flags, ...newFlags };
}

export function FeatureFlags(): null {
  // Component for React integration, flags are accessed via getFeatureFlags()
  return null;
}
