# WattWelten Metaverse

Three.js WebXR Multiplayer Metaverse Platform mit Ready Player Me Integration, Spatial Audio, Ambient-Sound-System und AI-Bridge zu wattos_plattform.

## Quickstart

### Voraussetzungen

- Node.js 20.11.1 (siehe `.nvmrc`)
- pnpm 8.15.0+

### Installation

```bash
# Dependencies installieren
pnpm install

# Development Server starten (Client + Server)
pnpm dev
```

Die Anwendung läuft dann auf:
- Client: http://localhost:5173
- Server: http://localhost:3001

## Umgebungsvariablen

Erstelle eine `.env.local` Datei im Root-Verzeichnis:

```env
# Feature Flags
VITE_AI_ENABLED=false
VITE_VOICE_ENABLED=true
VITE_XR_ENABLED=true
VITE_CMS_PROVIDER=local
VITE_TEMPLATE_ID=watt-default
VITE_MULTIPLAYER_ENABLED=true
VITE_AMBIENT_AUDIO_ENABLED=true

# Ready Player Me (optional)
VITE_READY_PLAYER_ME_API_KEY=

# wattos_plattform
VITE_WATTOS_BASE_URL=https://api.wattos.local
VITE_WATTOS_WS_URL=wss://api.wattos.local/realtime
VITE_WATTOS_API_KEY=dev-xxxx

# Strapi (optional)
VITE_CMS_BASE_URL=https://cms.example.com
VITE_CMS_TOKEN=

# Server
PORT=3001
CLIENT_URL=http://localhost:5173
```

## Projektstruktur

```
metaverse/
├── apps/
│   ├── web/          # Vite + Three.js Client
│   └── server/       # Socket.io Multiplayer Server
├── packages/
│   ├── core/         # Engine, Template-System, Theme
│   ├── ui/           # React UI Components
│   ├── avatars/      # Ready Player Me Integration
│   ├── voice/        # Spatial Audio, WebRTC
│   ├── audio/        # Ambient-Sound-System
│   ├── net/          # Multiplayer Client
│   ├── ai/           # AI-Bridge zu wattos_plattform
│   └── content/      # Content Provider (Local/Strapi)
└── docs/             # Docusaurus Dokumentation
```

## Features

- ✅ Multiplayer (Socket.io, standardmäßig aktiv)
- ✅ Ready Player Me Avatar-Integration
- ✅ Spatial Audio mit räumlichen Effekten
- ✅ Ambient-Audio-System (Hintergrundgeräusche)
- ✅ Template-System (austauschbar)
- ✅ WebXR Support
- ✅ AI-Bridge zu wattos_plattform
- ✅ Content Provider (Local/Strapi)

## Scripts

- `pnpm dev` - Startet alle Development-Server
- `pnpm build` - Baut alle Packages
- `pnpm lint` - Lintet alle Packages
- `pnpm typecheck` - TypeScript Type-Check
- `pnpm test` - Führt Tests aus
- `pnpm e2e` - E2E Tests (Playwright)

## Lizenz

Private - WattWelten

