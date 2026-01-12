# Designer-Briefing: 3D-Template für WattWelten Metaverse

**Version:** 1.0  
**Datum:** 2026-01-11  
**Projekt:** WattWelten Metaverse  
**Ziel:** Professionelles 3D-Template für immersive WebXR-Erlebnisse

---

## 📋 Projekt-Übersicht

WattWelten Metaverse ist eine WebXR-Plattform für immersive 3D-Erlebnisse im Browser. Templates sind vollständige 3D-Umgebungen, die zur Laufzeit geladen und gewechselt werden können, ohne die Seite neu zu laden.

### Was ist ein Template?

Ein Template besteht aus:

- **3D-Szene** (scene.glb) – Die Hauptumgebung
- **HDRI-Umgebung** (hdri.hdr) – Photorealistische Beleuchtung
- **Navigation-Mesh** (navmesh.glb, optional) – Für Avatar-Bewegung
- **Ambient-Audio** (optional) – Hintergrundgeräusche
- **Manifest** (manifest.json) – Konfigurationsdatei
- **UI-Theme** (ui-skin.css, optional) – Farben und Styling

---

## 🎯 Design-Ziele

### Primäre Ziele

1. **Performance**: 60 FPS auf Desktop, 40 FPS auf Mobile
2. **Qualität**: Stylized mit photorealistischen Elementen (realitätsnah, nicht futuristisch)
3. **Funktionalität**: Multiplayer-fähig, interaktiv, immersiv
4. **Kompatibilität**: Funktioniert in allen modernen Browsern

### Zielgruppe

- **Desktop**: Chrome, Firefox, Safari, Edge (Windows, macOS, Linux)
- **Mobile**: iOS Safari, Android Chrome
- **XR**: WebXR-fähige Headsets (optional)

### Projekt-Kontext

**Hauptzweck:**

- Präsentationen & Events
- Meetings & Konferenzen
- Networking & Socializing

**Zielgruppen:**

- B2B (Unternehmen)
- B2G (Behörden)
- Bildungseinrichtungen

**Emotion:**

- Professionell & Seriös
- Innovativ & Modern
- Warm & Einladend
- Natürlich & Organisch

---

## 🔧 Technische Spezifikationen

### 1. 3D-Szene (scene.glb)

#### Format & Export

- **Format**: GLTF Binary (.glb)
- **Software**: Blender 3.0+ (empfohlen)
- **Koordinatensystem**: Y-Up (Blender Standard)
- **Skalierung**: 1 Meter = 1 Blender-Einheit
- **Transform**: Apply All Transforms vor Export

#### Export-Einstellungen (Blender)

```
File → Export → glTF 2.0

✓ Include:
  - Selected Objects (wenn nur Szene exportiert)
  - Custom Properties
  - UVs
  - Normals
  - Tangents
  - Vertex Colors

✓ Transform:
  - +Y Up
  - Apply Modifiers

✓ Geometry:
  - Apply Modifiers
  - UVs
  - Normals
  - Tangents
  - Vertex Colors

✓ Compression:
  - Draco (optional, empfohlen)
    - Quantization: Pos 14, Normals 10, UVs 12, Colors 8
```

#### Polygon-Limits

| Objekt-Typ   | LOD0 (Hero) | LOD1 (Medium) | LOD2 (Far)  |
| ------------ | ----------- | ------------- | ----------- |
| Hauptobjekte | ≤ 25k Tris  | ≤ 10-15k Tris | ≤ 3-5k Tris |
| Vegetation   | ≤ 5k Tris   | ≤ 2k Tris     | ≤ 500 Tris  |
| Props        | ≤ 2k Tris   | ≤ 1k Tris     | ≤ 300 Tris  |

**Empfehlung**: Für Web-Optimierung, Low-Poly-Stil bevorzugen.

#### LOD-System (Level of Detail)

Wenn große Objekte vorhanden sind, erstelle LOD-Varianten:

**Naming-Konvention:**

```
Parent Empty: "Turbine"
  ├── Child: "Turbine_LOD0" (Hero, vollständige Details)
  ├── Child: "Turbine_LOD1" (Medium, reduzierte Details)
  └── Child: "Turbine_LOD2" (Far, minimale Details)
```

