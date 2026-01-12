# Strapi Setup Guide – WattWelten Metaverse

**Version:** 1.0  
**Datum:** 2026-01-12  
**Ziel:** Vollständige Anleitung für Strapi-Setup und -Integration

---

## 📋 Übersicht

Dieser Guide führt dich durch die komplette Strapi-Integration für das WattWelten Metaverse:

1. **Docker-Setup** (PostgreSQL)
2. **Strapi-Installation**
3. **Content-Type-Registrierung**
4. **API-Permissions**
5. **Seeding**
6. **Webhook-Konfiguration**

---

## 🚀 Quick Start

### Voraussetzungen

- Docker & Docker Compose installiert
- Node.js 18+ installiert
- PostgreSQL-Port 5433 frei (oder ändere in `strapi/docker-compose.yml`)

### Schritt 1: Docker starten

```bash
cd strapi
docker-compose up -d
```

**Prüfen:**

```bash
docker ps | grep postgres
# Sollte PostgreSQL-Container zeigen
```

### Schritt 2: Strapi installieren

```bash
cd strapi/app
npm install
```

### Schritt 3: Environment konfigurieren

Kopiere `.env.example` zu `.env` (falls nicht vorhanden):

```bash
cp .env.example .env
```

**Wichtige Variablen:**

```env
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi
```

### Schritt 4: Strapi starten

```bash
npm run develop
```

**Erwartete Ausgabe:**

```
✅ Strapi is running at http://localhost:1337
✅ Bootstrap script executed
✅ Permissions seeded (DEV)
```

### Schritt 5: Automatisches Setup

```bash
# Im Root-Verzeichnis
node scripts/setup-strapi-simple.mjs
```

**Was passiert:**

- ✅ Login zu Strapi Admin
- ✅ API Token erstellen/abrufen
- ✅ Token in `.env.local` speichern
- ✅ Permissions werden automatisch via Bootstrap gesetzt

### Schritt 6: Content Types registrieren

**Wichtig:** Content Types müssen einmalig in der Admin-UI gespeichert werden:

1. Öffne: http://localhost:1337/admin
2. Gehe zu: **Content-Type Builder**
3. Für jeden Content Type:
   - Klicke auf den Content Type
   - Klicke auf **"Save"** (auch wenn nichts geändert wurde)
4. Starte Strapi neu: `npm run develop`

**Content Types:**

- `Scene`
- `Asset`
- `Zone`
- `Portal`
- `Audio-Beacon`

### Schritt 7: Seeds ausführen

```bash
node scripts/seed-strapi.mjs
```

**Erwartete Ausgabe:**

```
✅ Assets created: 5
✅ Zones created: 3
✅ Audio Beacons created: 2
✅ Portals created: 2
✅ Scenes created: 1
```

### Schritt 8: API testen

```bash
curl http://localhost:1337/api/scenes
```

**Erwartete Antwort:**

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "Watt Eco",
        ...
      }
    }
  ]
}
```

### Schritt 9: Webhook konfigurieren

```bash
node scripts/setup-strapi-webhook.mjs
```

**Was passiert:**

- ✅ Webhook erstellt für Content Refresh
- ✅ Events: `entry.publish`, `entry.unpublish`, `entry.update`
- ✅ Target: `http://localhost:3001/api/content/refresh`

---

## 📚 Detaillierte Anleitung

### Docker-Setup

#### PostgreSQL Container

**Datei:** `strapi/docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: strapi
      POSTGRES_USER: strapi
      POSTGRES_PASSWORD: strapi
    ports:
      - '5433:5432' # Port 5433 um Konflikte zu vermeiden
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Start:**

```bash
cd strapi
docker-compose up -d
```

**Stop:**

```bash
docker-compose down
```

**Reset (⚠️ Löscht alle Daten):**

```bash
docker-compose down -v
docker-compose up -d
```

---

### Strapi-Installation

#### Erste Installation

```bash
cd strapi/app
npm install
```

#### Dependencies aktualisieren

```bash
npm update
```

#### PostgreSQL Driver

Strapi benötigt den `pg` Driver:

```bash
npm install pg
```

---

### Environment-Konfiguration

#### `.env` Datei

**Pfad:** `strapi/app/.env`

**Minimale Konfiguration:**

```env
# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi

# App
HOST=0.0.0.0
PORT=1337
APP_KEYS=...  # Wird bei Installation generiert
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
JWT_SECRET=...
```

**Generierung von Secrets:**

```bash
# In strapi/app
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

### Content-Type-Registrierung

#### Problem

Strapi v5 erfordert, dass Content Types einmalig in der Admin-UI gespeichert werden, bevor sie via API verfügbar sind.

#### Lösung

**Manuell (empfohlen):**

1. Öffne Strapi Admin: http://localhost:1337/admin
2. Gehe zu: **Content-Type Builder**
3. Für jeden Content Type:
   - Öffne den Content Type
   - Klicke auf **"Save"**
4. Starte Strapi neu

**Automatisch (via Script):**

```bash
node scripts/fix-strapi-content-types.mjs
```

**Hinweis:** Automatische Registrierung funktioniert nicht immer zuverlässig. Manuelle Registrierung ist sicherer.

---

### API-Permissions

#### Automatisches Setup

**Bootstrap-Script:** `strapi/app/src/index.ts`

