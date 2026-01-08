# Professionelle Asset-Pipeline - WattWelten Metaverse

Dieses Dokument beschreibt die professionelle Asset-Pipeline für hochwertige 3D-Assets, ähnlich wie bei Arthur, RaveSpace Metaverse Nordwest und anderen professionellen Metaverse-Plattformen.

## Übersicht

Die Asset-Pipeline ermöglicht:

- Automatischen Download von hochwertigen 3D-Modellen von PolyHaven und Sketchfab
- Professionelle HDRI-Umgebungen (4K) für photorealistische Beleuchtung
- Automatische Asset-Optimierung (Draco, KTX2, LOD)
- Intelligente Platzierung von Assets in der Szene
- Integration in das Template-System

## Verwendung

### 1. Assets herunterladen

```bash
# Alle professionellen Assets herunterladen
pnpm assets:professional

# Nur HDRI herunterladen
pnpm assets:professional --hdri-only

# Nur Modelle herunterladen
pnpm assets:professional --models-only

# Optimierung überspringen
pnpm assets:professional --skip-optimize
```

### 2. Asset-Konfiguration

Die Asset-Konfiguration befindet sich in `scripts/professional-asset-config.ts`:

- **HDRI**: Professionelle 4K-Umgebungen (Forest Slope, Spruit Sunrise, etc.)
- **Bäume**: Hochwertige Baum-Modelle (Oak, Pine, Birch)
- **Felsen**: Realistische Felsformationen
- **Vegetation**: Gras, Büsche, Blumen
- **Boden-Texturen**: Photorealistische Terrain-Texturen

### 3. Automatische Platzierung

Das System platziert Assets automatisch basierend auf Layout-Regeln:

- **Boundary Trees**: Bäume an den Rändern für natürliche Grenzen
- **Clusters**: Felsen in Gruppen (z.B. am See)
- **Scatter**: Vegetation zufällig verteilt
- **Path Avoidance**: Assets werden nicht auf Wegen platziert

### 4. Integration in Template

Assets werden automatisch in `manifest.json` eingetragen:

```json
{
  "assets": {
    "hdri": "/assets/watt-eco/forest_slope_4k.hdr",
    "textures": {
      "ground": "/assets/watt-eco/textures/ground_forest.jpg",
      "path": "/assets/watt-eco/textures/ground_dirt.jpg"
    }
  },
  "placedAssets": [
    {
      "id": "tree_oak_01",
      "model": "/assets/watt-eco/models/tree_oak_01.glb",
      "position": [8, 0, -3],
      "rotation": [0, 1.2, 0],
      "scale": 1.0,
      "variant": 0
    }
  ]
}
```

### 5. Aktivierung im Client

Um professionelle Assets zu verwenden, setze:

```bash
VITE_ECO_PROFESSIONAL=true
```

Oder in `.env.local`:

```
VITE_ECO_PROFESSIONAL=true
```

## Asset-Optimierung

Die Pipeline optimiert Assets automatisch:

- **Draco Compression**: Reduziert GLB-Dateigröße um 50-70%
- **KTX2 Textures**: Komprimierte Texturen für bessere Performance
- **LOD Generation**: Level-of-Detail für entfernte Objekte

## PolyHaven API

Die Pipeline nutzt die PolyHaven API:

- **HDRI**: `https://api.polyhaven.com/files?type=hdr&id={id}`
- **Models**: `https://api.polyhaven.com/files?type=model&id={id}`
- **Textures**: `https://api.polyhaven.com/files?type=texture&id={id}`

Alle Assets sind CC0-lizenziert und können kommerziell genutzt werden.

## Qualitätsstandards

Die Pipeline folgt professionellen Standards:

- **HDRI**: 4K Auflösung für beste Qualität
- **Models**: Optimiert für Web (GLB-Format)
- **Textures**: 2K für gute Balance zwischen Qualität und Größe
- **Shadows**: Alle Assets unterstützen Schatten
- **LOD**: Automatische LOD-Generierung für Performance

## Nächste Schritte

1. **Asset-IDs verifizieren**: PolyHaven Asset-IDs müssen verifiziert werden
2. **Mehr Assets hinzufügen**: Weitere Baumarten, Felsen, Vegetation
3. **Sketchfab Integration**: Zusätzliche Modelle von Sketchfab
4. **Performance-Testing**: LOD und Optimierung testen

## Troubleshooting

### Assets werden nicht geladen

- Prüfe ob Asset-IDs korrekt sind
- Prüfe ob PolyHaven API erreichbar ist
- Prüfe Console-Logs für Fehlermeldungen

### Zu große Dateien

- Nutze `--skip-optimize` nicht
- Reduziere HDRI-Qualität auf 2K
- Nutze weniger Assets

### Performance-Probleme

- Aktiviere LOD: `enableLOD: true`
- Reduziere Asset-Anzahl
- Nutze optimierte Assets (Draco, KTX2)
