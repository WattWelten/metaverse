# WattWelten Metaverse - MVP Status

**Letzte Aktualisierung:** 2026-01-XX  
**Branch:** `feat/auto-setup-mvp`  
**Status:** ✅ Implementierung abgeschlossen, MVP-Voll-Implementierung in Arbeit

## ✅ Implementiert (Phase 0-6)

### Phase 0: Projekt-Setup

- ✅ GitHub Actions CI/CD Pipeline
- ✅ Sentry Integration (Web + Server)
- ✅ Dokumentation (ENV.md, MVP-Guide.md, CONTRIBUTING.md)
- ✅ Bereinigung: Doppelte Strukturen entfernt, Dokumentation konsolidiert

### Phase 1: SFU-Integration (LiveKit)

- ✅ `packages/rtc-sfu` - LiveKit Client-Wrapper
- ✅ Token-Endpoint `/api/rtc/token` im Server
- ✅ VoicePanel auf RTCClient umgestellt
- ✅ PTT-Button Komponente
- 🚧 **In Arbeit:** Separate `apps/rtc-api` für Token-Endpoint (Port 8787)

### Phase 2: Audio-Zonen

- ✅ Zone-Engine (`packages/voice/src/zone-engine.ts`)
- ✅ Vollständige Integration in World.ts:
  - Cross-Zone-Muting (Hard-Mute bei unterschiedlichen Zonen)
  - Distance-basierte Attenuation (gleiche Zone)
  - Zone-Membership-Tracking pro Frame
- ✅ Scene Schema erweitert
- ✅ ZoneIndicator im HUD
- 🚧 **In Arbeit:** ZoneRouter für Subscription-Management

### Phase 3: Lightweight Collaboration

- ✅ Y-WebSocket in `apps/server` integriert (`/yws`)
- ✅ Collab-Docs Package (TipTap + Yjs)
- ✅ WhiteboardPanel auf neuen Endpoint umgestellt
- ✅ `packages/whiteboard` mit tldraw + Yjs
- 🚧 **In Arbeit:** Migration zu `packages/collab-whiteboard`

### Phase 4: Companion-Phone

- ✅ Remote-Route `/remote` (PWA-fähig)
- ✅ QR-Pairing Komponente
- ✅ PWA-Manifest
- ✅ Socket.io Pairing-Events (`remote:pair:init`, `remote:ptt`, `remote:emote`, `remote:move`)
- ✅ PTT-Integration mit RTCClient

### Phase 5: Cloud-Auth & Content

- ✅ AuthService erweitert um Rollen (host/moderator/speaker/guest)
- ✅ Server-Auth-Routen erweitert
- ✅ Strapi Provider (`packages/content/src/strapi.ts`)
- ✅ Demo-Szenen (demo-plaza, demo-meeting)
- ✅ Strapi Docker-Compose Setup
- ✅ 5 Content Types (Scene, Asset, Zone, Portal, Audio-Beacon)
- ✅ Content-Refresh Webhook (`/api/content/refresh`)
- 🚧 **In Arbeit:** `normalizeScene()` Funktion, PDF Viewer

### Phase 6: Testing & Performance

- ✅ E2E-Tests (`apps/web/e2e/mvp.spec.ts`, `mvp-smoke.spec.ts`)
- ✅ DRACO/KTX2 bereits implementiert (`packages/core/src/render/loaders/`)
- ✅ Smoke-Tests (`scripts/smoke-*.mjs`)
- ✅ Audit-Script (`.audit/mvp-branch-audit.sh`, `scripts/audit-mvp.mjs`)
- ✅ Strapi Seeds (`scripts/seed-strapi.mjs`)

### Phase 7: Moderation & Consent

- ✅ ConsentModal-Komponente (`apps/web/src/ui/ConsentModal.tsx`)
- ✅ Moderation-Package mit Rollen-Checks (`packages/moderation/src/roles.ts`)
- ✅ Server-Events für Moderation (`ui:raiseHand`, `mod:muteAll`, `mod:spotlight`, `mod:lockRoom`)
- ✅ Raise-Hand Queue (`packages/moderation/src/raiseHand.ts`)
- ✅ StageManager für Spotlight/Lock
- 🚧 **In Arbeit:** Client-Hooks (`apps/web/src/moderation/hooks.ts`)

### Phase 8: GitHub Workflows & Templates

- ✅ 8 GitHub Workflows (Release-Drafter, PR-Labeler, Semantic-PR, Stale, Size-Label, Auto-Assign)
- ✅ 5 Issue-Templates (EPIC, Feature, Bug, Task, Config)
- ✅ PR-Template
- ✅ CODEOWNERS, `.editorconfig`, `.gitattributes`, `SECURITY.md`

