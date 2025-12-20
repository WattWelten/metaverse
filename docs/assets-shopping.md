# Asset Shopping Guide

Kostenlose und kostenpflichtige Assets für das WattWelten Metaverse.

## HDRI (High Dynamic Range Images)

### Kostenlos (CC0)

**PolyHaven** - https://polyhaven.com/hdris

- **Empfohlene HDRI:**
  - "Sunset Forest" - Warmes Abendlicht im Wald
  - "Forest Path" - Waldweg mit natürlichem Licht
  - "Evening Road" - Abendstimmung auf Straße
- **Format:** HDR oder EXR
- **Größe:** 2k (2048x1024) für MVP, 4k für Production
- **Import:** Download → speichere als `hdri.hdr` in Template-Verzeichnis

## 3D-Modelle

### Kostenlos (CC0/CC-BY)

**Sketchfab** - https://sketchfab.com

- Suche nach: "tree", "bush", "vegetation", "nature"
- Filter: CC0 oder CC-BY
- **Empfohlene Kategorien:**
  - Bäume (Low-poly)
  - Büsche
  - Gras
  - Felsen

**OpenGameArt** - https://opengameart.org

- Freie 3D-Modelle für Spiele
- Kategorie: 3D Models → Nature

### Kostenpflichtig (≤49€)

**CGTrader** - https://www.cgtrader.com

- **Windturbine:**
  - Suche: "low poly wind turbine"
  - Preis: ≤49€
  - **Optimierung in Blender:**
    - Decimate für LOD-Varianten
    - KTX2-Textur-Kompression
    - GLB-Export mit Draco
  - Pfad: `/packages/assets/templates/watt-eco/windturbine.glb`

## Audio

### Kostenlos (CC0)

**Freesound** - https://freesound.org

- Suche: "birds", "wind", "forest ambient"
- Filter: CC0
- **Empfohlene:**
  - Vogelgezwitscher
  - Windgeräusche
  - Wald-Ambient

**Zapsplat** - https://www.zapsplat.com

- Kostenlose Sound-Effekte (mit Account)
- Kategorie: Nature, Ambient

## Optimierung

### Blender-Workflow

1. **Model-Import:**
   - Importiere FBX/OBJ/Blend
   - Reduziere Polygone (Decimate Modifier)
   - Erstelle LOD-Varianten

2. **Textur-Optimierung:**
   - Konvertiere zu KTX2 (Basis Universal)
   - Größe: 512x512 bis 2048x2048
   - Format: KTX2 für Web

3. **Export:**
   - Format: GLTF Binary (.glb)
   - Draco-Kompression: Aktivieren
   - Pfad: `/packages/assets/templates/watt-eco/`

## Pfad-Struktur

```
packages/assets/templates/watt-eco/
├── manifest.json
├── ui-skin.css
├── hdri.hdr          # HDRI von PolyHaven
├── scene.glb         # 3D-Szene (Blender-Export)
└── ambient/
    ├── birds.mp3     # Vogelgezwitscher
    └── wind.mp3      # Windgeräusche
```
