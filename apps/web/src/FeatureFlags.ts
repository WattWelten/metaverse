export interface FeatureFlags {
  AI_ENABLED: boolean;
  VOICE_ENABLED: boolean;
  XR_ENABLED: boolean;
  CMS_PROVIDER: 'local' | 'strapi';
  TEMPLATE_ID: string;
  MULTIPLAYER_ENABLED: boolean;
  AMBIENT_AUDIO_ENABLED: boolean;
  WHITEBOARD_ENABLED: boolean;
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
  WHITEBOARD_ENABLED: import.meta.env.VITE_WHITEBOARD_ENABLED === 'true',
  READY_PLAYER_ME_API_KEY: import.meta.env.VITE_READY_PLAYER_ME_API_KEY,
};

// Check if flags are already set in window (for E2E tests)
// This allows E2E tests to set flags via page.addInitScript before the module loads
const getWindowFlags = (): Partial<FeatureFlags> | null => {
  if (typeof window !== 'undefined' && (window as any).__featureFlags) {
    const windowFlags = (window as any).__featureFlags;
    // Only use window flags if they are a valid FeatureFlags object
    if (typeof windowFlags === 'object' && windowFlags !== null) {
      return windowFlags;
    }
  }
  return null;
};

// Merge window flags (from E2E tests) with default flags
const windowFlags = getWindowFlags();
let flags: FeatureFlags = windowFlags ? { ...defaultFlags, ...windowFlags } : { ...defaultFlags };

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
