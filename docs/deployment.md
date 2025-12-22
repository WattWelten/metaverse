# Deployment Guide

Dieses Dokument beschreibt die Deployment-Schritte für das WattWelten Metaverse MVP.

## Übersicht

Das MVP besteht aus zwei Hauptkomponenten:

1. **Web Client** (`apps/web`) - Statische Web-App (Vite + React + Three.js)
2. **Realtime Server** (`apps/server`) - Socket.io Multiplayer-Server

## Web Client Deployment

### Option 1: Vercel

1. **Repository verbinden:**
   - Gehe zu [Vercel](https://vercel.com)
   - Verbinde dein GitHub-Repository
   - Wähle das Root-Verzeichnis

2. **Build-Konfiguration:**
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/web`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

3. **Environment Variables:**
   - Füge alle Variablen aus `.env.production.example` hinzu
   - Wichtig: `VITE_SERVER_URL` muss auf deinen Realtime-Server zeigen

4. **Deploy:**
   - Klicke auf "Deploy"
   - Vercel erstellt automatisch HTTPS-Zertifikate

### Option 2: Netlify

1. **Repository verbinden:**
   - Gehe zu [Netlify](https://netlify.com)
   - Verbinde dein GitHub-Repository

2. **Build-Konfiguration:**
   - **Base directory**: `apps/web`
   - **Build command**: `pnpm build`
   - **Publish directory**: `apps/web/dist`

3. **Environment Variables:**
   - Füge alle Variablen aus `.env.production.example` hinzu

4. **Deploy:**
   - Klicke auf "Deploy site"

### Option 3: S3 + CloudFront

1. **Build lokal:**

   ```bash
   cd apps/web
   pnpm build
   ```

2. **Upload zu S3:**

   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **CloudFront konfigurieren:**
   - Origin: S3 Bucket
   - HTTPS: Aktivieren
   - Custom Error Pages: `/index.html` für 404

## Realtime Server Deployment

### Option 1: Railway

1. **Repository verbinden:**
   - Gehe zu [Railway](https://railway.app)
   - Verbinde dein GitHub-Repository

2. **Service erstellen:**
   - Wähle "New Project" → "Deploy from GitHub repo"
   - Wähle dein Repository

3. **Konfiguration:**
   - **Root Directory**: `apps/server`
   - **Build Command**: `pnpm build`
   - **Start Command**: `pnpm start`
   - **Port**: `3001`

4. **Environment Variables:**
   - `CLIENT_URL`: Deine Web-Client-URL (komma-separiert für mehrere)
   - `NODE_ENV`: `production`
   - `PORT`: `3001`
   - `LOG_LEVEL`: `info`

5. **Deploy:**
   - Railway deployt automatisch bei jedem Push

### Option 2: Render

1. **Service erstellen:**
   - Gehe zu [Render](https://render.com)
   - Wähle "New Web Service"
   - Verbinde dein GitHub-Repository

2. **Konfiguration:**
   - **Root Directory**: `apps/server`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Environment**: `Node`

3. **Environment Variables:**
   - Siehe Railway-Konfiguration

### Option 3: Fly.io

1. **Install Fly CLI:**

   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login:**

   ```bash
   fly auth login
   ```

3. **App erstellen:**

   ```bash
   cd apps/server
   fly launch
   ```

4. **Dockerfile verwenden:**
   - Das vorhandene `Dockerfile` wird automatisch verwendet

5. **Environment Variables setzen:**
   ```bash
   fly secrets set CLIENT_URL=https://your-client-domain.com
   fly secrets set NODE_ENV=production
   ```

### Option 4: Docker (eigener Server)

1. **Build Image:**

   ```bash
   cd apps/server
   docker build -t wattwelten-server .
   ```

2. **Container starten:**
   ```bash
   docker run -d \
     -p 3001:3001 \
     -e CLIENT_URL=https://your-client-domain.com \
     -e NODE_ENV=production \
     -e PORT=3001 \
     --name wattwelten-server \
     wattwelten-server
   ```

## DNS & HTTPS Konfiguration

### Web Client

1. **Domain hinzufügen:**
   - In Vercel/Netlify: Settings → Domains
   - Füge deine Domain hinzu (z.B. `mvp.wattwelten.de`)
   - Folge den DNS-Anweisungen

2. **HTTPS:**
   - Wird automatisch von Vercel/Netlify bereitgestellt

### Realtime Server

1. **Subdomain erstellen:**
   - Erstelle einen A-Record oder CNAME für `realtime.wattwelten.de`
   - Zeige auf die IP-Adresse deines Servers

2. **HTTPS mit Let's Encrypt:**

   ```bash
   # Mit Certbot
   certbot certonly --standalone -d realtime.wattwelten.de
   ```

3. **Nginx Reverse Proxy (optional):**

   ```nginx
   server {
     listen 443 ssl;
     server_name realtime.wattwelten.de;

     ssl_certificate /etc/letsencrypt/live/realtime.wattwelten.de/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/realtime.wattwelten.de/privkey.pem;

     location / {
       proxy_pass http://localhost:3001;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
       proxy_set_header Host $host;
     }
   }
   ```

## Environment Variables Setup

### Web Client (.env.production)

```bash
VITE_TEMPLATE_ID=watt-eco
VITE_MULTIPLAYER_ENABLED=true
VITE_XR_ENABLED=true
VITE_VOICE_ENABLED=true
VITE_DEBUG_ENABLED=false
VITE_SERVER_URL=https://realtime.wattwelten.de
```

### Realtime Server

```bash
CLIENT_URL=https://mvp.wattwelten.de
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
```

## Health Checks

### Web Client

- URL: `https://mvp.wattwelten.de`
- Erwartet: Canvas wird gerendert, keine kritischen Fehler

### Realtime Server

- URL: `https://realtime.wattwelten.de/health`
- Erwartet: JSON mit `status: "ok"`, `activeConnections`, `memory`

## Monitoring

### Uptime Monitoring

- Verwende einen Service wie UptimeRobot oder Pingdom
- Prüfe `/health` Endpoint alle 5 Minuten

### Error Tracking (Optional)

- Sentry: Füge `VITE_SENTRY_DSN` hinzu
- Server-Logs: Prüfe Logs regelmäßig

## Rollback

### Vercel/Netlify

- Gehe zu Deployments
- Wähle vorherige Version
- Klicke auf "Promote to Production"

### Railway/Render

- Gehe zu Deployments
- Wähle vorherige Version
- Klicke auf "Redeploy"

## Troubleshooting

### CORS-Fehler

- Stelle sicher, dass `CLIENT_URL` auf dem Server korrekt gesetzt ist
- Prüfe, ob die Domain exakt übereinstimmt (inkl. `https://`)

### WebSocket-Verbindungsfehler

- Prüfe, ob der Server läuft: `curl https://realtime.wattwelten.de/health`
- Prüfe Firewall-Regeln (Port 3001 oder 443)
- Prüfe Reverse-Proxy-Konfiguration (WebSocket-Upgrade)

### Build-Fehler

- Prüfe Node-Version (sollte 20+ sein)
- Prüfe `pnpm-lock.yaml` ist committed
- Prüfe Environment Variables sind gesetzt

## Nächste Schritte

Nach erfolgreichem Deployment:

1. Teste alle Features (Multiplayer, Voice, Avatare)
2. Führe E2E Smoke Tests aus
3. Überwache Logs und Error-Rate
4. Skaliere Server bei Bedarf (Horizontal Scaling)
