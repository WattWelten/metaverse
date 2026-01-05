> 🧭 **Cursor Global Playbook aktiv** · Diesen Leitfaden nutzen wir als Source of Truth.
> Datei: `docs/CURSOR_GLOBAL_PLAYBOOK.md` (oder zentral: `WattWelten/cursor.ai`).

# WattWelten Metaverse

Three.js WebXR Multiplayer Metaverse Platform mit Ready Player Me Integration, Spatial Audio, Ambient-Sound-System und AI-Bridge zu wattos_plattform.

## Quickstart

### Voraussetzungen

- Node.js 20.11.1 (siehe `.nvmrc`)
- pnpm 8.15.0+

### Installation & Setup

```bash
# 1. Dependencies installieren
pnpm install

# 2. Environment-Variablen einrichten (erstellt .env.local aus .env.example)
pnpm setup:env

# 3. Decoder-Dateien herunterladen (Draco/KTX2)
pnpm setup:decoders

# 4. Development Server starten (Client + Server)
pnpm dev
```

Die Anwendung läuft dann auf:

- Client: http://localhost:5173
- Server: http://localhost:3001

### Lokaler Start (Solo-Modus)

Für lokalen Start ohne Server:

```bash
# .env.local anpassen:
VITE_MULTIPLAYER_ENABLED=false

# Nur Client starten:
pnpm dev:client
```

Die App funktioniert auch ohne Server (Solo-Modus, keine Fehler).

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

### Setup

- `pnpm setup:env` - Erstellt `.env.local` aus `.env.example`
- `pnpm setup:decoders` - Lädt Draco/KTX2 Decoder-Dateien herunter

### Development

- `pnpm dev` - Startet alle Development-Server
- `pnpm dev:client` - Startet nur Client (Port 5173)
- `pnpm dev:server` - Startet nur Server (Port 3001)

### Build & Test

- `pnpm build` - Baut alle Packages
- `pnpm lint` - Lintet alle Packages
- `pnpm typecheck` - TypeScript Type-Check
- `pnpm test` - Führt Tests aus
- `pnpm e2e` - E2E Tests (Playwright)

### Assets

- `pnpm assets:import` - Importiert Assets (HDRI/GLB/Audio)
- `pnpm assets:attr` - Generiert Attribution aus Manifesten

## Lizenz

Private - WattWelten
