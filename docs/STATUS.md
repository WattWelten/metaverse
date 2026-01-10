# WattWelten Metaverse - MVP Status

## ✅ Implementiert (Phase 0-4)

### Phase 0: Projekt-Setup

- ✅ GitHub Actions CI/CD Pipeline
- ✅ Sentry Integration (Web + Server)
- ✅ Dokumentation (ENV.md, MVP-Guide.md, CONTRIBUTING.md)

### Phase 1: SFU-Integration (LiveKit)

- ✅ `packages/rtc-sfu` - LiveKit Client-Wrapper
- ✅ Token-Endpoint `/api/rtc/token` im Server
- ✅ VoicePanel auf RTCClient umgestellt
- ✅ PTT-Button Komponente

### Phase 2: Audio-Zonen

- ✅ Zone-Engine (`packages/voice/src/zone-engine.ts`)
- ✅ Vollständige Integration in World.ts:
  - Cross-Zone-Muting (Hard-Mute bei unterschiedlichen Zonen)
  - Distance-basierte Attenuation (gleiche Zone)
  - Zone-Membership-Tracking pro Frame
- ✅ Scene Schema erweitert
- ✅ ZoneIndicator im HUD

### Phase 3: Lightweight Collaboration

- ✅ Y-WebSocket in `apps/server` integriert (`/yws`)
- ✅ Collab-Docs Package (TipTap + Yjs)
- ✅ WhiteboardPanel auf neuen Endpoint umgestellt

### Phase 4: Companion-Phone

- ✅ Remote-Route `/remote` (PWA-fähig)
- ✅ QR-Pairing Komponente
- ✅ PWA-Manifest

### Phase 5: Cloud-Auth & Content

- ✅ AuthService erweitert um Rollen (host/moderator/speaker/guest)
- ✅ Server-Auth-Routen erweitert
- ✅ Strapi Provider (`packages/content/src/strapi.ts`)
- ✅ Demo-Szenen (demo-plaza, demo-meeting)

### Phase 6: Testing & Performance

- ✅ E2E-Tests (`apps/web/e2e/mvp.spec.ts`)
- ✅ DRACO/KTX2 bereits implementiert (`packages/core/src/render/loaders/`)

## 🚧 In Arbeit / Offen

### Phase 6: NextAuth.js Integration

- ⚠️ Cloud-Auth Basis implementiert, OAuth-Provider noch nicht vollständig
- ⚠️ NextAuth.js würde Next.js erfordern (aktuell Vite + React)

### Phase 7: Performance-Optimierung

- ✅ DRACO/KTX2 Loader vorhanden
- ⚠️ Asset-Pipeline für Batch-Optimierung noch nicht vollständig
- ⚠️ LOD-System noch nicht implementiert

### Phase 8: Demo-Szenen

- ✅ Manifest-Dateien erstellt
- ⚠️ 3D-Assets (scene.glb, navmesh.glb) noch nicht vorhanden
- ⚠️ HDRI-Umgebungen noch nicht vorhanden

## 📊 Technische Metriken

### Performance-Ziele

- **Join-Zeit**: p90 < 6s (gecachte Assets)
- **FPS**: Desktop p90 ≥ 50 FPS (Demo-Scene)
- **Audio-Latenz**: E2E < 400ms
- **Collab-Sync**: < 200ms

### Skalierung

- **Teilnehmer**: 5-10 aktive pro Space
- **Audio-Zonen**: Unbegrenzt (clientseitig berechnet)
- **Whiteboard**: 5 gleichzeitige Editoren

## 🔧 Konfiguration

### Environment Variables

Siehe `docs/ENV.md` für vollständige Liste.

**Wichtig:**

- `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` - Für Audio/Video
- `STRAPI_URL`, `STRAPI_TOKEN` - Für No-Code Scenes (optional)
- `SENTRY_DSN` - Für Fehlertelemetrie (optional)

## 📝 Nächste Schritte

1. **Demo-Assets erstellen**: 3D-Modelle für demo-plaza und demo-meeting
2. **OAuth-Integration**: Google/GitHub OAuth für Cloud-Auth
3. **Asset-Pipeline**: Batch-Optimierung mit DRACO/KTX2
4. **LOD-System**: Automatische LOD-Generierung für große Assets
5. **E2E-Tests erweitern**: Multi-Browser-Szenarien, Performance-Tests

## 🧪 Testing

### Lokale Entwicklung

```bash
# Server starten
cd apps/server && pnpm dev

# Web-App starten
cd apps/web && pnpm dev

# E2E-Tests
pnpm -w e2e
```

### Browser-Tests

Siehe `docs/TESTING.md` für detaillierten Testplan.
