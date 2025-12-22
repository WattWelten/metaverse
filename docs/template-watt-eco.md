# Template: watt-eco

Das `watt-eco` Template ist ein Wald-Sunset-Theme mit warmen Tönen und natürlicher Beleuchtung.

## Assets

### HDRI (High Dynamic Range Image)

**Empfohlene Quellen:**

- [PolyHaven HDRI](https://polyhaven.com/hdris) - Kostenlose CC0-HDRIs
- Empfohlene HDRI: "Sunset Forest", "Forest Path", "Evening Road"

**Import-Anleitung:**

1. Lade HDR/EXR-Datei von PolyHaven herunter
2. Speichere als `hdri.hdr` im Template-Verzeichnis: `/packages/assets/templates/watt-eco/hdri.hdr`
3. Optimierung: 2k für MVP (2048x1024), Format: HDR oder EXR

### 3D-Szene (scene.glb)

**Empfohlene Quellen:**

- Sketchfab (CC0/CC-BY): Vegetationsmodelle, Bäume, Büsche
- OpenGameArt: Freie 3D-Modelle
- CGTrader: Low-poly Windturbine (≤49€)

**Blender-Export:**

- Format: GLTF Binary (.glb)
- Draco-Kompression: Optional (empfohlen für kleinere Dateien)
- KTX2-Texturen: Empfohlen für bessere Performance
- Pfad: `/packages/assets/templates/watt-eco/scene.glb`

### Ambient Audio

- `ambient/birds.mp3` - Vogelgezwitscher
- `ambient/wind.mp3` - Windgeräusche

## Manifest

Das Template verwendet folgende Konfiguration:

```json
{
  "id": "watt-eco",
  "name": "Watt Eco – Forest Sunset",
  "version": "1.0.0",
  "assets": {
    "scene": "scene.glb",
    "hdri": "hdri.hdr"
  },
  "lighting": {
    "exposure": 1.0,
    "hdri": "hdri.hdr"
  },
  "spawn": {
    "position": [0, 1.1, 6],
    "rotationY": 3.14
  }
}
```

## Fallbacks

Wenn Assets fehlen, verwendet das System:

- **HDRI fehlt**: Default-Lighting (Ambient + Directional Light)
- **scene.glb fehlt**: Generierte Default-Szene (Boden + Würfel)

## UI-Theme

Das Template verwendet warme Farbtöne:

- Primary: `#ffaa66` (Orange)
- Secondary: `#8b6f47` (Braun)
- Background: `rgba(20, 15, 10, 0.85)` (Dunkelbraun)
- Text: `#f5e6d3` (Beige)
