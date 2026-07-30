# Deployment Guide - Schritt für Schritt

## Voraussetzungen

### Accounts erstellen

1. **Vercel:** https://vercel.com (mit GitHub anmelden)
2. **Railway:** https://railway.app (mit GitHub anmelden)

### CLI Tools installieren (optional)

```bash
# Vercel CLI
npm i -g vercel

# Railway CLI
npm i -g @railway/cli
```

## Phase 1: Server Deployment (Railway)

### Schritt 1.1: Railway Setup

1. **In Railway Dashboard:**
   - "New Project" → "Deploy from GitHub repo"
   - Repository auswählen: `WattWelten/metaverse`
   - Service erstellen

2. **Service konfigurieren:**
   - **Root Directory:** `apps/server`
   - **Build Command:** `pnpm build`
   - **Start Command:** `pnpm start`
   - **Port:** `3001`

### Schritt 1.2: Environment Variables setzen

In Railway Dashboard → Variables Tab:

```env
CLIENT_URL=https://mvp.wattwelten.de
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
```

**Wichtig:** `CLIENT_URL` muss exakt die Client-URL sein (mit `https://`, keine trailing slash)

### Schritt 1.3: Deploy

- Railway deployt automatisch
- Warte auf Build-Abschluss
- Notiere die URL (z.B. `xxx.up.railway.app`)

### Schritt 1.4: Subdomain konfigurieren

1. **In Railway:** Settings → Networking → Custom Domain
2. **Domain hinzufügen:** `realtime.wattwelten.de`
3. **DNS konfigurieren:**
   - In deinem DNS-Provider:
   - CNAME: `realtime` → Railway-Domain
4. **HTTPS:** Automatisch von Railway bereitgestellt

### Schritt 1.5: Health-Check testen

```bash
curl https://realtime.wattwelten.de/health
```

**Erwartet:**

```json
{
  "status": "ok",
  "service": "WattWelten Metaverse Server",
  "version": "0.1.0",
  ...
}
```

## Phase 2: Web Client Deployment (Vercel)

### Schritt 2.1: Vercel Setup

1. **In Vercel Dashboard:**
   - "Add New Project"
   - GitHub-Repository auswählen: `WattWelten/metaverse`
   - "Import" klicken

2. **Build-Konfiguration:**
   - **Framework Preset:** Vite
   - **Root Directory:** `apps/web`
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install`

### Schritt 2.2: Environment Variables setzen

In Vercel Dashboard → Settings → Environment Variables:

```env
VITE_TEMPLATE_ID=watt-eco
VITE_MULTIPLAYER_ENABLED=true
VITE_XR_ENABLED=true
VITE_VOICE_ENABLED=false
VITE_DEBUG_ENABLED=false
VITE_NET_URL=https://realtime.wattwelten.de
```

**Wichtig:** `VITE_NET_URL` muss die Server-URL sein (aus Schritt 1.4)

### Schritt 2.3: Erster Deploy

- "Deploy" klicken
- Warte auf Build-Abschluss
- Notiere die URL (z.B. `mvp-wattwelten.vercel.app`)

### Schritt 2.4: Domain konfigurieren

1. **In Vercel:** Settings → Domains
2. **Domain hinzufügen:** `mvp.wattwelten.de`
3. **DNS konfigurieren:**
   - In deinem DNS-Provider:
   - CNAME: `mvp` → `cname.vercel-dns.com`
   - Oder A-Record wie von Vercel angegeben
4. **HTTPS:** Automatisch von Vercel bereitgestellt

## Phase 3: Integration & Validierung

### Schritt 3.1: End-to-End Test

1. **Client öffnen:**

   ```
   https://mvp.wattwelten.de
   ```

2. **Erwartet:**
   - Canvas rendert
   - Keine Console-Errors
   - HUD sichtbar

3. **Multiplayer testen:**
   - Browser Tab 1: `https://mvp.wattwelten.de?room=test-123`
   - Browser Tab 2: `https://mvp.wattwelten.de?room=test-123`
   - Beide Clients sollten sich sehen

### Schritt 3.2: Health-Check validieren

```bash
# Server
curl https://realtime.wattwelten.de/health

# Client (sollte 200 zurückgeben)
curl -I https://mvp.wattwelten.de
```

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

## Nächste Schritte nach Deployment

1. ✅ Monitoring einrichten (UptimeRobot/Pingdom)
2. ⏳ Performance-Benchmarks (FPS)
3. ⏳ Load-Tests (10+ Clients)
4. ⏳ Error-Tracking (optional: Sentry)