**LOD-Erstellung (Blender):**

1. Original-Objekt duplizieren
2. Decimate Modifier anwenden:
   - LOD1: Ratio 0.35-0.5
   - LOD2: Ratio 0.1-0.2
3. Merge by Distance (lose Vertices verschmelzen)
4. Normals: Recalculate Outside
5. Benennen: `ObjectName_LOD0/1/2`

#### Texturen

**Auflösungen:**

- **Hero-Objekte**: 2048×2048 (Albedo, Roughness, Metallic, Normal)
- **Vegetation**: 512-1024×512-1024
- **Boden/Terrain**: 2048×2048
- **Props**: 512-1024×512-1024

**Textur-Maps:**

- **Albedo/Diffuse**: Basis-Farbe
- **Normal Map**: Oberflächen-Details (OpenGL-Konvention, -Y)
- **Roughness**: Glanz/Mattheit (Graustufen)
- **Metallic**: Metall-Eigenschaften (Graustufen)
- **AO** (optional): Ambient Occlusion

**Optimierung:**

- KTX2-Kompression empfohlen (wird automatisch konvertiert)
- ETC1S für Vegetation (klein, gut)
- UASTC für Hero-Objekte (höhere Qualität)

#### Materialien

- **PBR (Physically Based Rendering)**: Standard-Materialien
- **Metallic/Roughness Workflow**: Bevorzugt
- **Keine Custom Shader**: Nur Standard-Materialien
- **Transparenz**: Sparsam verwenden (Performance)

#### Beleuchtung in Szene

- **Keine Lichter in scene.glb**: Beleuchtung kommt von HDRI/Manifest
- **Bake Shadows** (optional): In Texturen gebacken
- **Lightmaps** (optional): Für statische Beleuchtung

### 2. HDRI-Umgebung (hdri.hdr)

#### Format & Spezifikationen

- **Format**: HDR oder EXR
- **Auflösung**:
  - MVP: 2K (2048×1024)
  - Production: 4K (4096×2048)
- **Typ**: Equirectangular (360°)

#### Empfohlene Quellen

**Kostenlos (CC0):**

- **PolyHaven**: https://polyhaven.com/hdris
  - "Sunset Forest" (warm, atmosphärisch)
  - "Forest Path" (natürlich, hell)
  - "Evening Road" (dramatisch, warm)
  - "Spruit Sunrise" (friedlich, morgendlich)

**Kostenpflichtig:**

- **HDRI Haven**: https://hdrihaven.com
- **NoEmotion HDRIs**: https://noemotionhdrs.com

#### Integration

1. HDRI herunterladen
2. Als `hdri.hdr` im Template-Verzeichnis speichern
3. Im Manifest referenzieren: `"hdri": "hdri.hdr"`

### 3. Navigation-Mesh (navmesh.glb, optional)

#### Format & Spezifikationen

- **Format**: GLTF Binary (.glb)
- **Geometrie**: Nur begehbare Flächen
- **Materialien**: Keine (oder einfaches Material)
- **Name**: "NavMesh" oder "Navigation"
- **Skalierung**: Identisch mit scene.glb

#### Erstellung (Blender)

1. Szene duplizieren
2. Nur begehbare Flächen behalten (Boden, Wege, Plattformen)
3. Nicht begehbare Objekte entfernen (Wände, Hindernisse)
4. Einfaches Material zuweisen (optional)
5. Als `navmesh.glb` exportieren

**Wichtig**: NavMesh sollte keine Texturen oder komplexe Materialien haben.

### 4. Ambient-Audio (ambient/\*.mp3, optional)

#### Format & Spezifikationen

- **Format**: MP3
- **Sample Rate**: 44.1kHz
- **Bitrate**: 128-192kbps
- **Loop**: Muss nahtlos loopen
- **Dauer**: 10-30 Sekunden (für Loop)

#### Empfohlene Quellen

**Kostenlos (CC0):**

- **Freesound**: https://freesound.org
  - Suche: "birds", "wind", "forest ambient", "water"
  - Filter: CC0 License
