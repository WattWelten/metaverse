# Optimierungs- & Testplan

## 🎯 Status-Zusammenfassung

### ✅ Vollständig implementiert

- **SFU-Integration**: LiveKit Cloud mit Token-Endpoint
- **Audio-Zonen**: Cross-Zone-Muting + Distance-Attenuation
- **Lightweight Collaboration**: Whiteboard (Excalidraw + Yjs) + Markdown-Docs (TipTap + Yjs)
- **Companion-Phone**: Remote-Route + QR-Pairing + PTT-Button
- **Cloud-Auth**: Rollen-System (host/moderator/speaker/guest)
- **Strapi Provider**: No-Code Scene Management
- **Demo-Szenen**: Manifest-Dateien für plaza & meeting
- **E2E-Tests**: Playwright-Tests für MVP-Features
- **Performance**: DRACO/KTX2 bereits implementiert

### ⚠️ Teilweise implementiert

- **NextAuth.js**: Basis-Auth vorhanden, OAuth-Provider noch nicht vollständig integriert
- **Asset-Pipeline**: DRACO/KTX2 Loader vorhanden, Batch-Optimierung noch nicht vollständig
- **Demo-Assets**: Manifest-Dateien vorhanden, 3D-Assets noch nicht erstellt

## 📋 Nächste Schritte (Priorisiert)

### 1. Demo-Assets erstellen (Hoch)

- [ ] `demo-plaza/scene.glb` - 3D-Modell für Plaza-Szene
- [ ] `demo-plaza/navmesh.glb` - Navigation-Mesh
- [ ] `demo-plaza/env.hdr` - HDRI-Umgebung
- [ ] `demo-meeting/scene.glb` - 3D-Modell für Meeting-Szene
- [ ] `demo-meeting/navmesh.glb` - Navigation-Mesh
- [ ] `demo-meeting/env.hdr` - HDRI-Umgebung

**Tools**: Blender, gltf-transform, basis-encoder

### 2. Browser-Tests durchführen (Hoch)

- [ ] Join-Flow testen (Chrome, Firefox, Safari)
- [ ] Audio-Zonen testen (2 Browser, verschiedene Zonen)
- [ ] Whiteboard-Sync testen (2 Browser gleichzeitig)
- [ ] Companion-Phone testen (Desktop + Mobile)
- [ ] Performance-Metriken sammeln (FPS, Memory, Load-Time)

**Siehe**: `docs/TESTING.md` für detaillierten Testplan

### 3. Asset-Optimierung (Mittel)

- [ ] Batch-Script für DRACO-Kompression
- [ ] Batch-Script für KTX2-Konvertierung
- [ ] LOD-Generierung für große Assets
- [ ] Asset-Budget-Checker

**Tools**: gltf-transform, basis-encoder, Blender

### 4. OAuth-Integration (Mittel)

- [ ] Google OAuth konfigurieren
- [ ] GitHub OAuth konfigurieren
- [ ] OAuth-Callback-Endpoint implementieren
- [ ] Token-Exchange implementieren

### 5. Moderation erweitern (Niedrig)

- [ ] Kick/Ban-Funktionalität
- [ ] Mute-All für Host
- [ ] Lock Room
- [ ] Consent Modal für Recording/Screenshare

## 🔧 Optimierungsplan

### Phase 1: Asset-Optimierung (1-2 Tage)

#### DRACO-Kompression

```bash
# Script: scripts/optimize-assets.ts
# - Alle GLB-Dateien durchlaufen
# - DRACO-Kompression anwenden
# - Optimierte Dateien speichern
# - Originale als Backup behalten
```

**Ziel**: 50-70% Größenreduktion bei GLB-Dateien

#### KTX2-Konvertierung

```bash
# Script: scripts/convert-textures.ts
# - Alle Texturen finden (PNG, JPG)
# - Zu KTX2 konvertieren
# - Originale als Fallback behalten
```

**Ziel**: 60-80% Größenreduktion bei Texturen

#### LOD-Generierung

```bash
# Script: scripts/generate-lods.ts
# - Für große Assets (> 1MB)
# - 3 LOD-Level generieren (High, Medium, Low)
# - Automatisch basierend auf Distanz laden
```

