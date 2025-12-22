# Architecture Overview

## Package Structure

```
WattWelten Metaverse
├── apps/
│   ├── web/          # Main Three.js WebXR App
│   └── server/        # Socket.io Multiplayer Server
├── packages/
│   ├── core/          # Core Three.js utilities (loaders, templates, lighting)
│   ├── ui/            # React UI components (OverlayHost)
│   ├── avatars/       # Avatar management (Ready Player Me, VRM)
│   ├── voice/          # Voice chat (WebRTC)
│   ├── audio/          # Ambient audio management
│   ├── net/            # Network client (Socket.io)
│   ├── ai/             # AI Agent Bridge (wattos_plattform)
│   ├── content/        # Content providers (Local, Strapi)
│   └── assets/         # Template assets
```

## Dependency Graph

```mermaid
graph TB
  A[apps/web] --> B[@core]
  A --> C[@ui]
  A --> D[@avatars]
  A --> E[@voice]
  A --> F[@net]
  A --> G[@ai]
  A --> H[@content]
  A --> I[@audio]
  B --> J[assets/templates]
  C --> J
  E --> F
  D --> B
```

## Feature Flags

All features are behind environment variables:

- `VITE_AI_ENABLED` - Enable AI Agent Bridge
- `VITE_VOICE_ENABLED` - Enable voice chat
- `VITE_XR_ENABLED` - Enable WebXR
- `VITE_CMS_PROVIDER` - Content provider (local | strapi)
- `VITE_TEMPLATE_ID` - Default template
- `VITE_MULTIPLAYER_ENABLED` - Enable multiplayer
- `VITE_AMBIENT_AUDIO_ENABLED` - Enable ambient audio

## Template System

Templates are loaded dynamically from `/packages/assets/templates/{id}/`:

1. Load `manifest.json`
2. Load assets (scene.glb, hdri.hdr)
3. Apply lighting and UI theme
4. Mount to scene

## Rendering Pipeline

1. **Scene Setup** - Three.js Scene, Camera, Renderer
2. **Template Loading** - Load template manifest and assets
3. **Lighting** - HDRI or default lighting
4. **Post Processing** - Optional effects
5. **XR Setup** - WebXR if enabled
6. **Multiplayer** - Network sync if enabled

## Multiplayer Architecture

- **Server**: Socket.io server (`apps/server`)
- **Client**: NetClient (`packages/net`)
- **Sync**: StateSyncService, PresenceService
- **Voice**: WebRTC via signaling server

## Content Providers

- **LocalProvider**: In-memory database (MVP)
- **StrapiProvider**: REST API to Strapi CMS

## Performance Targets

- Desktop: 60fps
- Mobile: 40fps
- Optimizations: KTX2 textures, Draco compression, PMREM cache
