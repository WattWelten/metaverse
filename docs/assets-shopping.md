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
   - Erstelle LOD-Varianten (benennen: `Turbine_LOD0`, `Turbine_LOD1`, `Turbine_LOD2`)

2. **LOD-Erstellung:**
   - **LOD0** (Hero): ≤ 25k Tris, vollständige Details
   - **LOD1** (Medium): ≤ 10-15k Tris, Decimate Ratio 0.35-0.5
   - **LOD2** (Far): ≤ 3-5k Tris, Decimate Ratio 0.1-0.2
   - **Naming:** Parent-Empty mit Base-Name, Children als `*_LOD0/1/2`
   - **Merge by Distance** nach Decimate (lose Vertices verschmelzen)
   - **Normals:** Recalculate Outside, harte Kanten nur wo nötig

3. **Textur-Optimierung:**
   - **KTX2 Kompression:**
     - ETC1S (klein, gut für Vegetation): `-q 128`
     - UASTC (höhere Qualität für Hero-Objekte): `-uastc 2` (ggf. `--zstd 18`)
   - **Auflösung:**
     - Turbine: 1× 2048 (Albedo/Rough/Metal/Normal)
     - Vegetation: 512-1024
   - **Normal Maps:** OpenGL-Konvention (-Y), in Blender "Non-Color"

4. **Export:**
   - Format: **GLTF Binary (.glb)**
   - "Apply Modifiers", "+Tangents", **Y-Up**, "+Materials", "+Vertex Colors"
   - Draco (optional): Quantization Pos 14, Normals 10, UVs 12, Colors 8
   - **Naming:** Parent-Empty "Turbine", Child "Rotor" (für Rotation im Code)
   - **Scale:** 1m = 1 Blender-Einheit, `Apply All Transforms`
   - Pfad: `/packages/assets/templates/watt-eco/`

### Asset-Import

Verwende das Asset-Import-Tool:

```bash
# HDRI und Scene importieren
pnpm assets:import -- --hdri ./downloads/sunset_forest.hdr --scene ./downloads/windturbine.glb --template watt-eco

# Attribution generieren
pnpm assets:attr
```

Das Tool:

- Kopiert Assets in das Template-Verzeichnis
- Aktualisiert `manifest.json` automatisch
- Erstellt `ATTRIBUTION.md` falls nicht vorhanden

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
