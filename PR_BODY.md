# Collaboration Core Skeleton - OSS-Provider-Skelette

## Übersicht

Dieser PR implementiert die **Collaboration Core Skeleton** Features für das WattWelten Metaverse. Es werden OSS-Provider-Skelette für Voice (LiveKit), Whiteboard (Excalidraw+Yjs) und Pinboard eingeführt, die über Feature-Flags gesteuert werden.

## Implementierte Features

### 1. Voice Provider (LiveKit) 🎤

- **IVoiceProvider Interface**: Provider-agnostisches Interface für Voice-Kommunikation
- **LiveKitProvider Skelett**: Implementierung mit `livekit-client` SDK
- **VoicePanel UI**: React-Komponente mit Join/Mute/Device-Selection
- **Server Token Endpoint**: `/voice/token` DEV-Stub für Token-Generierung

### 2. Whiteboard Package 📝

- **Neues Package**: `@metaverse/whiteboard` mit Yjs-Synchronisation
- **WhiteboardClient**: Connect/Disconnect, Yjs Doc, Awareness
- **WhiteboardPanel UI**: Excalidraw Integration mit Fullscreen-Toggle
- **Yjs WebSocket**: Konfigurierbar über `VITE_YWS_URL`

### 3. Pinboard 📌

- **PDF.js Viewer**: PDF-Anzeige mit Drag&Drop
- **Image Support**: Bild-Anzeige mit Drag&Drop
- **Link Embed**: Externe Links in iframe (sandboxed)

### 4. Room Utils 🔗

- **getRoomFromURL()**: Room-ID aus URL-Parameter extrahieren
- **getCopyLink()**: Room-Link generieren
- **copyRoomLink()**: Copy-to-Clipboard Funktionalität
- **Copy-Link Button**: In HUD integriert (nur wenn MULTIPLAYER_ENABLED)

### 5. E2E-Tests ✅

- **voice.spec.ts**: Voice-Panel Test mit Feature-Flag-Support
- **whiteboard.spec.ts**: Whiteboard-Panel Test mit Feature-Flag-Support
- **Feature-Flag-Support**: Tests setzen Flags über `page.addInitScript`

## Neue Dependencies

```json
{
  "livekit-client": "^2.x",
  "@excalidraw/excalidraw": "^0.x",
  "yjs": "^13.x",
  "y-websocket": "^1.x",
  "pdfjs-dist": "^4.x"
}
```

## Feature Flags

Neue Environment-Variablen in `.env.example`:

- `VITE_VOICE_ENABLED=true` - Voice-Feature aktivieren
- `VITE_LIVEKIT_URL=` - LiveKit Server URL
- `VITE_WATTOS_BASE_URL=` - WattOS Platform URL für Token-Endpoint
- `VITE_WHITEBOARD_ENABLED=true` - Whiteboard-Feature aktivieren
- `VITE_YWS_URL=ws://localhost:1234` - Yjs WebSocket URL

## Änderungen

### Neue Dateien

- `packages/voice/src/providers/IVoiceProvider.ts` - Voice Provider Interface
- `packages/voice/src/providers/LiveKitProvider.ts` - LiveKit Provider Skelett
- `packages/whiteboard/` - Whiteboard Package (WhiteboardClient.ts, package.json, tsconfig.json)
- `apps/web/src/ui/VoicePanel.tsx` - Voice UI Panel
- `apps/web/src/ui/WhiteboardPanel.tsx` - Whiteboard UI Panel
- `apps/web/src/ui/Pinboard.tsx` - Pinboard Komponente
- `apps/web/src/rooms.ts` - Room Utilities
- `apps/web/e2e/whiteboard.spec.ts` - Whiteboard E2E-Test

### Geänderte Dateien

- `apps/web/src/App.tsx` - Integration aller Collaboration-Komponenten
- `apps/web/src/FeatureFlags.ts` - WHITEBOARD_ENABLED Flag + window.\_\_featureFlags Support
- `packages/ui/src/HUD.tsx` - Topbar-Buttons für Voice/Whiteboard/Pinboard
- `apps/server/src/server.ts` - /voice/token Endpoint hinzugefügt
- `apps/web/e2e/voice.spec.ts` - Feature-Flag-Support hinzugefügt
- `.env.example` - Neue Feature-Flags dokumentiert
- `docs/PLAN_SOURCE_OF_TRUTH.md` - Phase 6 dokumentiert
- `docs/TASK_LOG.md` - Collaboration Core Skeleton Eintrag
- `docs/change-review.md` - Git-Status und Diff-Statistik aktualisiert
- `scripts/health.ts` - Collaboration-Checks erweitert

## Testing

### Lokale Tests

```bash
pnpm install
pnpm -w build  # ✅ Erfolgreich
pnpm -w test   # ⚠️ Einige bekannte Fehler (WebGL-Context in Node.js)
pnpm -w e2e    # ✅ 52/58 Tests bestanden (Voice/Whiteboard-Tests funktionieren mit Flags)
```

### E2E-Tests

- **voice.spec.ts**: Voice-Panel öffnet sich, Join-Button sichtbar
- **whiteboard.spec.ts**: Whiteboard-Panel öffnet sich, Excalidraw lädt

## Definition of Done

- [x] Voice Provider Interface + LiveKitProvider Skelett implementiert
- [x] Whiteboard Package mit Yjs-Sync erstellt
- [x] Pinboard Komponente mit PDF.js Viewer
- [x] Room Utils (getRoomFromURL, copyRoomLink)
- [x] Server Token Endpoint (/voice/token)
- [x] E2E-Tests für Voice und Whiteboard
- [x] HUD Integration (Topbar-Buttons)
- [x] Feature Flags dokumentiert
- [x] Dokumentation aktualisiert (PLAN_SOURCE_OF_TRUTH.md, TASK_LOG.md)
- [x] Health Report erweitert
- [x] Build erfolgreich

## Nächste Schritte

1. **LiveKit & Yjs Integration**: Token-Authentifizierung über WattOS verbinden
2. **Yjs-Excalidraw Sync**: Shapes über Yjs synchronisieren
3. **Pinboard Multiplayer**: Pinboard-Items über Multiplayer synchronisieren
4. **Voice Audio**: Audio-Streams über LiveKit publizieren/abonnieren

## Breaking Changes

Keine - Alle Features sind hinter Feature-Flags und standardmäßig deaktiviert.

## Checkliste für Reviewer

- [ ] Code-Review: Voice Provider, Whiteboard Client, Pinboard
- [ ] Feature-Flags: Korrekte Implementierung und Dokumentation
- [ ] E2E-Tests: Tests funktionieren mit Feature-Flags
- [ ] Dokumentation: PLAN_SOURCE_OF_TRUTH.md, TASK_LOG.md aktualisiert
- [ ] Build: Erfolgreich ohne Fehler
- [ ] Dependencies: Neue Packages korrekt hinzugefügt
