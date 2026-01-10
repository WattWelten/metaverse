# Contributing Guide

## Entwicklungsumgebung

### Voraussetzungen

- Node.js >= 20.11.1
- pnpm >= 8.15.0

### Setup

```bash
# Dependencies installieren
pnpm install

# Build aller Packages
pnpm -w build

# Development Server starten
pnpm -w dev
```

## Code-Quality Standards

### TypeScript

- Strict Mode aktiviert
- Keine unkommentierten `any` Types
- Alle Dateien müssen TypeScript-konform sein

### Linting & Formatting

```bash
# Lint prüfen
pnpm -w lint

# Format prüfen
pnpm -w format:check

# Format anwenden
pnpm -w format
```

### Testing

```bash
# Unit Tests
pnpm -w test

# E2E Tests
pnpm -w e2e

# E2E Tests im Dev-Modus
pnpm test:e2e:dev
```

## Architektur-Prinzipien

### Monorepo-Struktur

- `apps/*` - Anwendungen (web, server)
- `packages/*` - Wiederverwendbare Packages

### Provider-Pattern

- Alle externen Services über Interfaces abstrahiert
- Keine direkten Abhängigkeiten zu Vendor-SDKs in Business-Logic
- Feature-Flags für alle Provider

### Feature-Flags

Alle Features sind über Environment-Variablen steuerbar:

- `VITE_XR_ENABLED` - WebXR Support
- `VITE_VOICE_ENABLED` - Voice Chat
- `VITE_AI_ENABLED` - AI Integration
- `VITE_CMS_PROVIDER` - Content Provider (local | strapi)
- `VITE_TEMPLATE_ID` - Standard-Template

## Branching

- Base: `feat/auto-setup-mvp`
- PR-Branches: `pr/<kurz-thema>` (z. B. `pr/sfu-livekit`)

## Commit-Messages

Wir verwenden [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: neue Feature-Beschreibung
fix: Bugfix-Beschreibung
docs: Dokumentations-Änderung
refactor: Code-Refactoring
test: Test-Änderungen
chore: Build/Config-Änderungen
```

## Pull Requests

1. Branch von `feat/auto-setup-mvp` erstellen
2. Änderungen implementieren
3. Tests schreiben/aktualisieren
4. Lint & Typecheck prüfen
5. PR erstellen mit beschreibendem Titel (semantic PR Titel erforderlich)
6. CI muss grün sein
7. PR-Checkliste im Template abhaken

## PR-Checkliste

- [ ] CI grün
- [ ] ENV/Doku aktualisiert
- [ ] Smoke/E2E (wo sinnvoll)
- [ ] Acceptance-Criteria im PR erfüllt

## Lokale Entwicklung (Schnellstart)

```bash
pnpm i && pnpm -w build
pnpm --filter @metaverse/server dev     # Token-API
pnpm --filter @metaverse/web dev        # Web-Client
```

## Performance-Ziele

- Desktop: p90 ≥ 50 FPS
- Mobile: p90 ≥ 40 FPS
- Join-Zeit: p90 < 6s (bei gecachten Assets)

## Security

- Keine Secrets im Repository
- Mic-Aktivierung nur nach User-Consent
- PII vermeiden wo möglich
- Kein Vendor Lock-in