- **Zapsplat**: https://www.zapsplat.com
  - Kategorie: Nature, Ambient

**Kostenpflichtig:**

- **AudioJungle**: https://audiojungle.net
- **Epidemic Sound**: https://www.epidemicsound.com

#### Datei-Struktur

```
ambient/
  ├── background.mp3    # Haupt-Ambient-Sound
  ├── birds.mp3         # Vogelgezwitscher (optional)
  └── wind.mp3          # Windgeräusche (optional)
```

### 5. Manifest (manifest.json)

#### Vollständige Vorlage

```json
{
  "id": "my-template-name",
  "name": "My Template Name",
  "version": "1.0.0",
  "description": "Kurze Beschreibung des Templates",

  "assets": {
    "scene": "scene.glb",
    "hdri": "hdri.hdr",
    "navmesh": "navmesh.glb"
  },

  "lighting": {
    "exposure": 1.0,
    "hdri": "hdri.hdr",
    "ambient": {
      "color": "#ffffff",
      "intensity": 0.4
    },
    "directional": {
      "color": "#ffffff",
      "intensity": 0.8,
      "position": {
        "x": 5,
        "y": 10,
        "z": 5
      }
    }
  },

  "spawn": {
    "position": [0, 1.6, 0],
    "rotationY": 0
  },

  "zones": [
    {
      "id": "main-zone",
      "label": "Main Zone",
      "shape": "circle",
      "center": [0, 0],
      "radius": 10,
      "isStage": false,
      "maxParticipants": 20
    },
    {
      "id": "stage",
      "label": "Stage",
      "shape": "circle",
      "center": [0, 0],
      "radius": 5,
      "isStage": true,
      "maxParticipants": 10
    }
  ],

  "portals": [
    {
      "id": "portal-1",
      "position": {
        "x": 10,
        "y": 1.6,
        "z": 0
      },
      "target": "another-template"
    }
  ],

  "ambient": {
    "sources": [
      {
        "id": "background",
        "file": "ambient/background.mp3",
        "volume": 0.3,
        "loop": true,
        "position": {
          "x": 0,
          "y": 1.6,
          "z": 0
        }
      }
    ]
  },

  "props": [
    {
      "id": "bench-1",
      "type": "bench",
      "pos": [5, 0, 5],
      "rotY": 1.57,
      "seats": 4
    },
    {
      "id": "sign-1",
      "type": "sign",
      "pos": [0, 1.6, 10],
      "rotY": 0,
      "text": "Welcome"
    }
  ],

  "ui": {
    "showMinimap": true,
    "showZoneLabels": true,
    "theme": "warm"
  }
}
```

#### Wichtige Felder

- **id**: Eindeutige Template-ID (lowercase, kebab-case)
- **name**: Anzeigename im Template-Switcher
- **spawn.position**: [x, y, z] in Metern, Y = 1.6m (Augenhöhe)
- **zones**: Audio-Zonen für Multiplayer
- **portals**: Teleport-Punkte zu anderen Templates

### 6. UI-Theme (ui-skin.css, optional)

#### CSS-Variablen

