# Deployment Status

**Datum:** 2025-01-22  
**Status:** Vorbereitung für Production Deployment

## Production URLs

- **Web Client:** https://mvp.wattwelten.de (zu konfigurieren)
- **Realtime Server:** https://realtime.wattwelten.de (zu konfigurieren)
- **Health-Check:** https://realtime.wattwelten.de/health (zu konfigurieren)

## Deployment-Provider

### Web Client

- **Provider:** Vercel (empfohlen) oder Netlify
- **Repository:** https://github.com/WattWelten/metaverse
- **Root Directory:** `apps/web`
- **Build Command:** `pnpm build`
- **Output Directory:** `dist`

### Realtime Server

- **Provider:** Railway (empfohlen) oder Render/Fly.io
- **Repository:** https://github.com/WattWelten/metaverse
- **Root Directory:** `apps/server`
- **Build Command:** `pnpm build`
- **Start Command:** `pnpm start`
- **Port:** `3001`

## Environment Variables

### Web Client (Vercel/Netlify)

```env
VITE_TEMPLATE_ID=watt-eco
VITE_MULTIPLAYER_ENABLED=true
VITE_XR_ENABLED=true
VITE_VOICE_ENABLED=false
VITE_DEBUG_ENABLED=false
VITE_NET_URL=https://realtime.wattwelten.de
```

**Wichtig:** `VITE_NET_URL` muss nach Server-Deployment gesetzt werden!

### Server (Railway/Render/Fly.io)

```env
CLIENT_URL=https://mvp.wattwelten.de
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
```

**Wichtig:** `CLIENT_URL` muss exakt die Client-URL sein (mit `https://`)

## Deployment-Checkliste

### Phase 1: Web Client

- [ ] Vercel/Netlify Account erstellt
- [ ] Repository verbunden
- [ ] Build-Konfiguration gesetzt
- [ ] Environment-Variablen gesetzt (außer `VITE_NET_URL`)
- [ ] Erster Deploy erfolgreich
- [ ] Domain konfiguriert (`mvp.wattwelten.de`)
- [ ] HTTPS aktiv

### Phase 2: Server

- [ ] Railway/Render/Fly.io Account erstellt
- [ ] Repository verbunden
- [ ] Service konfiguriert
- [ ] Environment-Variablen gesetzt
- [ ] Deploy erfolgreich
- [ ] Subdomain konfiguriert (`realtime.wattwelten.de`)
- [ ] HTTPS aktiv

### Phase 3: Integration

- [ ] `VITE_NET_URL` auf Server-URL aktualisiert
- [ ] Client redeployed
- [ ] Health-Check funktioniert: `curl https://realtime.wattwelten.de/health`
- [ ] End-to-End Test erfolgreich
- [ ] Multiplayer funktioniert (2 Clients im selben Room)

### Phase 4: Validierung

- [ ] Client lädt korrekt: `https://mvp.wattwelten.de`
- [ ] Canvas rendert
- [ ] Keine Console-Errors
- [ ] Multiplayer funktioniert
- [ ] Voice funktioniert (falls aktiviert)
- [ ] XR funktioniert (falls aktiviert)

## DNS-Konfiguration

### Web Client (mvp.wattwelten.de)

- **Typ:** CNAME oder A-Record
- **Wert:** Vercel/Netlify Domain (z.B. `cname.vercel-dns.com`)
- **TTL:** 3600 (Standard)

### Server (realtime.wattwelten.de)

- **Typ:** CNAME oder A-Record
- **Wert:** Railway/Render Domain (z.B. `xxx.up.railway.app`)
- **TTL:** 3600 (Standard)

## Troubleshooting

### CORS-Fehler

- Prüfe: `CLIENT_URL` auf Server exakt = `https://mvp.wattwelten.de`
- Prüfe: Keine trailing slashes
- Prüfe: HTTPS überall

### WebSocket-Verbindungsfehler

- Prüfe: Server läuft (`curl https://realtime.wattwelten.de/health`)
- Prüfe: `VITE_NET_URL` korrekt gesetzt
- Prüfe: Firewall/Reverse-Proxy erlaubt WebSocket-Upgrade

### Build-Fehler

- Prüfe: Node-Version 20+
- Prüfe: `pnpm-lock.yaml` committed
- Prüfe: Environment-Variablen gesetzt

## Monitoring

### Uptime-Monitoring (empfohlen)

- **Service:** UptimeRobot oder Pingdom
- **Endpoints:**
  - `https://mvp.wattwelten.de` (alle 5 Min)
  - `https://realtime.wattwelten.de/health` (alle 5 Min)

### Error-Tracking (optional)

- **Service:** Sentry
- **Client:** `VITE_SENTRY_DSN` hinzufügen
- **Server:** Sentry SDK integrieren

## Rollback-Plan

### Vercel/Netlify

1. Gehe zu Deployments
2. Wähle vorherige Version
3. "Promote to Production" klicken

### Railway/Render

1. Gehe zu Deployments
2. Wähle vorherige Version
3. "Redeploy" klicken

## Nächste Schritte

Nach erfolgreichem Deployment:

1. ✅ Monitoring einrichten
2. ⏳ Performance-Benchmarks (FPS)
3. ⏳ Load-Tests (10+ Clients)
4. ⏳ Error-Tracking (optional)
