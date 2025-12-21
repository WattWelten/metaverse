# Change Review - MVP Hardening

**Branch:** `feat/mvp-hardening`  
**Base:** `origin/feat/mvp`  
**Commits:** 6 commits ahead  
**Date:** 2025-01-XX

## Was hat sich geändert?

### Config & DX

- ✅ `.env.example` erstellt (alle Feature-Flags dokumentiert)
- ✅ `.husky/pre-commit` + `.husky/commit-msg` (lint-staged, commitlint)
- ✅ `commitlint.config.js` (Conventional Commits)
- ✅ ESLint v9 Migration (flat config, `packages/*/eslint.config.js` vereinfacht)
- ✅ `turbo.json` angepasst (lint ohne build-dependency)

### Rendering & Core

- ✅ `packages/core/src/lighting/utils.ts` - `setPhysicallyCorrectLights()`
- ✅ `packages/core/src/render/PMREMCache.ts` - PMREM-Generator-Cache
- ✅ `packages/core/src/render/loaders/ktx2.ts` - KTX2-Integration mit GLTFLoader
- ✅ `packages/core/src/render/loaders/draco.ts` - Draco-Integration mit GLTFLoader
- ✅ `packages/core/src/render/loaders/gltf.ts` - GLTF-Cache-Mechanismus verbessert
- ✅ `apps/web/src/World.ts` - Physically Correct Lights, Exposure-Control, FPS-Monitoring, Player-Count, Windrad-Rotation

### Template-System

- ✅ `packages/assets/templates/watt-eco/` - Neues Template (manifest.json, ui-skin.css)
- ✅ `apps/web/src/TemplateHost.ts` - LOD-Support (Distanz-basiert, 40/80 Einheiten), Hot-Swap, Fallback auf `watt-default`, Placeholder-Szene bei fehlendem `scene.glb`
- ✅ `packages/core/src/scene/TemplateRegistry.ts` - Array-Format für `spawn` position unterstützt

### Assets & Tools

- ✅ `scripts/import-assets.ts` - CLI-Tool für HDRI/GLB-Import, Manifest-Update, Attribution
- ✅ `scripts/generate-attribution.ts` - Attribution-Generator aus `assets-shopping.md`
- ✅ `scripts/health.ts` - Health-Scan (Runtimes, Packages, Structure, Rendering, Flags, CI, Docs, ENV, Scripts, LOD)
- ✅ `package.json` - Scripts: `assets:import`, `assets:attr`

### Avatare & Voice

- ✅ `packages/avatars/src/loaders/vrm.ts` - VRM-Loader mit dynamischem Import
- ✅ `packages/avatars/src/lipsync/Lipsync.ts` - Lipsync-Stub
- ✅ `packages/voice/src/VoiceClient.ts` - No-op wenn `VOICE_ENABLED=false`
- ✅ `apps/web/src/App.tsx` - ConsentModal für Voice, HUD-Integration (FPS, Player-Count)

### Content Provider

- ✅ `packages/content/src/local/LocalProvider.ts` - Vollständig implementiert (`create`, `update`, `uploadAsset`)

### UI & Debug

- ✅ `apps/web/src/DebugOverlay.tsx` - Template-Switcher, Exposure-Slider, F12-Toggle
- ✅ `apps/web/src/components/ErrorBoundary.tsx` - `override`-Modifier hinzugefügt

### Tests

- ✅ `apps/web/e2e/multiplayer.spec.ts` - Multiplayer-Connection, Room-Join, Server-Disconnect, Player-Count
- ✅ `apps/web/e2e/avatar-sync.spec.ts` - Avatar-Erstellung, Position-Updates, Error-Handling
- ✅ `apps/web/e2e/voice.spec.ts` - Voice-Consent-Modal, Enable/Disable, Permission-Handling, Spatial-Audio
- ✅ `apps/web/e2e/template-load.spec.ts` - Template-Switching unter Last, State-Persistence, Missing-Assets, Ambient-Audio
- ✅ `apps/web/src/__tests__/integration.test.ts` - Unit-Integration-Tests für World-Klasse
- ✅ `packages/core/src/__tests__/TemplateRegistry.test.ts` - Template-Registry-Tests
- ✅ `packages/core/src/__tests__/loaders.test.ts` - Loader-Utility-Tests

### CI/CD

- ✅ `.github/workflows/ci.yml` - E2E-Job mit Server-Setup erweitert, Artifact-Upload

### Dokumentation

- ✅ `docs/README.md` - Quickstart, ENV-Tabelle, Asset-Import, LOD, Windrad-Rotation
- ✅ `docs/assets-shopping.md` - Blender-Optimierungs-Checkliste, KTX2-Export-Tipps
- ✅ `docs/template-watt-eco.md` - Template-Dokumentation
- ✅ `docs/architecture.md` - Architektur-Dokumentation
- ✅ `docs/TASK_LOG.md` - Fortschritts-Tracking
- ✅ `docs/PR_DESCRIPTION.md` - PR-Beschreibung

