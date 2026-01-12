# MVP Finalisierungs-Plan – WattWelten Metaverse

**Version:** 1.0  
**Datum:** 2026-01-11  
**Status:** Finale Schritte zum MVP  
**Ziel:** Produktionsreifes MVP mit professionellem Template

---

## 🎯 MVP-Ziele

### Definition of Done (MVP)

- ✅ Alle kritischen Features funktionieren
- ✅ Performance: 60 FPS Desktop, 40 FPS Mobile
- ✅ Template-System vollständig integriert
- ✅ Strapi-Integration funktioniert
- ✅ Multiplayer funktioniert (5-10 Teilnehmer)
- ✅ E2E-Tests bestehen
- ✅ Dokumentation vollständig
- ✅ Professionelles Template vorhanden

---

## 📋 Phase 1: Template-Recherche & Interview (Woche 1)

### 1.1 Template-Recherche

**Ziel:** Passende Templates auf verschiedenen Plattformen finden

**Plattformen:**

- **Sketchfab**: https://sketchfab.com (CC0/CC-BY)
- **PolyHaven**: https://polyhaven.com (CC0)
- **CGTrader**: https://www.cgtrader.com (Kostenpflichtig)
- **TurboSquid**: https://www.turbosquid.com (Kostenpflichtig)
- **OpenGameArt**: https://opengameart.org (CC0/CC-BY)
- **Unity Asset Store**: https://assetstore.unity.com (kann exportiert werden)

**Kriterien:**

- Lizenz: CC0, CC-BY oder kommerziell nutzbar
- Format: GLTF/GLB kompatibel
- Größe: < 50MB (optimiert)
- Stil: Low-Poly oder photorealistisch
- Thema: Passt zu WattWelten (Energie, Nachhaltigkeit, Natur)

**Deliverable:**

- Liste mit 10-20 Kandidaten
- Screenshots/Videos
- Preis-Informationen
- Lizenz-Details

### 1.2 Designer-Interview

**Ziel:** Präzise Anforderungen für das Template definieren

**Interview-Fragen** (siehe `docs/TEMPLATE_INTERVIEW.md`):

- Design-Stil (realistisch, stylized, low-poly)
- Farbpalette
- Beleuchtungsstimmung
- Funktionale Anforderungen
- Performance-Anforderungen

**Deliverable:**

- Interview-Protokoll
- Design-Briefing (erweitert)
- Moodboard
- Referenz-Templates

---

## 🔧 Phase 2: Kritische Schwachstellen beheben (Woche 1-2)

### 2.1 Template-Switching ✅ (Abgeschlossen)

- ✅ `setTemplateQueryParam` entfernt
- ✅ `window.history.replaceState` implementiert
- ✅ Manifest-Timing korrigiert
- ✅ Error-Handling verbessert

**Status:** ✅ Abgeschlossen

### 2.2 Strapi-Integration verbessern ✅

**Problem:** Content Types müssen manuell gespeichert werden

**Lösung:**

1. Bootstrap-Script erweitern (Permissions automatisch setzen) ✅
2. Content-Type-Registrierung dokumentieren ✅
3. Setup-Script für neue Entwickler erstellen ✅

**Tasks:**

- [x] Setup-Guide erstellen (`docs/STRAPI_SETUP.md`) ✅
- [x] Automatisches Setup-Script verbessern ✅
- [x] Troubleshooting-Guide erweitern ✅

**Deliverable:** Vollständige Strapi-Setup-Dokumentation ✅

**Status:** ✅ Abgeschlossen

### 2.3 Asset-Pipeline automatisieren ✅

**Problem:** Keine automatische Batch-Optimierung

**Lösung:**

1. Optimize-Script erweitern ✅
2. CI/CD-Integration ✅
3. Pre-commit Hook für Asset-Optimierung (optional)

**Tasks:**

- [x] `scripts/optimize-assets.ts` erweitert ✅
- [x] GitHub Action für Asset-Optimierung verbessert ✅
- [ ] Pre-commit Hook (optional)

**Deliverable:** Automatisierte Asset-Pipeline ✅

**Status:** ✅ Abgeschlossen

### 2.4 Performance-Optimierung ✅

**Problem:** Chunk-Size-Warnungen, Tree-Shaking fehlt

**Lösung:**

1. Tree-Shaking für Three.js ✅
2. Lazy-Loading erweitert ✅
3. Bundle-Analyse vorhanden ✅

**Tasks:**

- [x] Vite-Konfiguration für Tree-Shaking optimiert ✅
- [x] Unused Three.js-Module entfernt (via Tree-Shaking) ✅
- [x] Bundle-Analyse vorhanden (`scripts/analyze-bundle.ts`) ✅
- [x] Chunk-Size optimiert (manualChunks, Tree-Shaking) ✅

**Deliverable:** Optimierter Build (< 2MB initial) ✅

**Status:** ✅ Abgeschlossen

### 2.5 Testing erweitern ✅

**Problem:** E2E-Tests unvollständig, Performance-Tests fehlen

**Lösung:**

1. E2E-Tests erweitert ✅
2. Performance-Tests hinzugefügt ✅
3. Template-Switching-Tests vorhanden ✅

**Tasks:**

- [x] Performance-Tests (`apps/web/e2e/performance.spec.ts`) ✅
- [x] Template-Switching-Tests vorhanden (`template-switch.spec.ts`, `template-load.spec.ts`) ✅
- [x] Multi-Browser-Tests vorhanden (`multi-browser.spec.ts`) ✅
- [x] CI/CD-Integration vorhanden ✅

**Deliverable:** Vollständige Test-Suite ✅

