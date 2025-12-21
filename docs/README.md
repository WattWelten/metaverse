# WattWelten Metaverse Dokumentation

## Getting Started

Siehe [README.md](../README.md) für die Installation und den Quickstart.

## Decoder-Setup

Das Metaverse verwendet Draco (Geometrie-Kompression) und KTX2 (Textur-Kompression) für optimierte Asset-Größen.

### Decoder-Ordner erstellen

```bash
# Erstellt die notwendigen Ordnerstrukturen
pnpm setup:decoders
```

Dies erstellt:

- `apps/web/public/draco/` - Für Draco-Decoder-Dateien
- `apps/web/public/ktx2/` - Für KTX2/Basis-Transcoder-Dateien

### Decoder-Dateien hinzufügen

**Option 1: Lokale Dateien**

1. Lade Draco-Decoder von [GitHub](https://github.com/google/draco/tree/master/javascript/draco_decoder)
2. Kopiere `draco_decoder.js` und `draco_decoder.wasm` nach `apps/web/public/draco/`
3. Lade KTX2-Transcoder von [GitHub](https://github.com/BinomialLLC/basis_universal/tree/master/webgl)
4. Kopiere `basis_transcoder.js` und `basis_transcoder.wasm` nach `apps/web/public/ktx2/`

**Option 2: CDN (empfohlen für Development)**

Die Loader-Utilities können auch CDN-Pfade verwenden. Passe die Pfade in `packages/core/src/render/loaders/draco.ts` und `packages/core/src/render/loaders/ktx2.ts` an.

**Hinweis:** Ohne Decoder-Dateien funktionieren komprimierte Assets nicht. Die App fällt automatisch auf unkomprimierte Assets zurück, wenn Decoder fehlen.

## Asset-Import

### Assets importieren

```bash
# HDRI, Scene und Audio importieren
pnpm assets:import -- --hdri ./downloads/sunset_forest.hdr --scene ./downloads/windturbine.glb --audio ./downloads/forest.wav --template watt-eco

# Nur HDRI
pnpm assets:import -- --hdri ./downloads/sunset_forest.hdr

# Nur Scene
pnpm assets:import -- --scene ./downloads/windturbine.glb

# Nur Audio
pnpm assets:import -- --audio ./downloads/forest.wav

# Mit Attribution-Datei
pnpm assets:import -- --hdri ./downloads/sunset_forest.hdr --scene ./downloads/windturbine.glb --audio ./downloads/forest.wav --attr ./attribution.txt
```

**Hinweis:** Audio-Dateien werden automatisch im Manifest als `audio.ambient` mit `gain: 0.2` registriert.

### Attribution generieren

```bash
# Generiert ATTRIBUTION.md für alle Templates basierend auf docs/assets-shopping.md und manifest.json
pnpm assets:attr
```

Das Script extrahiert automatisch:

- Asset-Namen aus `manifest.json` (HDRI, Scene, Audio)
- CC-BY Assets aus `docs/assets-shopping.md`
- Fügt automatische Attribution-Hinweise hinzu (z.B. "PolyHaven CC0 empfohlen" für HDRI)

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

## XR (WebXR) einschalten

Das Metaverse unterstützt WebXR für VR-Erlebnisse:

- **Flag:** `VITE_XR_ENABLED=true` in `.env.local`
- **Optional:** `VITE_VE_ENABLED=true` für zukünftige VerseEngine-Integration
- **VR-Button:** Erscheint automatisch oben rechts, wenn WebXR unterstützt wird
- **Debug:** F12-Toggle bleibt auch in VR nutzbar

**Hinweis:** XR verwendet einen Adapter-Pattern, der zwischen Three.js WebXR (Standard) und optionaler VerseEngine-Integration wechseln kann.

## Debug-Overlay

Das Debug-Overlay bietet Entwicklertools während der Entwicklung:

- **Toggle:** F12-Taste (oder Ctrl+F)
- **Flag:** `VITE_DEBUG_ENABLED=true` (standardmäßig in Dev-Mode aktiv)
- **Features:**
  - FPS-Anzeige
  - Draw-Calls
  - GPU-Info
  - Template-Switcher
  - Exposure-Slider (0.1 - 3.0)

## Ambient-Audio-Start

Ambient-Audio startet automatisch nach der ersten User-Interaction (Browser-Autoplay-Policy):

- **Erster Klick/Tastendruck:** Resumiert AudioContext
- **Automatisch:** Ambient-Sounds aus Template-Manifest werden geladen
- **Fade-In:** Sanftes Einblenden der Sounds

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