## 🚧 In Arbeit / Offen

### MVP-Voll-Implementierung (aktuell)

- ⏳ **PR 1:** `apps/rtc-api` erstellen, `packages/rtc-sfu` erweitern
- ⏳ **PR 2:** ZoneRouter implementieren und in World.ts integrieren
- ⏳ **PR 3:** Whiteboard → collab-whiteboard Migration
- ⏳ **PR 4:** Companion-Features prüfen/ergänzen
- ⏳ **PR 5:** Strapi `normalizeScene()`, PDF Viewer
- ⏳ **PR 6:** Moderation Client-Hooks
- ⏳ **PR 7:** i18n System (DE/EN)
- ⏳ **PR 8:** CI/E2E/Audit erweitern

### Zukünftige Features

- ⚠️ NextAuth.js Integration (OAuth-Provider noch nicht vollständig)
- ⚠️ Asset-Pipeline für Batch-Optimierung noch nicht vollständig
- ⚠️ LOD-System noch nicht implementiert
- ⚠️ 3D-Assets (scene.glb, navmesh.glb) noch nicht vorhanden
- ⚠️ HDRI-Umgebungen noch nicht vorhanden
- ⚠️ VerseEngine XR Adapter (Stub, zukünftige Implementierung)

## 📊 Technische Metriken

### Performance-Ziele

- **Join-Zeit**: p90 < 6s (gecachte Assets)
- **FPS**: Desktop p90 ≥ 50 FPS (Demo-Scene)
- **Audio-Latenz**: E2E < 400ms
- **Collab-Sync**: < 200ms
- **Companion Pairing**: < 5s
- **PTT Latenz**: < 300ms

### Skalierung

- **Teilnehmer**: 5-10 aktive pro Space
- **Audio-Zonen**: Unbegrenzt (clientseitig berechnet)
- **Whiteboard**: 5 gleichzeitige Editoren
- **Screenshare**: 1080p/30fps

## 🔧 Konfiguration

### Environment Variables

Siehe `docs/ENV.md` für vollständige Liste.

**Wichtig:**

- `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` - Für Audio/Video
- `STRAPI_URL`, `STRAPI_TOKEN` - Für No-Code Scenes (optional)
- `SENTRY_DSN` - Für Fehlertelemetrie (optional)
- `YWS_PORT` - Y-WebSocket Port (default: 5179, integriert in Server)
- `RTC_TOKEN_URL` - RTC Token Endpoint (default: http://localhost:8787/token)
- `VITE_I18N_DEFAULT` - Standard-Sprache (de/en)
- `VITE_DYNAMIC_BREAKOUTS` - Dynamische Breakouts (default: false)

## 📝 Nächste Schritte

1. **MVP-Voll-Implementierung abschließen** (8 PRs)
2. **Demo-Assets erstellen**: 3D-Modelle für demo-plaza und demo-meeting
3. **OAuth-Integration**: Google/GitHub OAuth für Cloud-Auth
4. **Asset-Pipeline**: Batch-Optimierung mit DRACO/KTX2
5. **LOD-System**: Automatische LOD-Generierung für große Assets
6. **E2E-Tests erweitern**: Multi-Browser-Szenarien, Performance-Tests

## 🧪 Testing

### Lokale Entwicklung

```bash
# Server starten
cd apps/server && pnpm dev

# Web-App starten
cd apps/web && pnpm dev

# RTC-API starten (neu)
cd apps/rtc-api && pnpm dev

# E2E-Tests
pnpm -w e2e

# Smoke-Tests
pnpm smoke
```

### Browser-Tests

Siehe `docs/TESTING.md` für detaillierten Testplan.

## 📚 Dokumentation

- `docs/ENV.md` - Environment Variables
- `docs/MVP-Guide.md` - Quick Start & Demos
- `docs/CONTRIBUTING.md` - Beitragsrichtlinien
- `docs/TESTING.md` - Test-Strategie
- `docs/STATUS.md` - Dieser Status (konsolidiert)

## 🗑️ Bereinigung

### Abgeschlossen

- ✅ Doppelte Strukturen entfernt (`apps/web/apps/web/`, `apps/web/packages/avatars/`)
- ✅ Dokumentation konsolidiert (alte Status-Docs in STATUS.md gemergt)
- ✅ VerseXRAdapter klar als "future" markiert

### Geplant

- ⏳ TODO/FIXME in Code auflösen oder in Issues verschieben
- ⏳ Whiteboard → collab-whiteboard Migration
- ⏳ Collab-Docs Export `Doc` als Alias hinzufügen
