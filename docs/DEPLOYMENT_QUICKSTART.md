# Deployment Quickstart

**Schnellstart für Production Deployment**

## 🚀 Schnellstart (5 Minuten)

### 1. Accounts erstellen

- **Vercel:** https://vercel.com → Mit GitHub anmelden
- **Railway:** https://railway.app → Mit GitHub anmelden

### 2. Server deployen (Railway)

1. Railway Dashboard → "New Project" → "Deploy from GitHub repo"
2. Repository: `WattWelten/metaverse`
3. Service konfigurieren:
   - Root: `apps/server`
   - Build: `pnpm build`
   - Start: `pnpm start`
4. Variables setzen:
   ```env
   CLIENT_URL=https://mvp.wattwelten.de
   NODE_ENV=production
   PORT=3001
   ```
5. Custom Domain: `realtime.wattwelten.de`
6. Health-Check: `curl https://realtime.wattwelten.de/health`

### 3. Client deployen (Vercel)

1. Vercel Dashboard → "Add New Project"
2. Repository: `WattWelten/metaverse`
3. Build-Konfiguration:
   - Root: `apps/web`
   - Build: `pnpm build`
   - Output: `dist`
4. Variables setzen:
   ```env
   VITE_TEMPLATE_ID=watt-eco
   VITE_MULTIPLAYER_ENABLED=true
   VITE_XR_ENABLED=true
   VITE_DEBUG_ENABLED=false
   VITE_NET_URL=https://realtime.wattwelten.de
   ```
5. Custom Domain: `mvp.wattwelten.de`
6. Test: `https://mvp.wattwelten.de`

## ✅ Validierung

```bash
# Server Health-Check
curl https://realtime.wattwelten.de/health

# Client Test
curl -I https://mvp.wattwelten.de

# Multiplayer Test
# Öffne 2 Browser-Tabs: https://mvp.wattwelten.de?room=test-123
```

## 📚 Detaillierte Anleitung

Siehe `docs/DEPLOYMENT_STATUS.md` für vollständige Checkliste.
