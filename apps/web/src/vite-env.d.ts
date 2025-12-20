/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_ENABLED?: string;
  readonly VITE_VOICE_ENABLED?: string;
  readonly VITE_XR_ENABLED?: string;
  readonly VITE_CMS_PROVIDER?: string;
  readonly VITE_TEMPLATE_ID?: string;
  readonly VITE_MULTIPLAYER_ENABLED?: string;
  readonly VITE_AMBIENT_AUDIO_ENABLED?: string;
  readonly VITE_READY_PLAYER_ME_API_KEY?: string;
  readonly VITE_WATTOS_BASE_URL?: string;
  readonly VITE_WATTOS_WS_URL?: string;
  readonly VITE_WATTOS_API_KEY?: string;
  readonly VITE_CMS_BASE_URL?: string;
  readonly VITE_CMS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}



