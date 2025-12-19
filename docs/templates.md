# Template-System

Das Template-System ermöglicht es, 3D-Umgebungen schnell auszutauschen und anzupassen.

## Template-Struktur

Ein Template besteht aus:

```
templates/
  my-template/
    manifest.json      # Template-Metadaten
    scene.glb         # 3D-Szene
    hdri.hdr          # HDR-Environment (optional)
    ui-skin.css       # UI-Theme (optional)
    ambient/          # Ambient-Audio-Dateien
      birds.mp3
      water.mp3
```

## Manifest-Datei

Die `manifest.json` definiert:

```json
{
  "name": "my-template",
  "version": "1.0.0",
  "spawn": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "lighting": {
    "ambient": {
      "color": "#ffffff",
      "intensity": 0.4
    },
    "directional": {
      "color": "#ffffff",
      "intensity": 0.8,
      "position": { "x": 5, "y": 10, "z": 5 }
    }
  },
  "ambient": {
    "sources": [
      {
        "id": "birds",
        "file": "ambient/birds.mp3",
        "volume": 0.3,
        "loop": true
      }
    ]
  }
}
```

## Template laden

Templates werden zur Laufzeit geladen:

```typescript
import { templateRegistry } from '@metaverse/core';

await templateRegistry.load('my-template', scene);
```

## Hot-Swap

Templates können zur Laufzeit gewechselt werden:

```typescript
await templateRegistry.load('another-template', scene);
```

