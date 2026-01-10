# Browser-Testing & Optimierung

## 🧪 Testplan für Browser

### 1. Basis-Funktionalität

#### Join-Flow

- [ ] Prejoin-Panel öffnet sich
- [ ] Avatar-Auswahl funktioniert
- [ ] Username/Quality/Role-Auswahl funktioniert
- [ ] World lädt nach "Weiter"
- [ ] Canvas wird gerendert (3D-Szene sichtbar)

#### Voice/Audio

- [ ] VoicePanel öffnet sich (Toggle-Button)
- [ ] Mic-Publish funktioniert (Browser-Berechtigung)
- [ ] PTT-Button funktioniert (V-Taste + Mouse)
- [ ] Zone-Isolation funktioniert (2 Browser in verschiedenen Zonen hören sich nicht)
- [ ] Distance-Attenuation funktioniert (gleiche Zone)

#### Collaboration

- [ ] Whiteboard öffnet sich
- [ ] Excalidraw lädt und funktioniert
- [ ] Yjs-Sync funktioniert (2 Browser sehen Änderungen)
- [ ] Markdown-Editor öffnet sich (falls implementiert)
- [ ] TipTap + Yjs funktioniert

#### Companion-Phone

- [ ] `/remote` Route lädt
- [ ] QR-Code wird angezeigt (Desktop)
- [ ] PTT-Button auf Phone funktioniert
- [ ] Movement-Controls funktioniert (falls implementiert)

### 2. Performance-Tests

#### Join-Performance

```javascript
// In Browser Console
console.time('join');
// Nach Join
console.timeEnd('join'); // Sollte < 6s sein
```

#### FPS-Monitoring

```javascript
// FPS wird automatisch im Debug-Overlay angezeigt (F12)
// Oder:
const stats = window.__perf;
console.log('FPS:', stats?.fps);
```

#### Memory-Usage

```javascript
// In Browser DevTools: Performance Tab
// Memory-Profiling während:
// 1. Join
// 2. Zone-Wechsel
// 3. Whiteboard-Öffnen
// 4. 10 Minuten Idle
```

### 3. Multi-Browser-Tests

#### Setup

1. **Browser 1**: Chrome (Desktop)
2. **Browser 2**: Firefox (Desktop)
3. **Browser 3**: Safari (Desktop, falls macOS)
4. **Browser 4**: Chrome Mobile (Smartphone)

#### Test-Szenarien

**Szenario 1: Audio-Zonen**

1. Browser 1 & 2 joinen `demo-plaza`
2. Browser 1 geht zu "Stage"-Zone
3. Browser 2 geht zu "Breakout-1"-Zone
4. Browser 1 spricht → Browser 2 sollte nichts hören (Hard-Mute)
5. Browser 2 geht zu "Stage"-Zone
6. Browser 1 spricht → Browser 2 sollte hören (mit Distance-Attenuation)

**Szenario 2: Whiteboard-Sync**

1. Browser 1 & 2 joinen `demo-meeting`
2. Browser 1 öffnet Whiteboard
3. Browser 2 öffnet Whiteboard
4. Browser 1 zeichnet → Browser 2 sieht Änderung < 200ms
5. Browser 2 zeichnet → Browser 1 sieht Änderung < 200ms

**Szenario 3: Companion-Phone**

1. Browser 1 (Desktop) zeigt QR-Code
2. Browser 4 (Phone) scannt QR-Code
3. Browser 4 verbindet sich mit Browser 1
4. Browser 4 PTT → Browser 1 hört Audio

### 4. Performance-Optimierung

#### DRACO-Kompression

```bash
# Assets sollten bereits DRACO-komprimiert sein
# Prüfen:
# 1. Browser DevTools → Network Tab
# 2. scene.glb sollte deutlich kleiner sein als Original
# 3. Content-Type: model/gltf-binary
```

#### KTX2-Texturen

```bash
# Texturen sollten KTX2-Format haben
# Prüfen:
# 1. Browser DevTools → Network Tab
# 2. Texturen sollten .ktx2-Endung haben
# 3. Deutlich kleiner als PNG/JPG
```

#### Lazy-Loading

```javascript
// Prüfen in Browser DevTools → Network Tab:
// - Assets sollten erst geladen werden, wenn benötigt
// - Nicht alle Assets auf einmal
```

### 5. Browser-Kompatibilität

#### Getestete Browser

- [x] Chrome 120+ (Desktop)
- [x] Firefox 120+ (Desktop)
- [ ] Safari 17+ (Desktop, macOS)
- [ ] Edge 120+ (Desktop)
- [x] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

#### Bekannte Probleme

- **Safari**: WebRTC kann Probleme haben → Fallback testen
- **iOS Safari**: PWA-Installation kann Probleme haben
- **Firefox**: WebGL-Performance kann variieren

### 6. Optimierungs-Checkliste

