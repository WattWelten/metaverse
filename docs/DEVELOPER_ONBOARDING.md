# Developer Onboarding Guide

Willkommen beim WattWelten Metaverse Projekt! Dieser Guide hilft dir, schnell mit dem Projekt zu starten.

## 🚀 Quick Start

### Voraussetzungen

- **Node.js**: v18 oder höher
- **pnpm**: v9 oder höher (`npm install -g pnpm`)
- **Docker**: Für Strapi CMS (optional)
- **Git**: Für Versionskontrolle

### Installation

```bash
# Repository klonen
git clone <repository-url>
cd WattWelten_Metaverse

# Dependencies installieren
pnpm install

# Development Server starten
pnpm dev
```

Die App läuft dann auf `http://localhost:5173`

## 📁 Projektstruktur

```
WattWelten_Metaverse/
├── apps/
│   ├── web/          # React + Three.js Frontend
│   ├── server/        # Node.js Backend (Socket.io, Express)
│   └── rtc-api/      # LiveKit RTC Token API
├── packages/          # Monorepo Packages
│   ├── avatars/      # Avatar-System (Ready Player Me, VRM)
│   ├── audio/        # Audio-System (Ambient, Zones)
│   ├── voice/        # Voice Chat (LiveKit, ZoneRouter)
│   ├── net/          # Multiplayer (Socket.io)
│   ├── content/      # Content Provider (Strapi, Local)
│   ├── ui/           # UI Components
│   └── ...
├── docs/             # Dokumentation
├── scripts/          # Utility Scripts
└── strapi/           # Strapi CMS (Docker)
```

## 🎯 Wichtige Features

### 1. Template-System

Templates sind 3D-Umgebungen, die dynamisch geladen werden können:

- **Lokale Templates**: `apps/web/public/templates/*/manifest.json`
- **Strapi Templates**: Über CMS verwaltet
- **Hot-Swap**: Templates können zur Laufzeit gewechselt werden

**Template-Struktur:**

```json
{
  "id": "watt-eco",
  "name": "Watt Eco - Forest Sunset",
  "version": "1.0.0",
  "assets": {
    "scene": "scene.glb",
    "hdri": "hdri.hdr",
    "navmesh": "navmesh.glb"
  },
  "spawn": [0, 1.6, 6],
  "zones": [...],
  "audioBeacons": [...]
}
```

### 2. Avatar-System

- **Ready Player Me**: Avatar-Erstellung und -Laden
- **VRM Support**: Erweiterte Avatar-Features (Emotes, Lip-Sync)
- **Animationen**: Walk, Idle, Wave, Dance, etc.
- **First-Person / Third-Person**: View-Switching (V-Taste)

### 3. Multiplayer

- **Socket.io**: Echtzeit-Kommunikation
- **LiveKit**: Voice Chat (WebRTC)
- **Avatar-Synchronisation**: Position, Rotation, Animation
- **Zone-System**: Audio-Zonen für räumlichen Voice Chat

### 4. Navigation

- **NavMesh**: Präzise Bewegung auf 3D-Oberflächen
- **Collision Detection**: Avatar-zu-Avatar Kollisionen
- **Smooth Movement**: Interpolation für flüssige Bewegung

## 🔧 Development Workflow

### Scripts

```bash
# Development
pnpm dev                    # Startet Web-App (Port 5173)
pnpm dev:server             # Startet Backend-Server (Port 3001)
pnpm dev:rtc-api            # Startet RTC-API (Port 8787)

# Testing
pnpm test                   # Unit Tests
pnpm e2e                    # E2E Tests (Playwright)
pnpm test:e2e:dev           # E2E Tests im Dev-Modus

# Build
pnpm build                  # Production Build
pnpm build:server            # Server Build

# Templates
pnpm setup:templates         # Template-Registry generieren
pnpm templates:validate      # Template-Validierung
```

### Environment Variables

Erstelle `.env.local` in `apps/web/`:

```env
# Server
VITE_SERVER_URL=http://localhost:3001

# RTC (LiveKit)
VITE_RTC_URL=ws://localhost:7880
VITE_RTC_TOKEN_URL=http://localhost:8787/api/rtc/token

# CMS (Strapi)
VITE_CMS_PROVIDER=local
VITE_STRAPI_URL=http://localhost:1337
VITE_STRAPI_TOKEN=your-token-here

# Features
VITE_XR_ENABLED=true
VITE_VOICE_ENABLED=true
VITE_AI_ENABLED=false
VITE_TEMPLATE_SWITCH=true
```

### Code-Qualität

- **TypeScript**: Strict Mode aktiviert
- **ESLint**: Code-Linting
- **Prettier**: Code-Formatierung
- **Conventional Commits**: Commit-Messages

## 🐛 Troubleshooting

### Avatar lädt nicht

- Prüfe Browser-Konsole auf Fehler
- Stelle sicher, dass Ready Player Me URL gültig ist
- Fallback: Capsule-Avatar wird automatisch erstellt

### Bewegung funktioniert nicht

- Stelle sicher, dass Pointer Lock aktiviert ist (Enter-Button)
- Prüfe, ob NavMesh geladen wurde
- Teste WASD-Tasten in Browser-Konsole

### Template lädt nicht

- Prüfe `apps/web/public/templates.json`
- Stelle sicher, dass Template-Manifest existiert
- Prüfe Browser-Konsole auf Fehler

## 📚 Weitere Dokumentation

- [Architektur](docs/architecture.md)
- [Template-System](docs/templates.md)
- [Avatar-System](docs/avatars.md)
- [Audio & Voice](docs/audio-voice.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Master Index](docs/MASTER_INDEX.md)

## 🤝 Contributing

1. Erstelle einen Feature-Branch: `git checkout -b feat/my-feature`
2. Committe deine Änderungen: `git commit -m "feat: add my feature"`
3. Pushe zum Branch: `git push origin feat/my-feature`
4. Erstelle einen Pull Request

## 📞 Support

Bei Fragen oder Problemen:

- Prüfe die [Dokumentation](docs/)
- Öffne ein Issue auf GitHub
- Kontaktiere das Entwicklungsteam

---

**Viel Erfolg beim Entwickeln! 🚀**
