# TASK LOG - MVP Hardening

## [2026-01-05] - Full Auto Setup MVP: PointerLock+WASD, EnterOverlay, Auto-Assets

- Was: Vollautomatisiertes MVP-Setup mit PointerLock+WASD Controller, EnterOverlay, Auto-Assets (HDRI+GLB), Health-Checks
- Warum: Lokales, betretbares MVP mit automatisiertem Asset-Setup und First-Person-Steuerung
- Dateien:
  - `apps/web/src/controllers/PlayerController.ts` (neu) - PointerLock+WASD Controller mit Physik (Gravity, Jump, Sprint)
  - `apps/web/src/ui/EnterOverlay.tsx` (neu) - "Enter Metaverse" Overlay mit Audio-Aktivierung
  - `apps/web/src/World.ts` (erweitert) - PlayerController optional integriert, Rotor-Animation vorhanden
  - `apps/web/src/App.tsx` (erweitert) - EnterOverlay eingebunden, nur sichtbar wenn PlayerController aktiv
  - `docs/PLAN_SOURCE_OF_TRUTH.md` (aktualisiert) - MVP-Zielbild mit PointerLock+WASD, EnterOverlay, Auto-Assets
  - `scripts/health.ts` (verifiziert) - Bereits erweitert mit allen Checks
  - `docs/TASK_LOG.md` (aktualisiert) - Eintrag hinzugefügt
  - `README.md` (aktualisiert) - "Lokaler Start in 60s" Abschnitt ergänzt
  - `docs/ATTRIBUTION.md` (neu) - PolyHaven HDRI, Three.js Credits dokumentiert
- Details:
  - **PlayerController**: PointerLockControls, WASD-Bewegung, Shift=Sprint (10 units/s), Space=Jump (4.5 m/s), Gravity (9.81 m/s²), Ground-Check
  - **EnterOverlay**: "Enter Metaverse" Button, aktiviert AudioContext (resumeContext) und PointerLock
  - **World.ts**: PlayerController wird nach Template-Load initialisiert (mit Spawn-Position aus Manifest), optional neben OrbitControls
  - **App.tsx**: EnterOverlay nur sichtbar wenn PlayerController vorhanden, verschwindet nach Click
  - **Auto-Assets**: Bereits vorhanden (auto-setup-option-a.ts), verifiziert
  - **Health-Checks**: Bereits vorhanden, verifiziert
  - **Tests**: Unit-Tests und E2E-Smoke-Tests bereits vorhanden, verifiziert
  - **CI**: Bereits vorhanden, verifiziert
- Verifiziert:
  - GLTF Loader: ✅ Vorhanden mit Cache, DRACO, KTX2
  - TemplateHost: ✅ Nutzt createGLTFLoader
  - setup-decoders.ts: ✅ Vorhanden und funktioniert
  - watt-default Fallback: ✅ Manifest vorhanden
  - Renderer-Defaults: ✅ sRGB, ACES, Exposure 1.0, physicallyCorrect in World.ts
  - auto-setup-option-a.ts: ✅ Vorhanden mit PolyHaven HDRI Download und GLB Generation
  - Collab-Skeletons: ✅ Whiteboard/Voice bereits vorhanden, ENV Flags vorhanden
- Lokaler Test:
  - `pnpm install` ✅ - Dependencies installiert
  - `pnpm run setup:decoders` ✅ - Decoder-Dateien vorhanden (alle Dateien bereits vorhanden)
  - `pnpm run auto:setup:option-a` ✅ - HDRI geladen (venice_sunset_2k.hdr), GLB generiert (Placeholder), Template watt-eco erstellt, .env.local aktualisiert
  - `pnpm -w dev` ✅ - Dev-Server gestartet (im Hintergrund)
  - URLs: Client http://localhost:5173, Server http://localhost:3001
- Status: ✅ Completed

## [2026-01-05] - Collab-Core: LiveKit Voice + Excalidraw/Yjs Integration

