# Validierung & Qualitätssicherung

Dieses Dokument beschreibt die verschiedenen Validierungs-Scripts und Tools, die im Projekt verwendet werden, um Code-Qualität, Build-Erfolg und Konfiguration zu überprüfen.

## Übersicht

Das Projekt verwendet mehrere Validierungs-Scripts:

1. **`scripts/validate-build.ts`** - Umfassende Build- und Code-Qualitäts-Validierung
2. **`scripts/health.ts`** - Health-Check für Projekt-Struktur und Konfiguration
3. **`scripts/validate-templates.ts`** - Template-Validierung
4. **`scripts/import-template.js`** - Manifest-Validierung beim Template-Import

## validate-build.ts

Umfassendes Validierungs-Script für Build-Fehlerprüfung und Code-Qualität.

### Verwendung

```bash
# Alle Phasen ausführen
pnpm run validate

# Spezifische Phase ausführen
pnpm run validate:types    # TypeScript-Validierung
pnpm run validate:lint     # ESLint-Validierung
pnpm run validate:build    # Build-Validierung
pnpm run validate:tests    # Test-Validierung

# Oder direkt mit tsx
tsx scripts/validate-build.ts types    # TypeScript-Validierung
tsx scripts/validate-build.ts lint     # ESLint-Validierung
tsx scripts/validate-build.ts build    # Build-Validierung
tsx scripts/validate-build.ts test     # Test-Validierung
tsx scripts/validate-build.ts deps      # Dependency-Validierung
tsx scripts/validate-build.ts assets    # Asset-Validierung
tsx scripts/validate-build.ts env       # Environment-Validierung
tsx scripts/validate-build.ts ci        # CI-Validierung
tsx scripts/validate-build.ts prod      # Production-Validierung
```

### Phasen

#### Phase 1: TypeScript-Validierung