```css
:root {
  --color-primary: #ffaa66;
  --color-secondary: #8b6f47;
  --color-background: rgba(20, 15, 10, 0.85);
  --color-text: #f5e6d3;
  --color-accent: #4ecdc4;

  --glass-background: rgba(20, 15, 10, 0.7);
  --glass-backdrop-blur: blur(20px);
  --glass-border: rgba(255, 255, 255, 0.1);

  --font-system: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

---

## 🎨 Design-Richtlinien

### Spezifische Anforderungen (MVP)

**Umgebung:**

- **Typ**: Primär Außen, modern aber integriert (nicht futuristisch)
- **Stil**: Realitätsnah wie Landschaft und moderne Gebäude im Nordwesten Deutschlands
- **Landschaft**: Wald + Wasser + Felsen + Wege/Plattformen
- **Größe**: Klein bis Mittel (20-50m, für 5-20 Personen)

**Referenzen:**

- https://moin.metaverse-nordwest.com/
- https://grids-demo.zreality.com/WAWTroz/brandenburg-demo

**Farbpalette:**

- **Primär**: Natur (Grün, Braun, Erde) für Landschaft
- **Sekundär**: Neutral (Grau, Beige, Weiß) für Gebäude
- **Harmonie**: Analog (harmonische Farbübergänge)

### Spawn-Position

- **Y-Höhe**: 1.6m (Augenhöhe für Avatare)
- **Position**: Zentral, guter Überblick über die gesamte Szene
- **Keine Kollisionen**: Spawn-Punkt muss frei sein
- **Rotation**: Optional, für Blickrichtung

### Beleuchtung

- **HDRI**: Sonnenuntergangs-Atmosphäre (warm, atmosphärisch)
- **Lichtquelle**: Natürlich (Sonne, Himmel, HDRI)
- **Helligkeit**: Mittel bis Hell (ausgewogen, natürlich)
- **Farbtemperatur**: Warm (3000-4000K, Orange/Gelb-Töne)
- **Exposure**: 1.0-1.5 (je nach HDRI)
- **Ambient**: 0.3-0.5 (Basis-Helligkeit)
- **Directional**: 0.6-0.8 (Hauptlicht)

### Zonen

- **Main Zone**: 10-15m Radius (Hauptbereich für alle)
- **Stage**: 5-8m Radius (Bühne für Präsentationen)
- **Breakout**: 3-5m Radius pro Zone (Kleingruppen-Bereiche)
- **Lounge**: 5-8m Radius (Entspannungsbereich, optional)

### Interaktive Elemente

- **Bänke**: Sitzgelegenheiten (wie in Referenzen)
- **Schilder**: Informations-Tafeln (Wegweiser)
- **Screens**: Bildschirme für Präsentationen (wie in Referenzen)

### Navigation

- **Wege**: Klare Wege für Navigation (wie in Referenzen)
- **Navigation-Mesh**: Ja (Avatare können sich nur auf bestimmten Flächen bewegen)
- **Bereiche**: Wege, Plattformen, begehbare Flächen

### Performance-Optimierung

- **Asset-Größe**: < 50MB (gesamt) - **KRITISCH für MVP**
- **Texturen**: < 100MB (gesamt)
- **Polygone**: < 500k Tris (gesamt) - **KRITISCH für MVP**
- **Draw Calls**: < 100 (optimal)
- **Ziel-Geräte**: Laptop (Standard) + Mobile (Smartphones, Tablets)
- **Priorität**: Performance & Ladezeit haben höchste Priorität (1-2)
- **Stil**: Ausgewogen (gute Qualität, gute Performance) - nicht höchste Qualität

### MVP-Anforderungen

**Muss enthalten:**

- ✅ Natürliche Landschaft (Wald, Wasser, Felsen)
- ✅ Sonnenuntergangs-Atmosphäre (warme Beleuchtung)
- ✅ Navigation-Mesh (Wege, Plattformen)
- ✅ Ambient-Audio (Vögel, Wasser, leise 0.1-0.2)
- ✅ Mehrere Zonen (Main, Stage, Breakout, ggf. Lounge)

**Sollte NICHT enthalten:**

- ❌ Futuristische Elemente
- ❌ Zu viele Details (Performance)
- ❌ Zu große Dateien (> 50MB)
- ❌ Komplexe Animationen
- ❌ Es ist ein MVP - Einfach, performant, funktional!

### Budget & Zeitplan

- **Budget**: Maximal 250€ für gesamtes Template (inkl. Assets & Erstellung)
- **Asset-Quellen**: Kostenlos bevorzugt (CC0/CC-BY)
- **Zeitplan**: Sofort (innerhalb 1 Woche)
- **Designer**: Extern über Fiverr

---

## 📦 Deliverables

### Pflicht-Dateien

1. ✅ **scene.glb** – 3D-Szene (optimiert)
2. ✅ **manifest.json** – Konfigurationsdatei
3. ✅ **hdri.hdr** – HDRI-Umgebung (2K oder 4K)

### Optionale Dateien

4. ⚪ **navmesh.glb** – Navigation-Mesh
5. ⚪ **ambient/background.mp3** – Ambient-Audio
6. ⚪ **ui-skin.css** – UI-Theme

### Zusätzliche Assets (optional)

7. ⚪ **Texturen** (wenn nicht in GLB eingebettet)
8. ⚪ **LOD-Varianten** (für große Objekte)
9. ⚪ **Dokumentation** (README.md mit Credits)

---

## ✅ Qualitäts-Checkliste

### Technische Validierung

- [ ] `scene.glb` lädt ohne Fehler im Browser
- [ ] Texturen sind sichtbar und korrekt zugewiesen
- [ ] Beleuchtung wirkt natürlich und ausgewogen
- [ ] Spawn-Position ist korrekt (Y = 1.6m)
- [ ] Zonen sind definiert und logisch platziert
- [ ] Manifest ist valide JSON (keine Syntax-Fehler)
- [ ] Alle Pfade in Manifest sind relativ (keine absoluten Pfade)

### Performance

- [ ] Desktop: 60 FPS (getestet in Chrome)
- [ ] Mobile: 40 FPS (getestet in Mobile Browser)
- [ ] Asset-Größe: < 50MB (gesamt)
- [ ] Texturen: < 100MB (gesamt)
- [ ] Ladezeit: < 5 Sekunden (auf schneller Verbindung)

### Design-Qualität

- [ ] Visuell ansprechend und konsistent
- [ ] Beleuchtung passt zur Stimmung
- [ ] Farben sind harmonisch
- [ ] Skalierung ist realistisch (1m = 1 Blender-Einheit)
- [ ] Keine sichtbaren Artefakte oder Fehler

### Funktionalität

- [ ] Avatare können sich bewegen (mit NavMesh)
- [ ] Zonen funktionieren (Audio-Isolation)
- [ ] Portals funktionieren (wenn vorhanden)
- [ ] Ambient-Audio spielt (wenn vorhanden)
- [ ] Template kann zur Laufzeit gewechselt werden

---

## 📂 Datei-Struktur

### Finale Struktur

```
my-template-name/
├── manifest.json          # ✅ Pflicht
├── scene.glb             # ✅ Pflicht
├── hdri.hdr              # ✅ Pflicht
├── navmesh.glb           # ⚪ Optional
├── ui-skin.css           # ⚪ Optional
├── ambient/               # ⚪ Optional
│   ├── background.mp3
│   ├── birds.mp3
│   └── wind.mp3
└── README.md             # ⚪ Optional (Credits, Beschreibung)
```

### Beispiel-Template

Referenz: `apps/web/public/templates/watt-eco/`

- Vollständige Implementierung
- Alle Dateien vorhanden
- Optimiert für Performance

---

## 🔄 Workflow

### Schritt 1: Design & Konzept

1. Konzept erstellen (Moodboard, Skizzen)
2. Stilrichtung festlegen (realistisch, stylized, low-poly)
3. Farbpalette definieren
4. Beleuchtungsstimmung planen

### Schritt 2: 3D-Modellierung

1. Szene in Blender erstellen
2. Assets modellieren/importieren
3. Texturen erstellen/zuweisen
4. Materialien konfigurieren
5. LOD-Varianten erstellen (falls nötig)

### Schritt 3: Optimierung

1. Polygon-Zahl reduzieren (falls nötig)
2. Texturen optimieren (Auflösung, Kompression)
3. Draco-Kompression anwenden (optional)
4. KTX2-Kompression vorbereiten (wird automatisch konvertiert)

### Schritt 4: Export

1. scene.glb exportieren (mit korrekten Einstellungen)
2. navmesh.glb exportieren (falls vorhanden)
3. HDRI herunterladen/zuweisen
4. Ambient-Audio vorbereiten

### Schritt 5: Manifest erstellen

1. manifest.json erstellen (siehe Vorlage)
2. Alle Pfade korrekt setzen
3. Spawn-Position definieren
4. Zonen konfigurieren
5. JSON validieren (keine Syntax-Fehler)

### Schritt 6: Testing

1. Template in Browser testen
2. Performance prüfen (FPS)
3. Funktionalität testen (Zonen, Portals, Audio)
4. Mobile-Test durchführen
5. Fehler beheben

### Schritt 7: Finalisierung

1. Alle Dateien in Template-Verzeichnis kopieren
2. Qualitäts-Checkliste durchgehen
3. Dokumentation erstellen (README.md)
4. Credits auflisten (Assets, Quellen)

---

## 🛠️ Tools & Software

### Empfohlene Software

- **Blender 3.0+**: 3D-Modellierung, Export
- **Substance Painter** (optional): Texturierung
- **GIMP/Photoshop**: Textur-Bearbeitung
- **Audacity** (optional): Audio-Bearbeitung

### Online-Tools

- **glTF Validator**: https://github.khronos.org/glTF-Validator/
- **PolyHaven**: HDRI-Download
- **Freesound**: Audio-Download

---

## 📚 Referenzen & Beispiele

### Beispiel-Templates

1. **watt-eco**: Wald-Sunset-Theme
   - Pfad: `apps/web/public/templates/watt-eco/`
   - Vollständige Implementierung

2. **demo-plaza**: Meeting-Plaza
   - Pfad: `apps/web/public/templates/demo-plaza/`
   - Multi-Zone-Setup

### Dokumentation

- **Template-System**: `docs/templates.md`
- **Asset-Guide**: `docs/assets-shopping.md`
- **Performance-Guide**: `docs/performance.md`

### Externe Ressourcen

- **GLTF-Spezifikation**: https://www.khronos.org/gltf/
- **Blender GLTF-Export**: https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html
- **PolyHaven**: https://polyhaven.com

---

## ❓ Häufige Fragen (FAQ)

### Q: Welche Blender-Version sollte ich verwenden?

**A:** Blender 3.0 oder höher. Die GLTF-Export-Funktion ist ab Version 2.8 verfügbar, aber 3.0+ hat bessere Optimierungen.

### Q: Muss ich Draco-Kompression verwenden?

**A:** Optional, aber empfohlen. Reduziert Dateigröße um 50-70%, ohne sichtbaren Qualitätsverlust.

### Q: Wie groß darf die scene.glb sein?

**A:** < 50MB (gesamt). Für Web-Performance sollten große Assets aufgeteilt werden.

### Q: Kann ich Custom Shader verwenden?

**A:** Nein. Nur Standard PBR-Materialien (Metallic/Roughness Workflow).

### Q: Wie teste ich das Template?

**A:**

1. Dateien in `apps/web/public/templates/my-template-name/` kopieren
2. Web-App starten: `cd apps/web && pnpm dev`
3. Im Browser: `http://localhost:5173?template=my-template-name`

