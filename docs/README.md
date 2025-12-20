# WattWelten Metaverse Dokumentation

## Getting Started

Siehe [README.md](../README.md) für die Installation und den Quickstart.

## Asset-Import

### Assets importieren

```bash
# HDRI und Scene importieren
pnpm assets:import -- --hdri ./downloads/sunset_forest.hdr --scene ./downloads/windturbine.glb --template watt-eco

# Nur HDRI
pnpm assets:import -- --hdri ./downloads/sunset_forest.hdr

# Nur Scene
pnpm assets:import -- --scene ./downloads/windturbine.glb

# Mit Attribution-Datei
pnpm assets:import -- --hdri ./downloads/sunset_forest.hdr --scene ./downloads/windturbine.glb --attr ./attribution.txt
```

### Attribution generieren

```bash
# Generiert ATTRIBUTION.md für alle Templates basierend auf docs/assets-shopping.md
pnpm assets:attr
```

## LOD-System

Das Template-System unterstützt automatisches LOD-Switching:

- **LOD0**: Distanz < 40 Einheiten (vollständige Details)
- **LOD1**: Distanz 40-80 Einheiten (reduzierte Geometrie)
- **LOD2**: Distanz > 80 Einheiten (minimale Geometrie)

**Naming:** Nodes müssen `*_LOD0`, `*_LOD1`, `*_LOD2` im Namen enthalten.

LOD-Switching wird alle 250ms aktualisiert (Performance-optimiert).

## Windrad-Rotation

Windräder mit "Rotor" oder "Blade" im Node-Namen rotieren automatisch:

- **Geschwindigkeit:** 90°/s (Math.PI/2 pro Sekunde)
- **Distanz-Optimierung:** Langsamere Rotation bei Distanz > 50 Einheiten (verhindert Temporal Aliasing)

## Inhaltsverzeichnis

- [Templates](./templates.md) - Template-System und Erstellung
- [Audio & Voice](./audio-voice.md) - Spatial Audio und Ambient-Sounds
- [Avatare](./avatars.md) - Ready Player Me Integration
- [AI Integration](./ai-integration.md) - AI-Bridge zu wattos_plattform
- [Content Provider](./content-provider.md) - Local und Strapi Provider

## Architektur

Das Metaverse ist als Monorepo mit folgenden Hauptkomponenten aufgebaut:

- **apps/web**: Vite + Three.js Client
- **apps/server**: Socket.io Multiplayer Server
- **packages/core**: Engine, Template-System, Theme
- **packages/ui**: React UI Components
- **packages/avatars**: Ready Player Me Integration
- **packages/voice**: Spatial Audio, WebRTC
- **packages/audio**: Ambient-Sound-System
- **packages/net**: Multiplayer Client
- **packages/ai**: AI-Bridge
- **packages/content**: Content Provider
