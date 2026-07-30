# Nächste Schritte - Aktionsplan

**Erstellt:** 2025-01-22  
**Status:** Nach Full Audit & PR Merge

## ✅ Abgeschlossen

- Full Audit durchgeführt
- Alle Phasen (0-5) validiert
- PR #1 erfolgreich gemergt
- CI/CD Pipeline konfiguriert
- Tests: Server-Integration (6/6) + E2E vorhanden

## 🎯 Priorisierte Nächste Schritte

### SOFORT (Heute)

#### 1. CI/CD Pipeline validieren

- [ ] GitHub Actions Workflow Status prüfen
  ```bash
  gh run list --workflow=CI --limit 5
  ```
- [ ] Sicherstellen, dass alle Tests grün sind
- [ ] Bei Fehlern: Logs analysieren und fixen

#### 2. Production Build testen

- [ ] Production Build erstellen
  ```bash
  pnpm build
  ```
- [ ] Lokalen Production-Server starten
  ```bash
  cd apps/web && npx serve dist
  ```
- [ ] Production-Build manuell testen
  - Canvas rendert korrekt
  - Keine Console-Errors
  - Alle Features funktionieren

#### 3. Manuelle Feature-Validierung

- [ ] **Multiplayer**
  - 2 Browser-Tabs öffnen
  - Beide zu `?room=test-123` navigieren
  - Avatare sollten sich gegenseitig sehen
  - Transform-Synchronisation testen

- [ ] **Voice**
  - Consent-Modal erscheint
  - Mic-Toggle funktioniert
  - Mute/Unmute testen

- [ ] **XR**
  - WebXR-Button erscheint (falls Browser unterstützt)
  - VR-Modus aktivieren (falls Headset vorhanden)

- [ ] **Template-Switching**
  - Debug-Overlay öffnen (F12)
  - Template wechseln: watt-default <-> watt-eco
  - Hot-Swap sollte funktionieren

- [ ] **Debug-Overlay**
  - F12-Toggle testen
  - FPS-Anzeige prüfen
  - Exposure-Slider testen

### KURZFRISTIG (Diese Woche)

#### 4. Performance-Benchmarks

- [ ] **Desktop FPS-Messung**
  - Ziel: 60fps stabil
  - Verschiedene Szenarien testen
  - FPS-Monitoring in Debug-Overlay nutzen

- [ ] **Mobile FPS-Messung**
  - Ziel: 40fps stabil
  - Mobile Device oder Browser DevTools verwenden
  - Performance-Profil erstellen

- [ ] **Bundle-Size validieren**
  - Aktuell: ~294 KB (gzip) ✅
  - Regelmäßig prüfen
  - Asset-Budget einhalten (GLB ≤ 10-20 MB)

#### 5. Load-Tests für Multiplayer

- [ ] **10+ gleichzeitige Clients simulieren**
  - Locust oder k6 verwenden
  - Socket.io-Verbindungen simulieren
  - Transform-Updates senden

- [ ] **Server-Performance unter Last**
  - CPU-Auslastung messen
  - Memory-Verbrauch prüfen
  - Latenz messen

- [ ] **Memory-Leaks prüfen**
  - Längere Sessions testen
  - Memory-Profiling durchführen
  - Cleanup-Mechanismen validieren

#### 6. Deployment-Vorbereitung

- [ ] **Production Environment-Variablen definieren**

  ```env
  VITE_TEMPLATE_ID=watt-eco
  VITE_MULTIPLAYER_ENABLED=true
  VITE_XR_ENABLED=true
  VITE_VOICE_ENABLED=false
  VITE_DEBUG_ENABLED=false
  VITE_NET_URL=https://realtime.wattwelten.de
  ```

- [ ] **Deployment-Strategie finalisieren**
  - Web: Vercel/Netlify/S3+CloudFront
  - Server: Railway/Render/Fly.io
  - DNS-Konfiguration
  - HTTPS-Zertifikate

- [ ] **Asset-Budget prüfen**
  - GLB-Dateien: ≤ 10-20 MB gesamt
  - KTX2/Draco-Compression validieren
  - LOD-System testen

### MITTELFRISTIG (Nächste 2-4 Wochen)

#### 7. VerseEngine-Integration vervollständigen

- [ ] VerseEngine SDK integrieren
- [ ] Adapter von Stub zu vollständiger Implementation
- [ ] Tests erweitern

#### 8. Avatar-Animationen erweitern

- [ ] Walk-Animation (bereits vorhanden: Velocity-basiert)
- [ ] Idle-Animation
- [ ] Emotes-System
- [ ] IK-System für bessere Animationen

#### 9. VRM-UI für Avatar-Auswahl

- [ ] Avatar-Auswahl-UI erstellen
- [ ] VRM-Modelle laden
- [ ] Avatar-Preview
- [ ] Avatar-Speicherung

#### 10. Template-Editor mit Gizmos

- [ ] Editor-UI erstellen
- [ ] Gizmos für Position/Rotation/Scale
- [ ] Template-Speicherung
- [ ] Hot-Reload im Editor

### LANGFRISTIG (3+ Monate)

#### 11. Vollständige Strapi-Integration

- [ ] StrapiProvider vollständig implementieren
- [ ] Content-Sync
- [ ] Template-Management über CMS

#### 12. Multi-Region Server-Setup

- [ ] Server in mehreren Regionen deployen
- [ ] Load-Balancing
- [ ] Region-basierte Room-Zuweisung

#### 13. CDN-Integration für Assets

- [ ] Assets auf CDN hosten
- [ ] KTX2/Draco-Decoder über CDN
- [ ] Cache-Strategie optimieren

#### 14. Progressive Web App (PWA) Support

- [ ] Service Worker
- [ ] Offline-Support
- [ ] App-Manifest
- [ ] Install-Prompt

## 📊 Aktuelle Metriken

### Code-Qualität

- TypeScript: ✅ Strict Mode
- Tests: ✅ Server-Integration (6/6) + E2E
- CI/CD: ✅ Konfiguriert
- Build: ✅ Erfolgreich

### Performance

- Bundle-Size: ~294 KB (gzip) ✅
- Code-Splitting: ✅ Funktioniert
- FPS-Monitoring: ✅ Implementiert

### Features

- Multiplayer: ✅ Implementiert (flag-gesteuert)
- Voice: ✅ Implementiert (flag-gesteuert)
- XR: ✅ Implementiert (Three.js WebXR)
- Avatare: ✅ Basis-Synchronisation
- Ambient Audio: ✅ Template-basiert

## 🚀 Quick Start für heute

```bash
# 1. CI/CD Status prüfen
gh run list --workflow=CI --limit 5

# 2. Production Build
pnpm build

# 3. Dev-Server starten
pnpm dev:all

# 4. Tests ausführen
pnpm test
pnpm e2e

# 5. Health-Report generieren
pnpm exec tsx scripts/health.ts
```

## 📝 Notizen

- Alle Features sind flag-gesteuert → können einzeln aktiviert/deaktiviert werden
- Solo-Modus funktioniert ohne Server
- Fallback-Mechanismen vorhanden (kein schwarzer Screen)
- Dokumentation: `docs/PLAN_SOURCE_OF_TRUTH.md` (Version 2.0)
