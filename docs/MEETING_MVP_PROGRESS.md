# Meeting-MVP Hardening v2 - Fortschritt

## Status: In Arbeit

### ✅ Abgeschlossen

#### Phase 0: Basis & Flags

- ✅ `.env.example` ergänzt mit:
  - `VITE_AVATURN_ENABLED=false`
  - `VITE_AUDIO_TEST_MODE=false`
  - Defaults: `MULTIPLAYER_ENABLED=false`, `VOICE_ENABLED=false`
- ✅ TASK_LOG.md Eintrag erstellt

#### Phase 1: Deps & DX

- ✅ RPM-Warnung nur 1×/Session (`window.__rpmWarned`)
- ✅ Vite-Config: simple-peer Alias hinzugefügt

#### Phase 2: Template "Watt Eco"

- ✅ Zonen umbenannt: `groupA` → `breakoutA`, `groupB` → `breakoutB`
- ✅ `bounds` hinzugefügt: `[{shape: 'circle', pos: [0,0,0], r: 42}]`

### 🚧 In Arbeit / Noch zu tun

#### Phase 3: Avatare

- ⏳ Avatar-Presets (capsule.glb + Picker)
- ⏳ Avaturn-Stub (iframe-Modal)
- ⏳ Mixamo-Animationen (Idle/Walk/Run/Turn)
- ⏳ Idle-Fallback (bereits vorhanden, prüfen)

#### Phase 4: Steuerung, Pointer-Lock, Mobile

- ⏳ Mobile Controls (On-screen Joystick)
- ⏳ PixelRatio-Clamp für Mobile
- ⏳ Pointer-Lock Robustheit (bereits vorhanden, prüfen)

#### Phase 5: Voice lokal + Spatial Audio

- ⏳ TestToneProvider
- ⏳ HRTF PannerNode für Spatial Audio
- ⏳ Zonen-Gain Integration
- ⏳ Device-Picker im Pre-Join

#### Phase 6: Whiteboard Lite

- ⏳ Canvas-basiertes Whiteboard
- ⏳ Y.js Sync
- ⏳ PNG-Export

#### Phase 7: UI/UX

- ⏳ Pre-Join Wizard (DE) mit 4 Steps
- ⏳ Topbar (Links: Copy Link, Template, FPS | Players)
- ⏳ HUD: Zonen-Badge
- ⏳ Design-Tokens (WattWeiser-Brand)

#### Phase 8: E2E-Tests

- ⏳ Seating-Test (`seating.spec.ts`)
- ⏳ Zonen-Gain-Test (`zone-gain.spec.ts`)
- ⏳ Mobile-Smoke-Test (`mobile.spec.ts`)

#### Phase 9: CI & Deploy

- ⏳ GitHub Actions Workflow (`.github/workflows/e2e.yml`)
- ⏳ Dockerfile für Coolify/Hetzner
- ⏳ docker-compose.yml

#### Phase 10: Dokumentation

- ⏳ README.md aktualisieren
- ⏳ TASK_LOG.md finalisieren

## Nächste Schritte

1. **Priorität 1**: Avatar-Presets + Avaturn-Stub
2. **Priorität 2**: Spatial Audio (HRTF + Zonen-Gain)
3. **Priorität 3**: Mobile Controls
4. **Priorität 4**: E2E-Tests erweitern
5. **Priorität 5**: CI/CD Setup

## Hinweise

- Alle Änderungen sind idempotent
- Feature-Flags respektieren
- Keine Breaking Changes
- Fallbacks für Offline/Solo-Modus