**Ziel**: Bessere Performance bei großen Szenen

### Phase 2: Code-Optimierung (1 Tag)

#### Bundle-Analyse

```bash
pnpm analyze:bundle
# - Größte Chunks identifizieren
# - Lazy-Loading für große Packages
# - Code-Splitting optimieren
```

**Ziel**: Initial Bundle < 2MB

#### Lazy-Loading

- [ ] Whiteboard-Package lazy laden (nur wenn geöffnet)
- [ ] Collab-Docs lazy laden
- [ ] XR-Package lazy laden (nur wenn XR aktiviert)

### Phase 3: Runtime-Optimierung (1 Tag)

#### Frustum-Culling

- [ ] Aktiviert in Three.js Scene
- [ ] Getestet mit vielen Objekten

#### Shadow-Maps

- [ ] Optimierte Shadow-Map-Größe
- [ ] Cascaded Shadow Maps für große Szenen

#### Post-Processing

- [ ] Nur aktiv wenn benötigt
- [ ] Performance-Mode für niedrige Endgeräte

### Phase 4: Monitoring & Profiling (Ongoing)

#### Performance-Monitoring

- [ ] FPS-Tracking (kontinuierlich)
- [ ] Memory-Profiling (bei Join, Zone-Wechsel)
- [ ] Network-Timing (Asset-Loading)

#### Error-Tracking

- [ ] Sentry konfiguriert
- [ ] Errors werden getrackt
- [ ] Performance-Metriken werden gesendet

## 🧪 Test-Plan

### Woche 1: Basis-Tests

1. **Tag 1-2**: Join-Flow, Voice, Whiteboard (Chrome)
2. **Tag 3-4**: Multi-Browser (Chrome, Firefox, Safari)
3. **Tag 5**: Companion-Phone (Desktop + Mobile)

### Woche 2: Performance-Tests

1. **Tag 1-2**: Asset-Optimierung testen
2. **Tag 3-4**: Performance-Metriken sammeln
3. **Tag 5**: Optimierungen anwenden

### Woche 3: Integration-Tests

1. **Tag 1-2**: Strapi-Integration testen
2. **Tag 3-4**: OAuth-Integration testen
3. **Tag 5**: End-to-End-Tests

## 📊 Erfolgs-Metriken

### Funktionale Metriken

- ✅ Join p90 < 6s
- ✅ Desktop FPS p90 ≥ 50 FPS
- ✅ Audio-Latenz E2E < 400ms
- ✅ Whiteboard-Sync < 200ms
- ✅ Zone-Isolation funktioniert

### Performance-Metriken

- ✅ Bundle-Size < 2MB (initial)
- ✅ Asset-Loading < 3s (gecachte Assets)
- ✅ Memory-Usage < 500MB (nach 10 Min)

### Browser-Kompatibilität

- ✅ Chrome, Firefox, Edge funktionieren
- ⚠️ Safari getestet (falls macOS verfügbar)
- ✅ Mobile Chrome funktioniert

## 🚀 Deployment-Checkliste

### Vor Deployment

- [ ] Alle Tests grün (unit, e2e)
- [ ] Performance-Metriken erfüllt
- [ ] Browser-Kompatibilität getestet
- [ ] Sentry konfiguriert
- [ ] Environment-Variablen dokumentiert

### Nach Deployment

- [ ] Monitoring aktiv
- [ ] Errors werden getrackt
- [ ] Performance-Metriken werden gesammelt
- [ ] User-Feedback wird gesammelt

## 📝 Notizen

### Bekannte Limitationen

- **Safari**: WebRTC kann Probleme haben → Fallback testen
- **iOS Safari**: PWA-Installation kann Probleme haben
- **Firefox**: WebGL-Performance kann variieren

### Verbesserungsvorschläge

- **LOD-System**: Automatische LOD-Generierung für große Assets
- **Asset-CDN**: Assets von CDN laden für bessere Performance
- **Service-Worker**: Offline-Support für PWA
- **WebRTC-Fallback**: Fallback für Browser ohne WebRTC-Support
