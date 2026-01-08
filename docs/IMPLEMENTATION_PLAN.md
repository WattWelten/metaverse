# Implementierungsplan - Template-Integration & Optimierung

## 🎯 Ziel

Automatischer Download, Integration und Optimierung von freien Landschafts-Templates im Stil von Arthur, RaveSpace Metaverse Nordwest.

## 📋 Phase 1: Template-Recherche & Download (Aktuell)

### 1.1 Template-Quellen

**PolyHaven** (Primärquelle)

- ✅ HDRI: forest_slope, spruit_sunrise, kiara_1_dawn, sunset_jhb_central
- ✅ Models: Trees, Rocks, Vegetation
- ✅ License: CC0 (Public Domain)
- ✅ API: Verfügbar, keine Authentifizierung nötig

**Sketchfab** (Sekundärquelle)

- ⏳ CC0 Models: Suche nach "landscape", "forest", "nature"
- ⏳ API: Benötigt API-Key für Downloads
- ⏳ License: CC0 Filter anwenden

**OpenGameArt** (Zusätzlich)

- ⏳ 2D/3D Assets: Landschafts-Elemente
- ⏳ License: Verschiedene (CC0 bevorzugt)

**Free3D** (Zusätzlich)

- ⏳ 3D Models: Landschafts-Objekte
- ⏳ License: Verschiedene (prüfen!)

### 1.2 Template-Kategorien

1. **Forest** (Wald)
   - forest-sunset ✅
   - forest-dawn ✅
   - forest-autumn ✅

2. **Mountain** (Berg)
   - mountain-peak ✅

3. **Beach** (Strand)
   - beach-sunset ✅

4. **Desert** (Wüste)
   - desert-dunes ✅

5. **Urban** (Stadt) - ⏳ Noch zu recherchieren
6. **Fantasy** (Fantasy) - ⏳ Noch zu recherchieren

## 📋 Phase 2: Automatischer Download

### 2.1 Download-Script

**Status**: ✅ Implementiert (`scripts/download-landscape-templates.ts`)

**Features**:

- ✅ PolyHaven HDRI Download
- ✅ PolyHaven Model Download
- ✅ Manifest-Generierung
- ✅ Template-Struktur erstellen

**Verwendung**:

```bash
# Alle Templates
pnpm templates:download

# Spezifisches Template
pnpm templates:download --template forest-sunset

# Nach Kategorie
pnpm templates:download --category forest
```

### 2.2 Template-Struktur

```
packages/assets/templates/
├── forest-sunset/
│   ├── manifest.json
│   └── assets/
│       ├── hdri/
│       └── models/
├── forest-dawn/
│   └── ...
└── ...
```

## 📋 Phase 3: Integration

### 3.1 Template-Registry

**Status**: ✅ Bereits implementiert (`packages/core/src/scene/TemplateRegistry.ts`)

**Erweiterungen**:

- [ ] Auto-Discovery von Templates
- [ ] Template-Metadaten
- [ ] Template-Vorschau

### 3.2 Asset-Loading

**Status**: ✅ Bereits implementiert (`apps/web/src/environment/EcoProfessional.ts`)

**Erweiterungen**:

- [ ] Lazy Loading
- [ ] Progress-Indicator
- [ ] Error-Handling

## 📋 Phase 4: Optimierung

### 4.1 Asset-Optimierung

**Status**: ✅ Implementiert (`scripts/optimize-and-test.ts`)

**Features**:

- ✅ Draco-Kompression
- ✅ KTX2-Texturen
- ✅ LOD-Generierung

**Verwendung**:

```bash
pnpm optimize:all
```

### 4.2 Performance-Optimierung

**Geplant**:

- [ ] Frustum Culling
- [ ] Occlusion Culling
- [ ] Texture Streaming
- [ ] Geometry Instancing

## 📋 Phase 5: Testing

### 5.1 Unit Tests

**Status**: ⏳ Teilweise implementiert

**Erweitern**:

- [ ] Template-Loader Tests
- [ ] Asset-Downloader Tests
- [ ] Optimizer Tests

### 5.2 E2E Tests

**Status**: ⏳ Teilweise implementiert

**Erweitern**:

- [ ] Template-Wechsel
- [ ] Asset-Loading
- [ ] Performance-Tests

### 5.3 Performance-Tests

**Status**: ⏳ Geplant

**Tests**:

- [ ] FPS-Messung
- [ ] Load-Time
- [ ] Memory-Usage
- [ ] Bundle-Size

## 🚀 Nächste Schritte

### Sofort (Diese Woche)

1. **Template-Download testen**

   ```bash
   pnpm templates:download
   ```

2. **Templates validieren**
   - Manifests prüfen
   - Assets verifizieren
   - Integration testen

3. **Optimierung durchführen**
   ```bash
   pnpm optimize:all
   ```

### Kurzfristig (Nächste Woche)

4. **Weitere Templates hinzufügen**
   - Urban-Templates recherchieren
   - Fantasy-Templates finden
   - Template-Katalog erweitern

5. **Performance messen**
   - FPS auf verschiedenen Geräten
   - Load-Time optimieren
   - Memory-Usage reduzieren

### Mittelfristig (Nächster Monat)

6. **Testing ausbauen**
   - Mehr Unit Tests
   - E2E-Tests erweitern
   - Performance-Tests automatisieren

7. **Features erweitern**
   - Template-Vorschau
   - Template-Editor
   - Asset-Management-UI

## 📊 Erfolgs-Kriterien

- [ ] 5+ Templates verfügbar
- [ ] Alle Templates optimiert
- [ ] < 3s Load Time
- [ ] 60 FPS Desktop, 40 FPS Mobile
- [ ] 80% Test Coverage
