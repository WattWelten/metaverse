# Production Environment Variables

**Datum:** 2025-01-22  
**Zweck:** Referenz für Production Deployment

## Web Client Environment Variables

Für Vercel, Netlify oder andere Static-Hosting-Provider:

```env
# Template
VITE_TEMPLATE_ID=watt-eco

# Feature Flags
VITE_MULTIPLAYER_ENABLED=true
VITE_XR_ENABLED=true
VITE_VOICE_ENABLED=false
VITE_AI_ENABLED=false
VITE_AMBIENT_AUDIO_ENABLED=false
VITE_DEBUG_ENABLED=false

# Server URL (MUSS nach Server-Deployment gesetzt werden!)
VITE_NET_URL=https://realtime.wattwelten.de

# CMS (optional)
VITE_CMS_PROVIDER=local

# Ready Player Me (optional)
VITE_READY_PLAYER_ME_API_KEY=
VITE_READY_PLAYER_ME_AVATAR_URL=

# wattos_plattform (optional)
VITE_WATTOS_BASE_URL=
VITE_WATTOS_WS_URL=
VITE_WATTOS_API_KEY=
VITE_WATTOS_TENANT=

# Strapi (optional)
VITE_CMS_BASE_URL=
VITE_CMS_TOKEN=
```

## Server Environment Variables

Für Railway, Render, Fly.io oder Docker:

```env
# Client URL (MUSS exakt die Production-Client-URL sein!)
CLIENT_URL=https://mvp.wattwelten.de

# Environment
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

# Optional: Mehrere Client-URLs (komma-separiert)
# CLIENT_URL=https://mvp.wattwelten.de,https://www.wattwelten.de
```

## Deployment-Reihenfolge

### 1. Server zuerst deployen

- Server deployen auf Railway/Render/Fly.io
- Subdomain konfigurieren: `realtime.wattwelten.de`
- HTTPS aktivieren
- Health-Check testen: `curl https://realtime.wattwelten.de/health`

### 2. Client danach deployen

- Client deployen auf Vercel/Netlify
- Domain konfigurieren: `mvp.wattwelten.de`
- HTTPS aktivieren
- **WICHTIG:** `VITE_NET_URL` auf Server-URL setzen
- Client redeployen

### 3. Integration testen

- Client öffnen: `https://mvp.wattwelten.de`
- Multiplayer testen: `?room=test-123`
- Health-Check prüfen

## Vercel-spezifisch

In Vercel Dashboard:

1. Settings → Environment Variables
2. Für "Production" Environment:
   - Alle `VITE_*` Variablen hinzufügen
   - `VITE_NET_URL` nach Server-Deployment setzen
3. Redeploy auslösen

## Railway-spezifisch

In Railway Dashboard:

1. Variables Tab
2. Environment Variables hinzufügen:
   - `CLIENT_URL` (exakt mit `https://`)
   - `NODE_ENV=production`
   - `PORT=3001`
   - `LOG_LEVEL=info`
3. Deploy wird automatisch ausgelöst

## Validierung

### Server Health-Check

```bash
curl https://realtime.wattwelten.de/health

# Erwartet:
# {
#   "status": "ok",
#   "service": "WattWelten Metaverse Server",
#   "version": "0.1.0",
#   "uptime": 123.45,
#   "activeConnections": 0,
#   "memory": { ... }
# }
```

### Client Test

```bash
# Browser öffnen:
https://mvp.wattwelten.de

# Erwartet:
# - Canvas rendert
# - Keine Console-Errors
# - HUD sichtbar
# - Multiplayer funktioniert (falls aktiviert)
```

## Sicherheit

- ✅ Secrets niemals im Repository
- ✅ Environment-Variablen nur in Provider-Dashboard
- ✅ HTTPS überall (automatisch von Providern)
- ✅ CORS nur für Production-Domains

## Troubleshooting

### CORS-Fehler

- Prüfe: `CLIENT_URL` exakt = `https://mvp.wattwelten.de` (keine trailing slash)
- Prüfe: Server erlaubt diese Origin
- Prüfe: HTTPS überall

### WebSocket-Verbindungsfehler

- Prüfe: `VITE_NET_URL` korrekt gesetzt
- Prüfe: Server läuft und erreichbar
- Prüfe: Firewall/Reverse-Proxy erlaubt WebSocket-Upgrade

### Build-Fehler

- Prüfe: Node-Version 20+
- Prüfe: `pnpm-lock.yaml` committed
- Prüfe: Alle Environment-Variablen gesetzt
