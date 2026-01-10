# MVP Guide

## Quick Start

1. `pnpm i`
2. `pnpm -w build`
3. `cp .env.example .env.local` und Werte ausfüllen
4. `pnpm -w dev`
5. Öffne `/demo/plaza` (web) & Smartphone `/remote` (QR scannen)

## Demos

- **Plaza**: Stage + 2 Breakouts + Audio-Beacons
- **Meeting**: Whiteboard, Markdown, Screenshare

## Szenen bauen (No-Code)

1. Strapi öffnen → Scene Collection
2. Neue Scene anlegen (Name, Assets, Spawn, Zones)
3. Publish → automatisch im Client verfügbar

## Host-Flow (Moderation)

1. Als Host einloggen (NextAuth)
2. Raum erstellen → Token mit Host-Rolle
3. Moderation-Panel öffnen → Mute-All, Kick, Spotlight, Raise-Hand

## Companion-Phone

1. Desktop: QR-Code im HUD anzeigen
2. Phone: `/remote` öffnen → QR scannen
3. Pairing < 5s → PTT, Controller, Camera verfügbar

## Smoke & E2E

### Smoke (Node)

- `pnpm smoke` führt drei Checks aus: RTC-Token, YWS-WebSocket, Strapi-Endpoint.
- Einzelne Checks: `pnpm smoke:rtc`, `pnpm smoke:yws`, `pnpm smoke:strapi`

### E2E (Playwright)

- `pnpm e2e` öffnet 4 Projekte (3× Desktop, 1× Mobile) und prüft Basisfunktionen.
- Passe bei Bedarf Selektoren in `e2e/mvp-smoke.spec.ts` an eure UI (Join-Flow).
- UI-Modus: `pnpm test:e2e:ui`

## Seeds (Strapi)

1. Strapi starten (Docker Compose im Ordner `strapi/`).
2. API-Token erstellen (Settings → API Tokens).
3. `.env.local` mit `STRAPI_TOKEN` füllen.
4. `node scripts/seed-strapi.mjs`.
