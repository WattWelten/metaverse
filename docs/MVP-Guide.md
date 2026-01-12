# MVP Guide

## Quick Start

1. `pnpm i`
2. `pnpm -w build`
3. `cp .env.example .env.local` und Werte ausfüllen (siehe `docs/ENV.md`)
4. `pnpm -w dev` (startet alle Apps: web, server, rtc-api)
   - Oder einzeln: `pnpm dev:client`, `pnpm dev:server`, `pnpm dev:rtc-api`
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

## RTC Token API

Die neue `apps/rtc-api` App stellt den Token-Endpoint bereit (Port 8787):

- **Endpoint**: `POST /token` (siehe `RTC_TOKEN_URL` in `.env`)
- **Request Body**: `{ roomId, userId, displayName, role }`
- **Response**: `{ url, token, role }`

Fallback: Bestehender Endpoint in `apps/server` (`/api/rtc/token`) bleibt verfügbar.

## i18n (Internationalisierung)

- **Standard-Sprache**: `VITE_I18N_DEFAULT=de` (oder `en`)
- **Sprache umschalten**: LangSwitcher in der UI (oben rechts)
- **Übersetzungen**: `apps/web/src/i18n/locales/de.json` und `en.json`
- **Verwendung**: `import { t } from '@/i18n'` → `t('join')` gibt "Beitreten" (DE) oder "Join" (EN)

## Zone Router

Der ZoneRouter (`packages/voice/src/zone-router.ts`) verwaltet Audio-Subscriptions basierend auf Zonen:

- **Cross-Zone**: Unsubscribe (kein Cross-Leak)
- **Gleiche Zone**: Subscribe mit Distance-Attenuation
- **Integration**: Automatisch in `apps/web/src/World.ts`