Das Bootstrap-Script setzt automatisch Public API Permissions beim Start:

```typescript
export default {
  async bootstrap({ strapi }) {
    // Setzt automatisch find/findOne Permissions für alle Content Types
    // Nur in DEV-Modus (NODE_ENV !== 'production')
  },
};
```

**Manuell prüfen:**

1. Öffne Strapi Admin: http://localhost:1337/admin
2. Gehe zu: **Settings → Users & Permissions Plugin → Roles → Public**
3. Prüfe: Alle Content Types sollten `find` und `findOne` aktiviert haben

**Manuell setzen:**

```bash
node scripts/setup-strapi-permissions.mjs
```

---

### Seeding

#### Automatisches Seeding

**Script:** `scripts/seed-strapi.mjs`

```bash
node scripts/seed-strapi.mjs
```

**Was wird erstellt:**

- Assets (GLB-Dateien, Texturen)
- Zones (Audio-Zonen)
- Audio Beacons (Ambient-Sounds)
- Portals (Navigation zwischen Scenes)
- Scenes (Komplette Szenen)

**Environment:**

- Lädt `.env.local` automatisch
- Benötigt `STRAPI_TOKEN` oder `STRAPI_URL` + Admin-Credentials

#### Manuelles Seeding

1. Öffne Strapi Admin: http://localhost:1337/admin
2. Gehe zu: **Content Manager**
3. Erstelle Einträge manuell

---

### Webhook-Konfiguration

#### Automatisches Setup

**Script:** `scripts/setup-strapi-webhook.mjs`

```bash
node scripts/setup-strapi-webhook.mjs
```

**Was wird erstellt:**

- Webhook: "Content Refresh"
- URL: `http://localhost:3001/api/content/refresh`
- Events: `entry.publish`, `entry.unpublish`, `entry.update`

#### Manuelles Setup

1. Öffne Strapi Admin: http://localhost:1337/admin
2. Gehe zu: **Settings → Webhooks**
3. Klicke auf **"Create new webhook"**
4. Konfiguriere:
   - **Name:** Content Refresh
   - **URL:** `http://localhost:3001/api/content/refresh`
   - **Events:** `entry.publish`, `entry.unpublish`, `entry.update`

---

## 🔧 Troubleshooting

### Problem: "Cannot connect to database"

**Lösung:**

```bash
# Prüfe Docker
docker ps | grep postgres

# Starte Docker neu
cd strapi
docker-compose restart

# Prüfe Logs
docker-compose logs postgres
```

### Problem: "Content Type not found (404)"

**Lösung:**

1. Öffne Strapi Admin: http://localhost:1337/admin
2. Gehe zu: **Content-Type Builder**
3. Klicke auf jeden Content Type → **"Save"**
4. Starte Strapi neu

### Problem: "Forbidden (403)"

**Lösung:**

```bash
# Permissions automatisch setzen
node scripts/setup-strapi-permissions.mjs

# Oder manuell in Admin-UI
# Settings → Users & Permissions → Roles → Public
# Aktiviere "find" und "findOne" für alle Content Types
```

### Problem: "API Token not found"

**Lösung:**

```bash
# Token automatisch erstellen
node scripts/setup-strapi-simple.mjs

# Oder manuell in Admin-UI
# Settings → API Tokens → Create new API Token
```

### Problem: "Bootstrap script not running"

**Lösung:**

1. Prüfe `strapi/app/src/index.ts` → `bootstrap` Funktion
2. Prüfe Logs beim Start: `npm run develop`
3. Sollte zeigen: `✅ Public permissions seeded (DEV)`

### Problem: "Webhook not triggering"

**Lösung:**

1. Prüfe Webhook-Konfiguration in Admin-UI
2. Prüfe Server-Logs: `cd apps/server && pnpm dev`
3. Teste Webhook manuell:

```bash
node scripts/test-webhook.mjs
```

---

## 📝 Checkliste

### Setup abgeschlossen wenn:

- [ ] Docker läuft (`docker ps | grep postgres`)
- [ ] Strapi läuft (http://localhost:1337/admin)
- [ ] Content Types registriert (in Admin-UI gespeichert)
- [ ] API Token vorhanden (in `.env.local`)
- [ ] Permissions gesetzt (find/findOne aktiviert)
- [ ] Seeds ausgeführt (`node scripts/seed-strapi.mjs`)
- [ ] API funktioniert (`curl http://localhost:1337/api/scenes`)
- [ ] Webhook konfiguriert (`node scripts/setup-strapi-webhook.mjs`)

---

## 🚀 Nächste Schritte

Nach erfolgreichem Setup:

1. **Template-Integration:** Siehe `docs/TEMPLATE_INTEGRATION_WORKFLOW.md`
2. **Content-Management:** Verwende Strapi Admin für Content-Updates
3. **Webhook-Testing:** Teste Content-Refresh via Webhook
4. **Production-Setup:** Siehe `docs/deployment.md`

---

## 📚 Referenzen

- **Strapi Docs:** https://docs.strapi.io
- **Troubleshooting:** `docs/troubleshooting.md`
- **Template-Integration:** `docs/TEMPLATE_INTEGRATION_WORKFLOW.md`
- **Deployment:** `docs/deployment.md`

---

**Viel Erfolg beim Setup! 🚀**
