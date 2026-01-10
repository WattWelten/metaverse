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