### Q: Was passiert, wenn Assets fehlen?

**A:** Das System verwendet Fallbacks:

- Keine scene.glb → Generierte Default-Szene
- Keine HDRI → Standard-Lighting
- Keine NavMesh → Keine Navigation (Avatare können sich trotzdem bewegen)

---

## 📞 Support & Kontakt

Bei Fragen zur technischen Umsetzung:

- **Template-Dokumentation**: `docs/templates.md`
- **Asset-Guide**: `docs/assets-shopping.md`
- **Performance-Guide**: `docs/performance.md`

---

## 📝 Checkliste für Designer

### Vor Beginn

- [ ] Projekt-Briefing gelesen und verstanden
- [ ] Blender installiert (3.0+)
- [ ] Beispiel-Template angeschaut (`watt-eco`)
- [ ] Design-Konzept erstellt

### Während der Arbeit

- [ ] Polygon-Limits eingehalten
- [ ] Textur-Auflösungen korrekt
- [ ] LOD-Varianten erstellt (falls nötig)
- [ ] Beleuchtung getestet
- [ ] Performance im Blick behalten

### Vor Abgabe

- [ ] Alle Pflicht-Dateien vorhanden
- [ ] manifest.json validiert (JSON-Syntax)
- [ ] Template in Browser getestet
- [ ] Performance-Check durchgeführt
- [ ] Qualitäts-Checkliste abgehakt
- [ ] Credits dokumentiert (README.md)

---

**Viel Erfolg bei der Template-Erstellung! 🚀**
