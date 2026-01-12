# Umgebungsvariablen

## LiveKit Cloud

- `LIVEKIT_URL`: WebSocket-URL des LiveKit-Servers (z.B. `wss://<your>.livekit.cloud`)
- `LIVEKIT_API_KEY`: API-Key für Token-Generierung
- `LIVEKIT_API_SECRET`: API-Secret für Token-Generierung

## Y-WebSocket

- `YWS_ENABLED`: Aktiviert Y-WebSocket-Endpoint in apps/server (default: true)
- `YWS_PORT`: Port für Y-WebSocket-Server (default: 5179, integriert in apps/server)

## Sentry

- `SENTRY_DSN`: Optional - DSN für Fehlertelemetrie

## NextAuth

- `NEXTAUTH_URL`: Base-URL der Anwendung
- `NEXTAUTH_SECRET`: Secret für Session-Verschlüsselung

## Strapi

- `STRAPI_URL`: Base-URL des Strapi-CMS (default: `http://localhost:1337`)
- `STRAPI_TOKEN`: API-Token für Strapi-Zugriff (erstellen in Strapi Admin → Settings → API Tokens)

## E2E Testing

- `E2E_URL`: Base-URL für E2E-Tests (default: `http://localhost:5173`)
- `E2E_ROOM`: Standard-Raumname für E2E-Tests (default: `plaza`)

## RTC Token API

- `RTC_TOKEN_URL`: URL des RTC Token-Endpoints (default: `http://localhost:8787/token`)
- Wird von der neuen `apps/rtc-api` App bereitgestellt (Port 8787)
- Fallback: Bestehender Endpoint in `apps/server` (`/api/rtc/token`)

## i18n

- `VITE_I18N_DEFAULT`: Standard-Sprache für die UI (default: `de`, Optionen: `de`, `en`)
- Sprache kann in der UI umgeschaltet werden (LangSwitcher)
- Übersetzungen in `apps/web/src/i18n/locales/`

## Dynamic Breakouts

- `VITE_DYNAMIC_BREAKOUTS`: Aktiviert dynamische Breakout-Instanzen (default: `false`)
- MVP verwendet feste Räume/Zonen
- Post-MVP Feature: Automatische Instanz-Zuweisung bei hoher Auslastung