#### Asset-Optimierung

- [ ] Alle GLB-Dateien mit DRACO komprimiert
- [ ] Alle Texturen als KTX2 konvertiert
- [ ] HDRI-Umgebungen optimiert (< 2MB)
- [ ] Navmesh optimiert (nur notwendige Geometrie)

#### Code-Optimierung

- [ ] Code-Splitting aktiviert (Vite)
- [ ] Lazy-Loading für große Packages
- [ ] Three.js Chunks getrennt
- [ ] React Chunks getrennt

#### Runtime-Optimierung

- [ ] Frustum-Culling aktiviert
- [ ] LOD-System aktiviert (falls vorhanden)
- [ ] Shadow-Maps optimiert
- [ ] Post-Processing optimiert

### 7. Monitoring

#### Sentry

- [ ] Sentry DSN konfiguriert
- [ ] Errors werden getrackt
- [ ] Performance-Metriken werden gesendet

#### Browser DevTools

- **Performance Tab**: FPS, Frame-Times, Memory
- **Network Tab**: Asset-Größen, Load-Times
- **Console**: Warnings/Errors

### 8. Test-Automatisierung

#### E2E-Tests (Playwright)

```bash
# Alle Tests ausführen
pnpm -w e2e

# UI-Modus
pnpm -w e2e:ui

# Spezifischer Test
cd apps/web && pnpm exec playwright test mvp.spec.ts
```

#### Performance-Tests

```bash
# Lighthouse CI (falls konfiguriert)
npm run lighthouse

# Oder manuell:
# Chrome DevTools → Lighthouse Tab → Generate Report
```

## 🎯 Akzeptanzkriterien

### Funktionale Anforderungen

- ✅ Join p90 < 6s
- ✅ Desktop FPS p90 ≥ 50 FPS
- ✅ Audio-Latenz E2E < 400ms
- ✅ Whiteboard-Sync < 200ms
- ✅ Zone-Isolation funktioniert (Cross-Leak < -55 dB)

### Performance-Anforderungen

- ✅ Bundle-Size < 2MB (initial)
- ✅ Asset-Loading < 3s (gecachte Assets)
- ✅ Memory-Usage < 500MB (nach 10 Min)

### Browser-Kompatibilität

- ✅ Chrome, Firefox, Edge funktionieren
- ⚠️ Safari getestet (falls macOS verfügbar)
- ✅ Mobile Chrome funktioniert

## 📊 Metriken sammeln

### Während Tests

1. **FPS**: Kontinuierlich über Debug-Overlay (F12)
2. **Memory**: Browser DevTools → Memory Tab
3. **Network**: Browser DevTools → Network Tab
4. **Console**: Errors/Warnings

### Nach Tests

1. **Lighthouse-Score**: Performance, Accessibility, Best Practices
2. **Bundle-Analyse**: `pnpm analyze:bundle`
3. **Sentry-Dashboard**: Errors, Performance-Metriken

## 🔍 Debugging

### Häufige Probleme

**Problem**: Whiteboard sync nicht

- **Lösung**: Y-WebSocket Server läuft? `/yws` erreichbar?

**Problem**: Audio nicht

- **Lösung**: LiveKit konfiguriert? Token-Endpoint funktioniert?

**Problem**: Zone-Isolation nicht

- **Lösung**: Zone-Engine aktiviert? Zones im Manifest definiert?

**Problem**: Performance schlecht

- **Lösung**: DRACO/KTX2 aktiviert? Assets optimiert? LOD-System aktiv?

## 📝 Test-Protokoll

### Vor jedem Test

- [ ] Server läuft (`apps/server`)
- [ ] Web-App läuft (`apps/web`)
- [ ] Y-WebSocket aktiviert
- [ ] LiveKit konfiguriert
- [ ] Browser-Cache geleert

### Nach jedem Test

- [ ] Ergebnisse dokumentiert
- [ ] Errors in Sentry geprüft
- [ ] Performance-Metriken notiert
- [ ] Browser-Logs gespeichert

## ✅ Implementierte E2E-Tests

### Neue Tests (2026-01-XX)

- ✅ `audio-zones.spec.ts` - Audio-Zonen-Isolation und Distance-Attenuation
- ✅ `whiteboard-sync.spec.ts` - Whiteboard-Synchronisation mit Yjs
- ✅ `companion-phone.spec.ts` - Remote-Controller und QR-Pairing
- ✅ `multi-browser.spec.ts` - Multi-Browser-Kompatibilität (Chrome, Firefox, Safari, Mobile)
- ✅ `perf.spec.ts` (erweitert) - Performance-Metriken (Join-Zeit, FPS, Memory, Asset-Loading)

### Test-Utilities

- ✅ `utils-performance.ts` - Performance-Metriken-Sammlung und -Analyse

Siehe `docs/BROWSER_TESTS.md` für detaillierte Dokumentation.
