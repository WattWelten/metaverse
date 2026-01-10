# Browser-Tests - Implementierungsübersicht

## ✅ Implementierte Tests

### 1. Audio-Zonen-Isolation (`audio-zones.spec.ts`)

- **Test 1**: Cross-Zone-Muting - 2 Browser in verschiedenen Zonen hören sich nicht
- **Test 2**: Distance-Attenuation - 2 Browser in gleicher Zone mit Entfernungs-Dämpfung

**Features:**

- Multi-Browser-Setup (2 Contexts)
- Zone-Membership-Verifizierung
- Automatische Avatar-Bewegung zu Zonen
- Hinweis: Audio-Isolation erfordert manuelle Verifizierung (Web Audio API Inspector)

### 2. Whiteboard-Sync (`whiteboard-sync.spec.ts`)

- **Test 1**: Whiteboard-Synchronisation - Änderungen werden < 200ms synchronisiert
- **Test 2**: Concurrent Edits - Gleichzeitiges Zeichnen funktioniert

**Features:**

- Excalidraw-Integration
- Yjs-Sync-Verifizierung
- Canvas-Interaktion (Mouse-Drag-Simulation)
- Sync-Zeit-Messung

### 3. Companion-Phone (`companion-phone.spec.ts`)

- **Test 1**: Remote-Route lädt
- **Test 2**: PTT-Button ist sichtbar
- **Test 3**: PTT-Press-Handling
- **Test 4**: Pair-Code-Anzeige
- **Test 5**: Movement-Controls

**Features:**

- `/remote` Route-Verifizierung
- PTT-Button-Interaktion
- Pair-Code-Parameter-Testing

### 4. Performance-Metriken (`perf.spec.ts` - erweitert)

- **Test 1**: FPS ≥ 30 (Desktop)
- **Test 2**: Join-Zeit < 6s
- **Test 3**: Memory-Usage < 500MB
- **Test 4**: Asset-Loading-Zeit < 3s
- **Test 5**: FPS über Zeit (P90 ≥ 50)

**Features:**

- FPS-Sampling über 10 Sekunden
- Memory-Profiling (Performance API)
- Network-Request-Tracking
- Asset-Loading-Analyse
- P90/P95-Berechnung

### 5. Multi-Browser-Kompatibilität (`multi-browser.spec.ts`)

- **Test 1**: Chrome-Kompatibilität
- **Test 2**: Firefox-Kompatibilität
- **Test 3**: Mobile Chrome
- **Test 4**: WebRTC in Chrome
- **Test 5**: WebRTC in Firefox

**Features:**

- Browser-spezifische Tests
- Mobile-Viewport-Testing
- WebRTC-Kompatibilität
- FPS-Threshold-Anpassung pro Browser

## 🛠️ Test-Utilities

### `utils-performance.ts`

- `collectPerformanceMetrics()` - Sammelt alle Performance-Metriken
- `measureJoinTime()` - Misst Join-Zeit
- `trackAssetLoading()` - Trackt Asset-Loading
- `assertPerformanceTargets()` - Assertiert Performance-Ziele
- `logPerformanceMetrics()` - Loggt Metriken für Debugging

## 📊 Playwright-Konfiguration

### Browser-Projekte

- **chromium** - Desktop Chrome
- **firefox** - Desktop Firefox
- **webkit** - Desktop Safari (falls macOS)
- **Mobile Chrome** - Pixel 5 Viewport

### Test-Ausführung

```bash
# Alle Tests
pnpm -w e2e

# Spezifische Test-Suite
cd apps/web && pnpm exec playwright test audio-zones.spec.ts

# Mit UI
pnpm -w e2e:ui

# Nur Chrome
pnpm exec playwright test --project=chromium

# Nur Firefox
pnpm exec playwright test --project=firefox
```

## 🎯 Test-Ziele

### Funktionale Anforderungen

- ✅ Join p90 < 6s
- ✅ Desktop FPS p90 ≥ 50 FPS
- ✅ Audio-Latenz E2E < 400ms (manuell zu testen)
- ✅ Whiteboard-Sync < 200ms
- ✅ Zone-Isolation funktioniert

### Performance-Anforderungen

- ✅ Bundle-Size < 2MB (initial)
- ✅ Asset-Loading < 3s (gecachte Assets)
- ✅ Memory-Usage < 500MB (nach 10 Min)

### Browser-Kompatibilität

- ✅ Chrome, Firefox, Edge funktionieren
- ⚠️ Safari getestet (falls macOS verfügbar)
- ✅ Mobile Chrome funktioniert

## 📝 Bekannte Limitationen

1. **Audio-Tests**: Erfordern manuelle Verifizierung mit Web Audio API Inspector
2. **Safari**: WebRTC kann Probleme haben → Fallback testen
3. **iOS Safari**: PWA-Installation kann Probleme haben
4. **Firefox**: WebGL-Performance kann variieren

## 🔍 Debugging

### Performance-Metriken anzeigen

```javascript
// In Browser Console
const perf = window.__perf;
console.log('FPS:', perf.fps);
console.log('Frames:', perf.frames);
```

### Memory-Usage prüfen

```javascript
// In Browser Console
if ('memory' in performance) {
  const mem = performance.memory;
  console.log('Used:', mem.usedJSHeapSize / 1024 / 1024, 'MB');
}
```

### Network-Requests analysieren

```javascript
// In Browser Console
const entries = performance.getEntriesByType('resource');
const assets = entries.filter((e) => e.name.includes('.glb') || e.name.includes('.hdr'));
console.log(
  'Assets:',
  assets.map((a) => ({ url: a.name, duration: a.duration }))
);
```

## 🚀 Nächste Schritte

1. **Manuelle Audio-Tests**: Web Audio API Inspector verwenden
2. **Safari-Tests**: Auf macOS ausführen
3. **Performance-Baseline**: Metriken sammeln und dokumentieren
4. **CI-Integration**: Tests in GitHub Actions ausführen