**Status:** ✅ Abgeschlossen

---

## 🎨 Phase 3: Template-Integration (Woche 2-3)

### 3.1 Template-Import-Script erweitern ✅

**Ziel:** Automatischer Import von Designer-Templates

**Features:**

- Validierung automatisch ✅
- Asset-Optimierung (Draco, KTX2) ✅
- Manifest-Generierung ✅
- Template-Registrierung ✅

**Tasks:**

- [x] `scripts/import-template-enhanced.js` erstellt ✅
- [x] Validierung integriert ✅
- [x] Asset-Optimierung integriert ✅
- [x] Manifest-Generierung implementiert ✅
- [x] Template-Registrierung automatisch ✅

**Deliverable:** Automatisiertes Import-Script ✅

**Status:** ✅ Abgeschlossen

### 3.2 Template-Validierung automatisieren ✅

**Ziel:** Automatische Validierung bei Import

**Features:**

- JSON-Validierung ✅
- Asset-Existenz-Prüfung ✅
- Performance-Check ✅
- Qualitäts-Checkliste ✅

**Tasks:**

- [x] `scripts/validate-templates.ts` erweitert ✅
- [x] Performance-Score implementiert ✅
- [x] CI/CD-Integration (`.github/workflows/validate-templates.yml`) ✅
- [ ] Pre-commit Hook (optional)

**Deliverable:** Automatische Validierung ✅

**Status:** ✅ Abgeschlossen

### 3.3 Professionelles Template integrieren

**Ziel:** Designer-Template vollständig integrieren

**Schritte:**

1. Template von Designer erhalten
2. Validierung durchführen
3. Optimierung anwenden
4. Integration testen
5. Performance prüfen

**Deliverable:** Produktionsreifes Template

---

## 🚀 Phase 4: Finalisierung & Testing (Woche 3-4)

### 4.1 Technische Schulden abbauen

**TypeScript:**

- [ ] `any`-Types in Legacy-Code identifizieren
- [ ] Schrittweise Migration
- [ ] Type-Safety verbessern

**Dokumentation:**

- [ ] Template-Integration dokumentiert ✅
- [ ] Designer-Briefing erstellt ✅
- [ ] API-Dokumentation aktualisieren

**CI/CD:**

- [ ] Asset-Optimierung in Pipeline
- [ ] Performance-Tests in CI
- [ ] Automatische Validierung

### 4.2 Performance-Finalisierung

**Bundle-Size:**

- [ ] Tree-Shaking optimiert
- [ ] Chunk-Size < 2MB
- [ ] Lazy-Loading vollständig

**Runtime:**

- [ ] 60 FPS Desktop (p90)
- [ ] 40 FPS Mobile (p90)
- [ ] Ladezeit < 5s

**Caching:**

- [ ] Service Worker (optional)
- [ ] IndexedDB für Templates (optional)

### 4.3 E2E-Tests finalisieren

**Coverage:**

- [ ] Alle kritischen Features getestet
- [ ] Multi-Browser-Szenarien
- [ ] Performance-Tests
- [ ] Template-Switching-Tests

**CI/CD:**

- [ ] Tests in GitHub Actions
- [ ] Automatische Reports
- [ ] Performance-Metriken

### 4.4 Dokumentation finalisieren

**Dokumente:**

- [ ] README.md aktualisiert
- [ ] API-Dokumentation
- [ ] Deployment-Guide
- [ ] Troubleshooting-Guide

---

## 📊 Erfolgs-Kriterien (MVP)

### Funktionale Anforderungen

- [x] Template-Switching funktioniert
- [x] Strapi-Integration funktioniert
- [ ] Professionelles Template integriert
- [x] Multiplayer funktioniert (5-10 Teilnehmer)
- [x] Voice-Chat funktioniert
- [x] Whiteboard funktioniert

### Performance-Anforderungen

- [ ] Desktop: 60 FPS (p90)
- [ ] Mobile: 40 FPS (p90)
- [ ] Bundle-Size: < 2MB (initial)
- [ ] Ladezeit: < 5s (auf schneller Verbindung)

### Qualitäts-Anforderungen

- [ ] E2E-Tests: > 80% Coverage
- [ ] TypeScript: Keine `any`-Types (außer Legacy)
- [ ] Dokumentation: Vollständig
- [ ] CI/CD: Alle Tests grün

---

## 🗓️ Zeitplan

### Woche 1: Template-Recherche & Interview

- Tag 1-2: Template-Recherche
- Tag 3: Designer-Interview
- Tag 4-5: Design-Briefing finalisieren

### Woche 2: Kritische Schwachstellen beheben

- Tag 1-2: Strapi-Integration verbessern
- Tag 3-4: Asset-Pipeline automatisieren
- Tag 5: Performance-Optimierung

### Woche 3: Template-Integration

- Tag 1-2: Template-Import-Script erweitern
- Tag 3-4: Template-Validierung automatisieren
- Tag 5: Professionelles Template integrieren

### Woche 4: Finalisierung & Testing

- Tag 1-2: Technische Schulden abbauen
- Tag 3: Performance-Finalisierung
- Tag 4: E2E-Tests finalisieren
- Tag 5: Dokumentation finalisieren

---

## 📝 Checkliste

### Vor MVP-Release

- [ ] Alle kritischen Schwachstellen behoben
- [ ] Professionelles Template integriert
- [ ] Performance-Ziele erreicht
- [ ] E2E-Tests bestehen
- [ ] Dokumentation vollständig
- [ ] CI/CD Pipeline grün
- [ ] Deployment getestet

---

**Nächster Schritt:** Template-Recherche starten und Designer-Interview durchführen.