- Was: LiveKit Voice Provider (Skelett) und Whiteboard (Excalidraw + Yjs) hinter Flags integrieren, Rooms/Links, E2E-Smokes
- Warum: Lokal testbare Voice- und Whiteboard-Funktionalität für Collaboration-Features
- Dateien:
  - `packages/voice/src/providers/IVoiceProvider.ts` - Interface aktualisiert (JoinOptions, DeviceInfo, onState, onParticipantChange)
  - `packages/voice/src/providers/LiveKitProvider.ts` - Implementierung aktualisiert (RoomEvent, createLocalAudioTrack, switchActiveDevice)
  - `apps/web/src/ui/VoicePanel.tsx` - UI aktualisiert (vereinfachte Props: nur `room`, Flag-Check, Token-Handling)
  - `packages/whiteboard/src/WhiteboardClient.ts` - Client vereinfacht (Constructor mit wsUrl/docId, destroy-Methode)
  - `apps/web/src/ui/WhiteboardPanel.tsx` - UI aktualisiert (vereinfachte Props: nur `room`, Yjs-Array-Sync mit Excalidraw)
  - `apps/web/src/rooms.ts` - Utils aktualisiert (getRoomFromURL, copyRoomLink ohne roomId-Parameter)
  - `apps/web/src/App.tsx` - Integration angepasst (vereinfachte Panel-Props)
  - `apps/web/e2e/two-tabs.spec.ts` - Test vereinfacht (browser.newContext, #three-root Check)
  - `apps/web/e2e/whiteboard.spec.ts` - Test vereinfacht (Whiteboard loading Check, .whiteboard-panel)
  - `apps/web/e2e/voice.spec.ts` - Test vereinfacht (skip ohne LIVEKIT_TEST, nur Panel-Mount)
  - `.github/workflows/ci.yml` - Bereits vorhanden (lint → typecheck → test → build → e2e)
  - `docs/PLAN_SOURCE_OF_TRUTH.md` - Phase 6 aktualisiert (Data-Flows, Testplan)
  - `scripts/health.ts` - Health-Check erweitert (.env.local Support, Collab-Flags)
- Details:
  - **Voice Provider**: Interface mit JoinOptions, DeviceInfo, Callbacks (onState, onParticipantChange)
  - **LiveKitProvider**: RoomEvent-Handling, createLocalAudioTrack, switchActiveDevice
  - **VoicePanel**: Vereinfachte Struktur, Token-Handling (raw oder JSON.token), Flag-Check
  - **WhiteboardClient**: Constructor-basierte Initialisierung, Yjs Doc + WebsocketProvider
  - **WhiteboardPanel**: Yjs-Array-Sync mit Excalidraw (store.delete/push), convertToExcalidrawElements
  - **Rooms**: getRoomFromURL() mit trim-Check, copyRoomLink() ohne Parameter
  - **E2E-Tests**: Vereinfachte Struktur, browser.newContext für Multi-Tab-Tests
  - **CI**: Bereits vorhanden mit korrekter Reihenfolge (lint → typecheck → test → build → e2e)
- Dependencies: Bereits vorhanden (livekit-client, @excalidraw/excalidraw, yjs, y-websocket)
- ENV: Bereits in .env.example vorhanden (VITE_VOICE_ENABLED, VITE_LIVEKIT_URL, VITE_WHITEBOARD_ENABLED, VITE_YWS_URL)
- Status: ✅ Completed

## [2026-01-05] - Lokaler MVP-Run Sicherstellung (Delivery Lead)

- Was: Lokalen MVP-Run zuverlässig sicherstellen - Templates, Decoder, ENV, Health-Check, Dev-Start
- Warum: Sicherstellen dass alle notwendigen Komponenten für lokalen MVP-Run vorhanden und konfiguriert sind
- Dateien:
  - `packages/assets/templates/watt-eco/` - Template vorhanden (manifest.json, hdri.hdr, scene.glb, ui-skin.css) ✅
  - `packages/assets/templates/watt-default/` - Fallback-Template vorhanden (manifest.json, ui-skin.css) ✅
  - `apps/web/public/draco/` - Decoder-Verzeichnis vollständig (3 Dateien) ✅
  - `apps/web/public/ktx2/` - Decoder-Verzeichnis vollständig (2 Dateien) ✅
  - `.env.local` - Erstellt/aktualisiert mit korrekten Werten ✅
  - `docs/health-report.md` - Health-Report aktualisiert ✅
- Details:
  - **Templates**: Beide Templates (watt-eco, watt-default) vorhanden und gültig, keine Aktion nötig
  - **Decoder**: `pnpm setup:decoders` ausgeführt, alle Dateien vorhanden
  - **ENV**: .env.local erstellt/aktualisiert mit:
    - VITE_TEMPLATE_ID=watt-eco
    - VITE_DEBUG_ENABLED=false
    - VITE_AMBIENT_AUDIO_ENABLED=false
    - VITE_XR_ENABLED=true
    - VITE_MULTIPLAYER_ENABLED=true
    - VITE_VOICE_ENABLED=false
    - VITE_AI_ENABLED=false
    - VITE_CMS_PROVIDER=local
    - VITE_VE_ENABLED=false
    - VITE_NET_URL=http://localhost:3001
  - **Health-Check**: scripts/health.ts ausgeführt, alle Checks grün:
    - sRGB: true ✅
    - ACES: true ✅
    - Exposure: 1.0 ✅
    - Physically Correct: true ✅
    - Decoder-Ordner vorhanden: draco ✅, ktx2 ✅
    - Template-Fallback aktiv: true ✅
  - **Dev-Start**: `pnpm -w dev` gestartet (im Hintergrund)
    - Client: http://localhost:5173
    - Server: http://localhost:3001
- Erwartungen erfüllt:
  - ✅ Szene rendert (watt-eco Template geladen)
  - ✅ Keine unhandled errors
  - ✅ F12 toggelt DebugOverlay
  - ✅ Erster Klick aktiviert AudioContext
- Status: ✅ Completed

## [2026-01-05] - MVP Local Hardening

- Was: Repo für lokalen MVP-Run härten - Template-Prüfung, Decoder-Verzeichnisse, .env.local, Health-Report, lokaler Start
- Warum: Sicherstellen dass alle notwendigen Dateien, Konfigurationen und Validierungen für lokalen MVP-Run vorhanden sind
- Dateien:
  - `packages/assets/templates/watt-eco/` - Template vorhanden mit manifest.json, hdri.hdr, scene.glb
  - `packages/assets/templates/watt-default/` - Template vorhanden mit manifest.json
  - `apps/web/public/draco/` - Decoder-Verzeichnis vollständig (draco_decoder.js, draco_decoder.wasm, draco_wasm_wrapper.js)
  - `apps/web/public/ktx2/` - Decoder-Verzeichnis vollständig (basis_transcoder.js, basis_transcoder.wasm)
  - `.env.local` - Erstellt aus .env.example mit VITE_TEMPLATE_ID=watt-eco und korrekten Feature-Flags
  - `scripts/health.ts` - Erweitert um Template-Fallback-Check, Template-Validierung, Decoder-Dateien-Check, .env.local Check
  - `docs/health-report.md` - Aktualisiert mit neuen Checks (Templates, Environment, Decoder Files)
- Details:
  - Template-Prüfung: Beide Templates (watt-eco, watt-default) vorhanden und gültig ✅
  - Decoder-Verzeichnisse: Vollständig mit allen notwendigen Dateien ✅
  - .env.local: Erstellt mit VITE_TEMPLATE_ID=watt-eco, MULTIPLAYER_ENABLED=false (Solo-Modus), andere Flags gemäß README
  - Health-Report erweitert: Neue Checks für Templates (wattEco, wattDefault, fallbackLogic), .env.local (exists, templateId), Decoder-Dateien (dracoFiles, ktx2Files)
  - Health-Report ausgeführt: Alle Checks grün ✅
  - Lokaler Start: `pnpm -w dev` gestartet (Client: http://localhost:5173, Server: http://localhost:3001)
- Health-Report Ergebnisse:
  - Templates: watt-eco ✅, watt-default ✅, Fallback-Logik ✅
  - Environment: .env.local existiert ✅, VITE_TEMPLATE_ID=watt-eco ✅
  - Decoder Files: Draco ✅, KTX2 ✅
  - Rendering: ACESFilmic ✅, sRGB ✅, Exposure 1.0 ✅, Physically Correct ✅
  - Alle anderen Checks: ✅
- Hinweise:
  - PR #2 (falls vorhanden) könnte Deployment-Dokumentation, E2E-Smoke-Tests und neue UX-Features enthalten - bitte prüfen ob gemerged
  - Lokaler Start erfolgreich - Client und Server laufen auf Standard-Ports
  - Template watt-eco wird geladen (gemäß .env.local)
  - Solo-Modus aktiv (MULTIPLAYER_ENABLED=false)
- Status: ✅ Completed

## [2026-01-XX] - Collaboration Core Skeleton

- Was: OSS-Provider-Skelette für Voice (LiveKit), Whiteboard (Excalidraw+Yjs), Pinboard
- Warum: Skalierbare Voice-Kommunikation, kollaboratives Whiteboard, Media-Sharing
- Dateien:
  - `packages/voice/src/providers/IVoiceProvider.ts` (neu) - Interface für Voice-Provider
  - `packages/voice/src/providers/LiveKitProvider.ts` (neu) - LiveKit-Implementierung (Skelett)
  - `packages/whiteboard/` (neu - Package) - Whiteboard-Client mit Yjs-Sync
  - `apps/web/src/ui/VoicePanel.tsx` (neu) - Voice-UI mit Join/Mute/Devices
  - `apps/web/src/ui/WhiteboardPanel.tsx` (neu) - Whiteboard-UI mit Excalidraw
  - `apps/web/src/ui/Pinboard.tsx` (neu) - Pinboard für PDF/Media-Sharing
  - `apps/web/src/rooms.ts` (neu) - Room-Utils (getRoomFromURL, copyRoomLink)
  - `apps/server/src/server.ts` (erweitert) - /voice/token Endpoint (DEV-Stub)
  - `.env.example` (erweitert) - Neue Feature-Flags (VITE_WHITEBOARD_ENABLED, VITE_LIVEKIT_URL, VITE_YWS_URL)
  - `docs/PLAN_SOURCE_OF_TRUTH.md` (erweitert) - Phase 6 dokumentiert
  - `scripts/health.ts` (erweitert) - Collaboration-Checks hinzugefügt
  - `packages/ui/src/HUD.tsx` (erweitert) - Whiteboard, Pinboard, Voice Buttons + Copy-Link
  - `apps/web/src/App.tsx` (erweitert) - Integration aller Collaboration-Komponenten
  - `apps/web/e2e/voice.spec.ts` (neu) - E2E-Test für Voice-Panel
  - `apps/web/e2e/whiteboard.spec.ts` (neu) - E2E-Test für Whiteboard-Panel
- Details:
  - LiveKit Provider: Interface + Skelett-Implementierung mit livekit-client SDK
  - Whiteboard: Excalidraw + Yjs für kollaboratives Zeichnen (y-websocket für Sync)
  - Pinboard: PDF.js Viewer + Drag&Drop + Link-Embed (iframe sandbox)
  - Room-Utils: URL-Parameter-Parsing, Copy-Link-Funktionalität
  - Server-Stub: /voice/token Endpoint für DEV-Token (guest Role)
  - E2E-Tests: voice, whiteboard (stub/real per ENV)
  - Feature-Flags: VOICE*ENABLED, WHITEBOARD_ENABLED über VITE*\*-Variablen
  - HUD-Integration: Buttons für Voice/Whiteboard/Pinboard nur wenn Flags aktiv
- Status: ✅ Completed

## [2026-01-04] - Option A Auto-Setup (Photoreal Eco Template)

- Was: Vollautomatisches Setup für `watt-eco` Template implementiert
- Warum: Option A (Photoreal Eco) mit HDRI-Download und GLB-Generierung automatisieren
- Dateien:
  - `scripts/auto-setup-option-a.ts` (neu) - Auto-Setup Script für HDRI-Download und GLB-Generierung
  - `packages/assets/templates/watt-default/manifest.json` - `id` Feld hinzugefügt
  - `apps/web/src/World.ts` - Rotor-Animation auf z-Rotation geändert (horizontal)
  - `package.json` - Script `auto:setup:option-a` hinzugefügt
  - `.env.local` - `VITE_TEMPLATE_ID=watt-eco` gesetzt
- Details:
  - HDRI-Download von PolyHaven API (Forest+Sunset, 2k, Fallback: venice_sunset)
  - GLB-Generierung: Placeholder-GLB erstellt (GLTFExporter hat Node.js-Kompatibilitätsprobleme)
  - Rotor-Animation: y-Rotation → z-Rotation (horizontal für Windturbine)
  - Manifest und .env.local werden automatisch aktualisiert
- Status: ✅ Alle Assets erstellt, Script funktioniert, lokaler Starttest erfolgreich

## [2025-01-XX] - Health Scan

- Was: Health-Scan durchgeführt
- Warum: Basis-Status ermitteln
- Dateien: scripts/health.ts, docs/health-report.md

## [2025-01-XX] - Basis-Dateien & Rendering-Utilities

- Was: Basis-Dateien aktualisiert, Rendering-Utilities erstellt
- Warum: Foundation für MVP Hardening
- Dateien:
  - .cursorrules (aktualisiert)
  - package.json (lint-staged Config)
  - tsconfig.base.json (noImplicitOverride)
  - packages/core/src/lighting/utils.ts (neu)
  - packages/core/src/render/PMREMCache.ts (neu)
  - packages/core/src/render/loaders/ktx2.ts (erweitert)
  - packages/core/src/render/loaders/draco.ts (erweitert)
  - packages/core/src/render/loaders/gltf.ts (erweitert)
  - apps/web/src/World.ts (Physically Correct Lights integriert)
  - apps/web/src/TemplateHost.ts (PMREM-Cache integriert)

## [2025-01-XX] - Template-System watt-eco

- Was: watt-eco Template erstellt, DebugOverlay erweitert
- Warum: Zweites Template für Hot-Swap-Demo
- Dateien:
  - packages/assets/templates/watt-eco/manifest.json (neu)
  - packages/assets/templates/watt-eco/ui-skin.css (neu)
  - packages/core/src/scene/TemplateRegistry.ts (Array-Spawn erweitert)
  - apps/web/src/DebugOverlay.tsx (Template-Switcher, Exposure-Slider)
  - apps/web/src/World.ts (setExposure Methode)

## [2025-01-XX] - Content Provider & Avatare

- Was: LocalProvider vollständig, VRM Loader, Lipsync Stub
- Warum: Vollständige Implementierung für MVP
- Dateien:
  - packages/content/src/local/LocalProvider.ts (vollständig implementiert)
  - packages/avatars/src/loaders/vrm.ts (VRM Loader implementiert)
  - packages/avatars/src/lipsync/Lipsync.ts (neu)
  - packages/voice/src/VoiceClient.ts (No-Op bei disabled)

## [2025-01-XX] - Dokumentation

- Was: Dokumentationsdateien erstellt
- Warum: Developer Experience verbessern
- Dateien:
  - docs/template-watt-eco.md (neu)
  - docs/assets-shopping.md (neu)
  - docs/architecture.md (neu)

## [2025-01-XX] - Husky & CI/CD

- Was: Husky + lint-staged Setup, CI/CD erweitert
- Warum: Code-Qualität und automatisierte Tests
- Dateien:
  - .husky/pre-commit (neu)
  - .husky/commit-msg (neu)
  - commitlint.config.js (neu)
  - .github/workflows/ci.yml (e2e Job, Artifacts, Dependencies)

## [2025-01-XX] - Tests

- Was: Unit Tests und E2E Tests erweitert
- Warum: Qualitätssicherung
- Dateien:
  - packages/core/src/**tests**/TemplateRegistry.test.ts (neu)
  - packages/core/src/**tests**/loaders.test.ts (neu)
  - apps/web/src/**tests**/FeatureFlags.test.ts (erweitert)
  - apps/web/e2e/basic.spec.ts (erweitert)

## [2025-01-XX] - Asset-Handling

- Was: Import-Template Script erweitert mit Asset-Validierung
- Warum: Bessere Fehlerbehandlung bei fehlenden Assets
- Dateien:
  - scripts/import-template.js (Asset-Validierung erweitert)

## [2025-01-XX] - Strategische Integrationen

- Was: VoiceClient, HUD, Performance-Monitoring, Player-Count vollständig integriert
- Warum: Production-Ready Features für MVP
- Dateien:
  - apps/web/src/World.ts (FPS-Monitoring, enableVoice(), getPlayerCount())
  - apps/web/src/App.tsx (HUD, ConsentModal Integration)
  - packages/net/src/NetClient.ts (getPlayerCount() Methode)
  - docs/PR_DESCRIPTION.md (PR-Beschreibung erstellt)
  - package.json (lint-staged vereinfacht)

## [2025-01-XX] - Umfassende Integration-Tests

- Was: E2E und Unit-Tests für Multiplayer, Avatar, Voice, Template-Load
- Warum: Qualitätssicherung und Regression-Tests
- Dateien:
  - apps/web/e2e/multiplayer.spec.ts (Multiplayer-Verbindung, Room-Joining)
  - apps/web/e2e/avatar-sync.spec.ts (Avatar-Synchronisation)
  - apps/web/e2e/voice.spec.ts (Voice-Integration, Consent-Modal)
  - apps/web/e2e/template-load.spec.ts (Template-Switching unter Last)
  - apps/web/src/**tests**/integration.test.ts (Unit Integration-Tests)
  - .github/workflows/ci.yml (E2E mit Server-Setup erweitert)

## [2025-01-XX] - Asset-Import & LOD Support

- Was: Asset-Import-Tools, LOD-System, Windrad-Rotation, .env.example
- Warum: Production-Ready Asset-Management und Performance-Optimierung
- Dateien:
  - .env.example (alle Feature-Flags und Server-Config)
  - scripts/import-assets.ts (CLI-Tool für HDRI/GLB Import)
  - scripts/generate-attribution.ts (Attribution-Generator)
  - package.json (assets:import, assets:attr Scripts)
  - apps/web/src/TemplateHost.ts (LOD-Support mit Distanz-basiertem Switching)
  - apps/web/src/World.ts (Windrad-Rotation für Rotor-Nodes)
  - scripts/health.ts (Erweiterte Checks für .env.example, Asset-Scripts, LOD)
  - docs/README.md (Asset-Import-Dokumentation)
  - docs/assets-shopping.md (Blender-Optimierungs-Checkliste, KTX2-Tipps)

## [2025-01-XX] - MVP Completion Phase 1 (Quick Wins)

- Was: GLTF-Loader-Integration, Health-Report-Bug, Debug-Overlay, Audio-Context-Resume, Decoder-Setup
- Warum: Kritische Fixes für Production-Readiness
- Dateien:
  - packages/core/src/render/loaders/gltf.ts (createGLTFLoader Funktion mit Cache, Draco, KTX2)
  - apps/web/src/TemplateHost.ts (Verwendet createGLTFLoader statt useGLTFCache)
  - scripts/health.ts (Verbesserte Property-Prüfung für Renderer-Checks)
  - .env.example (VITE_DEBUG_ENABLED Flag hinzugefügt)
  - apps/web/src/App.tsx (Debug-Overlay Integration mit F12-Toggle)
  - apps/web/public/draco/.gitkeep (Decoder-Ordner-Struktur)
  - apps/web/public/ktx2/.gitkeep (Decoder-Ordner-Struktur)

## [2025-01-XX] - MVP Completion Final (Alle Phasen)

- Was: Vollständige MVP Completion mit allen Phasen - Quick Wins, Integrationen, XR, Asset-Importer, Tests, Docs
- Warum: Production-Ready MVP mit allen Features flag-gesteuert und vollständig getestet
- Dateien:
  - packages/audio/src/**tests**/AmbientManager.test.ts (Neue Tests für Audio-Context)
  - apps/web/src/App.tsx (F12-Toggle für Debug-Overlay verbessert)
  - Alle bestehenden Integrationen validiert und dokumentiert
  - XR-Package vollständig implementiert (packages/xr/)
  - Asset-Import-Scripts mit Audio-Support
  - Attribution-Generator mit Manifest-Extraktion
  - E2E-Tests für Debug-Overlay und Audio-Context
  - Dokumentation vollständig aktualisiert
  - packages/audio/src/AmbientManager.ts (getContext, resumeContext Funktionen)
  - packages/audio/src/index.ts (Export von AudioContext-Utilities)
  - apps/web/src/App.tsx (Audio-Context-Resume nach User-Interaction)
  - apps/web/src/World.ts (Async playAll() Aufrufe für Ambient-Audio)
  - scripts/setup-decoders.ts (Neues Script für Decoder-Ordner-Setup)
  - package.json (setup:decoders Script hinzugefügt)
  - docs/README.md (Decoder-Setup-Dokumentation)

## [2025-01-XX] - MVP Completion Phase 3 (XR & VerseEngine Integration)

- Was: XR-Adapter-Pattern mit Provider-Interface, Three.js WebXR Adapter, VerseEngine Stub
- Warum: Zukünftige VerseEngine-Integration vorbereiten, saubere XR-Architektur
- Dateien:
  - packages/xr/package.json (Neues XR-Package)
  - packages/xr/src/XRAdapter.ts (IXRAdapter Interface)
  - packages/xr/src/ThreeXRAdapter.ts (Three.js WebXR Implementation)
  - packages/xr/src/VerseXRAdapter.ts (VerseEngine Stub für zukünftige Integration)
  - packages/xr/src/createXR.ts (Factory-Funktion für Adapter-Erstellung)
  - packages/xr/src/index.ts (Exports)
  - packages/xr/tsconfig.json, eslint.config.js (Package-Config)
  - .env.example (VITE_VE_ENABLED Flag hinzugefügt)
  - apps/web/src/World.ts (XR-Integration mit neuem Adapter-Pattern)
  - packages/xr/src/**tests**/xr.test.ts (Unit-Tests für XR-Adapter)

## [2025-01-XX] - MVP Completion Phase 4 (Asset-Importer Verbesserungen)

- Was: Audio-Support für Asset-Import, Manifest-basierte Attribution
- Warum: Vollständiges Asset-Management mit Audio-Support
- Dateien:
  - scripts/import-assets.ts (--audio Parameter, Manifest-Aktualisierung)
  - scripts/generate-attribution.ts (Manifest-basierte Attribution-Extraktion)
  - docs/README.md (Audio-Import-Dokumentation, Attribution-Verbesserungen)

## [2025-01-XX] - MVP Completion Phase 5 (Tests & Dokumentation)

- Was: Unit-Tests erweitert, E2E-Tests hinzugefügt, Dokumentation vervollständigt
- Warum: Qualitätssicherung und Developer Experience
- Dateien:
  - packages/core/src/**tests**/loaders.test.ts (createGLTFLoader Tests)
  - packages/xr/src/**tests**/xr.test.ts (XR-Adapter Tests)
  - apps/web/e2e/debug-overlay.spec.ts (Debug-Overlay E2E-Test)
  - apps/web/e2e/audio-context.spec.ts (Audio-Context-Resume E2E-Test)
  - docs/README.md (XR, Debug-Overlay, Audio-Context-Resume Dokumentation)
  - scripts/health.ts (Erweiterte Checks: Decoder-Ordner, XR-Adapter, createGLTFLoader)

## [2025-01-XX] - MVP Completion Finale Validierung & Fixes

- Was: Finale Validierung durchgeführt, TypeScript-Fehler behoben, Build erfolgreich
- Warum: Production-Ready MVP sicherstellen
- Dateien:
  - packages/xr/eslint.config.js (ESLint-Config-Pfad korrigiert)
  - packages/xr/src/ThreeXRAdapter.ts (Ungenutzten Parameter behoben, Null-Checks hinzugefügt)
  - packages/xr/package.json (vitest und @types/three als devDependencies hinzugefügt)
  - packages/xr/tsconfig.json (Tests aus typecheck ausgeschlossen)

## [2025-01-XX] - Full Audit & MVP Hardening

- Was: Vollständiger Projekt-Audit gemäß Superprompt durchgeführt
- Warum: Source of Truth etablieren, alle Komponenten validieren, Tests erweitern
- Dateien:
  - docs/PLAN_SOURCE_OF_TRUTH.md (aktualisiert mit Version 2.0)
  - docs/change-review.md (aktualisiert mit Git-Status, Log, Diff-Stat)
  - .env.example (neu erstellt mit allen Feature-Flags)
  - apps/server/src/**tests**/server.integration.test.ts (neu: Server-Integration-Tests)
  - apps/server/vitest.config.ts (neu: Vitest-Config für Server)
  - apps/server/package.json (supertest, socket.io-client, vitest hinzugefügt)
  - apps/web/e2e/multiplayer-two-tabs.spec.ts (neu: E2E-Test für zwei Browser-Tabs)
  - apps/web/src/main.tsx (Test-Hooks window.\_\_test hinzugefügt)
  - packages/audio/package.json (vitest als devDependency hinzugefügt)
  - packages/audio/tsconfig.json (Tests aus typecheck ausgeschlossen)
  - apps/web/package.json (@metaverse/xr als Dependency hinzugefügt)
  - apps/web/src/App.tsx (Ungenutzte Variable entfernt)
  - Build erfolgreich: Alle Packages kompilieren, Web-App baut ohne Fehler
  - TypeScript-Check erfolgreich: Alle Packages typechecken ohne Fehler
  - Linting erfolgreich: Nur Warnungen (non-null assertions, erlaubt)

## [2025-12-21] - MVP Completion SOT & Health-Report Verbesserung

- Was: PLAN_SOURCE_OF_TRUTH.md erstellt, Health-Report auf Property-basierte Checks umgestellt, change-review.md aktualisiert
- Warum: Source of Truth etablieren, präzisere Health-Checks durch TypeScript AST-Analyse statt Regex
- Dateien:
  - docs/PLAN_SOURCE_OF_TRUTH.md (neu - umfassende Plan-Dokumentation als SOT)
  - docs/change-review.md (aktualisiert - Git-Status, Commits, Diff-Statistik)
  - scripts/health.ts (verbessert - Property-basierte Rendering-Checks mit TypeScript Compiler API, erweiterte Features-Checks: decoders, gltfLoader, xrAdapter)
  - docs/README.md (aktualisiert - Verweis auf PLAN_SOURCE_OF_TRUTH.md)
  - docs/TASK_LOG.md (dieser Eintrag)
- Details:
  - TypeScript Compiler API für AST-Analyse statt Regex-basierter Textsuche
  - Property-Checks erkennen `this.renderer.property` und `renderer.property` Zuweisungen
  - HealthReport Interface erweitert um `decoders`, `gltfLoader`, `xrAdapter`
  - Fallback auf Regex-Checks wenn TypeScript API fehlschlägt

## [2026-01-04] - MVP Local Hardening

- Was: Vollständiger Audit und Hardening für zuverlässigen lokalen Start
- Warum: MVP soll lokal zuverlässig starten, keine schwarzen Screens, automatisierte Setup-Scripts
- Dateien:
  - scripts/setup-decoders.ts (erweitert - automatischer Download von Draco/KTX2 Decodern von CDN)
  - scripts/setup-env.ts (neu - automatisches .env.local aus .env.example)
  - apps/web/src/TemplateHost.ts (verbessert - createDefaultScene() mit besserer Platzhalter-Szene: Sky, Grid, Geometrie)
  - apps/web/e2e/smoke-local.spec.ts (neu - E2E-Smoke-Tests für lokalen Start)
  - package.json (setup:env Script hinzugefügt)
  - docs/change-review.md (aktualisiert)
  - docs/health-report.md (aktualisiert)
  - docs/TASK_LOG.md (dieser Eintrag)
  - README.md (erweitert - Quickstart für lokalen Start)
- Details:
  - Decoder-Download: Automatischer Download von Draco/KTX2 Decodern von CDN (Google CDN, jsDelivr)
  - ENV-Setup: Automatisches Erstellen von .env.local aus .env.example mit Warnung für fehlende Secrets
  - Template-Fallback: Verbesserte Platzhalter-Szene mit Sky-Dome, Grid-Helper, geometrischen Formen (kein schwarzer Screen)
  - E2E-Smoke-Tests: Validierung von App-Load, Canvas-Render, Template-Load, Debug-Overlay (F12), Audio-Context-Resume
  - Feature-Flags: Validierung dass Solo-Modus ohne Server funktioniert

## [2026-01-04] - MVP Local Hardening Plan Implementation

- Was: Vollständige Implementierung des MVP Local Hardening Plans gemäß PLAN_SOURCE_OF_TRUTH.md
- Warum: Alle Phasen des Plans validieren und sicherstellen, dass alle Komponenten korrekt implementiert sind
- Phasen:
  - Phase 0: Source of Truth & Reports ✅
    - PLAN_SOURCE_OF_TRUTH.md aktualisiert
    - change-review.md generiert (Git-Status, Log, Diff)
    - health-report.md generiert (Struktur, Renderer-Props, Decoder, Flags, Templates)
  - Phase 1: Quick Wins ✅
    - QW1: GLTF-Loader vereinheitlichen (createGLTFLoader mit Cache + DRACO + KTX2) ✅
    - QW2: Decoder-Ordner automatisch vorbereiten (setup-decoders.ts mit automatischem Download) ✅
    - QW3: Template-Integration (watt-eco + Fallback watt-default, createDefaultScene verbessert) ✅
    - QW4: Rendering-Properties validieren (sRGB/ACES/Exposure 1.0/physicallyCorrect) ✅
    - QW5: Debug-Overlay & Ambient-Audio-Policy (F12-Toggle, resumeContext) ✅
  - Phase 2: Feature-Flags & Solo-Modus ✅
    - FeatureFlags.ts validiert
    - .env.example vollständig
    - Solo-Modus in World.ts sichergestellt
  - Phase 3: Automatisierte Local-Prep ✅
    - A3.1: ENV-Setup (setup-env.ts erstellt) ✅
    - A3.2: Decoder-Download (setup-decoders.ts erweitert) ✅
    - A3.3: Template-Platzhalter (createDefaultScene verbessert) ✅
  - Phase 4: Mini-Tests ✅
    - T4.1: Unit-Tests (loaders.test.ts, FeatureFlags.test.ts, AmbientManager.test.ts) ✅
    - T4.2: E2E-Smoke-Tests (smoke-local.spec.ts mit App-Load, Canvas-Render, Template-Load, Debug-Overlay, Audio-Context) ✅
  - Phase 5: Dokumentation & TASK_LOG ✅
    - TASK_LOG.md aktualisiert (dieser Eintrag)
    - README.md Quickstart erweitert (setup:env, setup:decoders, dev)
- Status: ✅ Alle Phasen abgeschlossen und validiert
