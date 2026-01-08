# WattWelten Metaverse

Eine professionelle WebXR-Multiplayer-Plattform mit hochwertigen 3D-Umgebungen, Echtzeit-Kommunikation und immersiven Erlebnissen.

## 🚀 Quick Start

```bash
# Installation
pnpm install

# Development
pnpm dev

# Assets & Templates herunterladen
pnpm pipeline:full

# Testing
pnpm test
pnpm e2e
pnpm test:e2e:dev  # E2E-Tests im Dev-Modus
pnpm test:e2e:ui   # E2E-Tests mit UI-Modus
```

## 📚 Dokumentation

- [Projekt-Dokumentation](docs/PROJECT_DOCUMENTATION.md)
- [Roadmap](docs/ROADMAP.md)
- [Nächste Schritte](docs/NEXT_STEPS.md)
- [Professionelle Assets](docs/PROFESSIONAL_ASSETS.md)
- [Template-Katalog](docs/TEMPLATE_CATALOG.md)

## 🎨 Features

- ✅ Multiplayer (Socket.io)
- ✅ Authentication (Username-basiert)
- ✅ File Upload (S3)
- ✅ Professional Assets (PolyHaven)
- ✅ Landscape Templates
- ✅ Zone System
- ✅ WebXR Support

## 🔧 Scripts

```bash
# Templates
pnpm setup:templates          # Template-Registry generieren (templates.json)
pnpm dev:eco                  # Dev-Server mit watt-eco Template

# Assets
pnpm assets:professional      # Professionelle Assets herunterladen
pnpm templates:download       # Landschafts-Templates herunterladen
pnpm optimize:all             # Alle Templates optimieren
pnpm pipeline:full            # Komplette Pipeline (Download + Optimierung)

# Development
pnpm dev                      # Dev-Server starten
pnpm build                    # Production Build
pnpm test                     # Unit Tests
pnpm e2e                      # E2E Tests (alle)
pnpm test:e2e:dev             # E2E-Tests im Dev-Modus (User-Journey)
pnpm test:e2e:ui              # E2E-Tests mit UI-Modus (interaktiv)
```

## 🎯 Template-System

### Template-Registry

Das Template-System unterstützt Hot-Swap von Templates:

1. **Template-Scanning**: `pnpm run setup:templates` scannt alle Templates unter `packages/assets/templates/*/manifest.json` und generiert `apps/web/public/templates.json`

2. **Template-Auswahl**:
   - **Environment Variable**: `VITE_TEMPLATE_ID=watt-eco`
   - **Query-Param**: `?template=watt-eco`
   - **UI-Switcher**: Dropdown in der Topbar (wenn `VITE_TEMPLATE_SWITCH=true`, default: true)
   - **LocalStorage**: Auswahl wird persistiert

3. **Template-Struktur**:
   ```
   packages/assets/templates/
   ├── watt-eco/
   │   ├── manifest.json      # Template-Manifest
   │   ├── scene.glb          # 3D-Szene (optional)
   │   ├── navmesh.glb        # Navmesh für Bewegung (optional, Mesh "NavMesh")
   │   └── ui-skin.css        # UI-Styling (optional)
   ```

### Ready Player Me Integration

- **Avatar-Creator**: Button "Avatar ändern" im Prejoin-Panel öffnet Ready Player Me Creator (iframe)
- **Avatar-Persistierung**: Avatar-URL wird in `prefs.avatarUrl` gespeichert
- **VRM-Support**: Avatare werden mit VRM-Plugin geladen für erweiterte Features (Emotes, Lip-Sync)
- **Fallback**: Bei Fehler wird automatisch ein Kapsel-Avatar erstellt

### Navmesh-Clamp

- **Navmesh-Loading**: Wenn `manifest.assets.navmesh` vorhanden ist, wird `navmesh.glb` geladen
- **Bewegung**: `NavController.clampStep()` verhindert Bewegung außerhalb des Navmesh
- **Fallback**: Wenn kein Navmesh vorhanden, wird prozedurales Navmesh aus Szene generiert

## 🧪 E2E-Tests & Journey Checks

Die E2E-Test-Suite testet die komplette User-Journey:

- **Prejoin Journey**: Login → Avatar → Name → Controls → Enter
- **Movement**: WASD, FP/TP (V), Jump, Seat-Hint
- **Template Switch**: Template-Switcher (UI + Query-Param)
- **Avatar Persistence**: Avatar-URL aus Prefs laden & Nametag
- **Performance**: FPS ≥ 30 auf Desktop

**Ausführung**:

```bash
# Dev-Server starten (Terminal 1)
pnpm dev

# E2E-Tests ausführen (Terminal 2)
pnpm test:e2e:dev

# Oder mit UI-Modus (interaktiv)
pnpm test:e2e:ui
```

**Helper-Funktionen**:

- `completePrejoinJourney()` - Automatisiert komplette User-Journey
- `fpsAbove()` - Prüft FPS (warnt statt fehlzuschlagen)
- `assertNoHardErrors()` - Prüft Console-Errors

## 📖 Weitere Informationen

Siehe [PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md) für Details.
