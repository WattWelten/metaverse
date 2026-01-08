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
pnpm e2e                      # E2E Tests
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

## 📖 Weitere Informationen

Siehe [PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md) für Details.
