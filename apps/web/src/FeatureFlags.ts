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
  WATTOS_BASE_URL?: string;
  WATTOS_WS_URL?: string;
  WATTOS_API_KEY?: string;
  WATTOS_TENANT?: string;
  SHARE_ENABLED: boolean;
  LIVEKIT_URL?: string;
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
  WATTOS_BASE_URL: import.meta.env.VITE_WATTOS_BASE_URL,
  WATTOS_WS_URL: import.meta.env.VITE_WATTOS_WS_URL,
  WATTOS_API_KEY: import.meta.env.VITE_WATTOS_API_KEY,
  WATTOS_TENANT: import.meta.env.VITE_WATTOS_TENANT,
  SHARE_ENABLED: import.meta.env.VITE_SHARE_ENABLED === 'true',
  LIVEKIT_URL: import.meta.env.VITE_LIVEKIT_URL,
};

// Check if flags are already set in window (for E2E tests)
// This allows E2E tests to set flags via page.addInitScript before the module loads
interface WindowWithFeatureFlags {
  __featureFlags?: Partial<FeatureFlags>;
}
const getWindowFlags = (): Partial<FeatureFlags> | null => {
  if (typeof window !== 'undefined') {
    const windowWithFlags = window as typeof window & WindowWithFeatureFlags;
    if (windowWithFlags.__featureFlags) {
      const windowFlags = windowWithFlags.__featureFlags;
      // Only use window flags if they are a valid FeatureFlags object
      if (typeof windowFlags === 'object' && windowFlags !== null) {
        return windowFlags;
      }
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
