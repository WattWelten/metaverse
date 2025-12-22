# E2E Test Report

Generiert: 2025-12-21

## Verfügbare E2E-Tests

### 1. Basic Tests (`basic.spec.ts`)

- ✅ Page Load Test
- ✅ Canvas Rendering Test

### 2. Multiplayer Integration (`multiplayer.spec.ts`)

- ✅ Server Connection Test
- ✅ Room Join Test (mit Heartbeat)
- ✅ Server Disconnect Handling
- ✅ Player Count in HUD

### 3. Voice Integration (`voice.spec.ts`)

- ✅ Consent Modal Display
- ✅ Voice Enable after Consent
- ✅ Permission Denial Handling
- ✅ Spatial Audio Listener Position

### 4. Avatar Synchronisation (`avatar-sync.spec.ts`)

- ✅ Local Avatar Creation
- ✅ Avatar Position Updates
- ✅ Remote Avatar Updates
- ✅ Avatar Loading Error Handling

### 5. Template Switching (`template-load.spec.ts`)

- ✅ Rapid Template Switching
- ✅ Template Switch during Multiplayer
- ✅ State Maintenance across Switches
- ✅ Missing Template Assets Handling
- ✅ Template Switch with Ambient Audio (mit Heartbeat)

### 6. Audio Context (`audio-context.spec.ts`)

- ✅ Audio Context Resume on Click

### 7. Debug Overlay (`debug-overlay.spec.ts`)

- ✅ F12 Toggle
- ✅ Debug Overlay Visibility

## Test-Ausführung

### Mit Progress-Updates

```bash
pnpm e2e:progress
```

### Standard

```bash
pnpm e2e
```

### Einzelne Test-Datei

```bash
cd apps/web
pnpm playwright test e2e/basic.spec.ts
```

## Heartbeat-Integration

Lange Tests verwenden Heartbeat für regelmäßige Updates:

- `multiplayer.spec.ts` - "joins default room" (5 Min Updates)
- `template-load.spec.ts` - "switches templates with ambient audio" (5 Min Updates)

## Test-Konfiguration

- **Timeout**: 60 Sekunden pro Test
- **Assertion Timeout**: 10 Sekunden
- **Retries**: 2 in CI, 0 lokal
- **Workers**: 1 in CI, parallel lokal
- **Web Server**: Auto-Start mit `pnpm dev`

## Bekannte Probleme

### Server-Abhängigkeit

- Multiplayer-Tests benötigen laufenden Server auf Port 3001
- Fallback zu Solo-Modus wird getestet

### Browser-Permissions

- Voice-Tests können fehlschlagen wenn Mic-Zugriff verweigert wird
- Tests sind darauf vorbereitet (graceful handling)

## Nächste Schritte

- [ ] Test-Coverage erweitern
- [ ] Performance-Tests hinzufügen
- [ ] Visual Regression Tests
- [ ] Cross-Browser Tests (Firefox, Safari)