### Net & Server

- ✅ `packages/net/src/NetClient.ts` - `getPlayerCount()` hinzugefügt
- ✅ `apps/server/src/presence/PresenceService.ts` - `getSocketIdByUserId()` für WebRTC-Signaling

## Breaking / Fragile

### ⚠️ Potenzielle Breaking Changes

1. **ESLint v9 Migration**: Alle `eslint.config.js` wurden auf flat config umgestellt. Alte `.eslintrc` würden nicht mehr funktionieren.
2. **Template-Registry**: `spawn` unterstützt jetzt Array-Format `[x, y, z]` zusätzlich zu Objekt-Format. Rückwärtskompatibel, aber neue Templates sollten Array-Format verwenden.
3. **Physically Correct Lights**: Wird jetzt standardmäßig aktiviert. Kann bei älteren Assets zu unterschiedlichen Licht-Ergebnissen führen.

### 🔴 Fragile Stellen

1. **Decoder-Pfade**: Draco (`/libs/draco/`) und KTX2 (`/libs/basis/`) sind hardcoded. Wenn Decoder-Dateien fehlen, schlägt das Laden fehl (aber mit Fallback auf unkomprimierte Assets).
2. **VRM-Loader**: Dynamischer Import von `@pixiv/three-vrm` - wenn Package nicht installiert ist, wird Fehler geworfen (aber mit klarer Fehlermeldung).
3. **Template-Fallback**: Wenn `watt-eco` fehlt, wird auf `watt-default` zurückgegriffen. Wenn auch `watt-default` fehlt, wird Placeholder-Szene generiert (funktioniert, aber nicht ideal).

## Quick Wins (3-7 Punkte)

1. **Decoder-Ordner erstellen**: `apps/web/public/draco/` und `apps/web/public/ktx2/` existieren jetzt (leer). Decoder-Dateien müssen noch hinzugefügt werden, aber Struktur ist da.
2. **Physically Correct Lights**: Health-Report zeigt `physicallyCorrect: false`, aber Code setzt es korrekt. Health-Report muss aktualisiert werden.
3. **GLTF-Loader-Integration**: `createDraco()` und `createKTX2()` werden noch nicht in `TemplateHost` aufgerufen. Sollte in `createDefaultTemplateLoader()` integriert werden.
4. **Audio-Context-Resume**: ConsentModal für Voice existiert, aber Ambient-Audio braucht auch Click-to-Start (AudioContext.resume()). Sollte in `AmbientManager` oder `App.tsx` ergänzt werden.
5. **Debug-Overlay**: F12-Toggle funktioniert, aber Overlay wird nicht standardmäßig in `App.tsx` gerendert. Sollte optional hinzugefügt werden.
6. **Build-Warnung**: Three.js-Chunk ist >500KB. Sollte mit `manualChunks` optimiert werden (bereits in `vite.config.ts` teilweise vorhanden).
7. **ENV-Defaults**: `.env.local` wurde aus `.env.example` erstellt, aber Standard-Flags sollten noch geprüft werden.

## Follow-ups (Issues, die ich erstellen würde)

1. **Issue: Decoder-Dateien hinzufügen**
   - Draco-Decoder-Dateien in `apps/web/public/draco/` kopieren
   - KTX2-Basis-Transcoder in `apps/web/public/ktx2/` kopieren
   - Oder CDN-Links verwenden

2. **Issue: GLTF-Loader-Integration vervollständigen**
   - `createDraco()` und `createKTX2()` in `TemplateHost.createDefaultTemplateLoader()` aufrufen
   - GLTFLoader-Instanz erstellen und konfigurieren

3. **Issue: Audio-Context-Resume für Ambient-Audio**
   - Click-to-Start-Overlay für Ambient-Audio hinzufügen
   - `AudioContext.resume()` nach User-Interaction aufrufen

4. **Issue: Health-Report aktualisieren**
   - `physicallyCorrectLights`-Check korrigieren (prüft Property statt tatsächlichen Wert)

5. **Issue: Build-Optimierung**
   - Three.js-Chunk weiter aufteilen (z.B. Loader, Controls, Post-Processing)
   - Code-Splitting für Templates (dynamische Imports)

6. **Issue: Debug-Overlay in App integrieren**
   - Optionales Debug-Overlay in `App.tsx` rendern (Feature-Flag: `VITE_DEBUG_ENABLED`)

7. **Issue: Template-Asset-Validierung**
   - Asset-Existenz-Check beim Template-Load
   - Bessere Fehlermeldungen wenn Assets fehlen

8. **Issue: E2E-Tests erweitern**
   - LOD-Switching testen
   - Windrad-Rotation testen
   - Asset-Import-Script testen