- Prüft `tsconfig.base.json` auf erforderliche Compiler-Optionen
- Validiert: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noUncheckedIndexedAccess`, `noImplicitOverride`
- Führt `pnpm typecheck` aus

#### Phase 2: ESLint-Validierung

- Führt `pnpm lint` aus
- Prüft auf Linting-Fehler

#### Phase 3: Build-Validierung

- Führt `pnpm clean` aus
- Führt `pnpm build` aus
- Prüft Build-Outputs für alle Packages und Apps

#### Phase 4: Test-Validierung

- Führt `pnpm test` aus
- Prüft auf fehlgeschlagene Tests

#### Phase 5: Dependency-Validierung

- Prüft `package.json` auf fehlende oder veraltete Dependencies
- Validiert Workspace-Struktur

#### Phase 6: Asset-Validierung

- Prüft Template-Assets auf Existenz
- Validiert Asset-Pfade in Manifests

#### Phase 7: Environment-Validierung

- Prüft `.env.example` auf Vollständigkeit
- Validiert Feature-Flags

#### Phase 8: CI-Validierung

- Prüft `.github/workflows/ci.yml` auf Korrektheit
- Validiert CI-Pipeline-Konfiguration

#### Phase 9: Production-Validierung

- Prüft Production-Builds
- Validiert Bundle-Größen
- Prüft auf Production-only Dependencies

### Ausgabe

Das Script gibt eine Zusammenfassung aus:

- Anzahl erfolgreicher/fehlgeschlagener Phasen
- Dauer jeder Phase
- Fehlerdetails bei Fehlschlägen

## health.ts

Health-Check für Projekt-Struktur, Konfiguration und Features.

### Verwendung

```bash
pnpm run health
```

### Checks

#### Runtime-Versionen

- Node.js Version
- pnpm Version
- Three.js Version

#### Package-Struktur

- Anzahl Packages
- Package-Warnungen

#### Projekt-Struktur

- Fehlende Verzeichnisse/Dateien
- Workspace-Struktur

#### Rendering-Konfiguration

- Tone Mapping (ACESFilmic)
- Color Space (sRGB)
- Physically Correct Lights
- Exposure (1.0)

#### Feature-Flags

- Alle Feature-Flags aus `.env.example`
- Template-ID
- Multiplayer-Status
- Voice-Status
- XR-Status
- etc.

#### CI/CD

- GitHub Workflows
- CI-Status

#### Dokumentation

- Dokumentations-Dateien
- Coverage

#### Features

- LOD-Support
- GLTF-Loader (createGLTFLoader)
- Decoder-Dateien (Draco, KTX2)
- XR-Adapter

#### Collaboration

- Voice Provider
- LiveKit Provider
- Whiteboard Client
- Pinboard
- Room Utils
- Server Token Endpoint

#### Templates

- watt-eco Template
- watt-default Template
- Fallback-Logik

#### Environment

- `.env.local` Existenz
- Template-ID in `.env.local`

#### Decoder-Dateien

- Draco-Dateien
- KTX2-Dateien

#### Build-Validierung

- TypeScript-Status
- ESLint-Status
- Build-Status
- Test-Status

### Ausgabe

Das Script generiert `docs/health-report.md` mit:

- Strukturierter JSON-Ausgabe
- Status für jeden Check
- Warnungen und Fehler

## validate-templates.ts

Template-Validierung für alle Templates im Projekt.

### Verwendung

```bash
pnpm run validate:templates
```

### Validierung

Für jedes Template wird geprüft:

- Manifest-Existenz
- Manifest-Validität (JSON-Syntax)
- Erforderliche Felder (`name`, `version`)
- Asset-Existenz (scene, hdri, etc.)
- Asset-Pfade

### Ausgabe

- Liste aller Templates
- Status für jedes Template
- Fehlerdetails bei Fehlschlägen

## import-template.js

Manifest-Validierung beim Template-Import.

### Validierung

- Erforderliche Felder (`name`, `version`)
- Feld-Typen (String, SemVer)
- Referenzierte Assets (Warnungen bei fehlenden Assets)

### Verwendung

Wird automatisch beim Template-Import ausgeführt:

```bash
node scripts/import-template.js <source-dir> <template-id>
```

## Integration in CI/CD

Alle Validierungs-Scripts sind in die CI-Pipeline integriert:

```yaml
# .github/workflows/ci.yml
- name: TypeScript Check
  run: pnpm typecheck

- name: Lint
  run: pnpm lint

- name: Tests
  run: pnpm test

- name: Build
  run: pnpm build

- name: Validate Build
  run: pnpm run validate:build
```

## Best Practices

1. **Vor jedem Commit**: Führe `pnpm run validate:build` aus
2. **Vor jedem PR**: Führe `pnpm run health` aus und prüfe den Health-Report
3. **Bei Template-Änderungen**: Führe `pnpm run validate:templates` aus
4. **Bei Konfigurations-Änderungen**: Prüfe Health-Report auf neue Warnungen

## Troubleshooting

### Build-Validierung schlägt fehl

1. Prüfe TypeScript-Fehler: `pnpm typecheck`
2. Prüfe Linting-Fehler: `pnpm lint`
3. Prüfe Build-Fehler: `pnpm build`
4. Prüfe Test-Fehler: `pnpm test`

### Health-Check zeigt Warnungen

1. Prüfe `.env.example` auf fehlende Flags
2. Prüfe Template-Struktur
3. Prüfe Decoder-Dateien: `pnpm run setup:decoders`
4. Prüfe Build-Outputs: `pnpm build`

### Template-Validierung schlägt fehl

1. Prüfe Manifest-JSON-Syntax
2. Prüfe Asset-Pfade im Manifest
3. Prüfe Asset-Existenz im Template-Verzeichnis
4. Prüfe erforderliche Felder (`name`, `version`)

## Weitere Informationen

- [Architektur-Dokumentation](./architecture.md)
- [Template-Dokumentation](./templates.md)
- [Deployment-Dokumentation](./deployment.md)
