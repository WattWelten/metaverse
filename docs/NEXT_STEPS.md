# Nächste Schritte - WattWelten Metaverse

**Aktualisiert:** 2026-01-10  
**Branch:** `feat/auto-setup-mvp`  
**Status:** Phase B & A2 abgeschlossen, Phase A1 ausstehend

## ✅ Abgeschlossen (diese Session)

### Phase B: Whiteboard tldraw-Yjs Integration

- ✅ Basis-Integration implementiert (dynamischer Import)
- ✅ Yjs-Doc + WebsocketProvider verbunden
- ✅ Build erfolgreich

### Phase A 2: Build-Fehler behoben

- ✅ AppleCard Props erweitert (`onMouseEnter`, `onMouseLeave`)
- ✅ Sentry Types korrigiert (Type-Inferenz statt explizite Types)
- ✅ ParticipantsPanel `any` Types entfernt
- ✅ SkeletonUtils dynamischer Import (Three.js 0.170 Kompatibilität)
- ✅ Alle Builds erfolgreich (Web: 37.24s)

### Dokumentation & Git

- ✅ `docs/CURRENT_STATUS.md` erstellt
- ✅ Git commit & push durchgeführt

## 🎯 Nächste Schritte (Priorisiert)

### Phase A 1: Strapi Setup (autark soweit möglich)

#### Schritt 1: Docker Compose prüfen

```bash
# PostgreSQL läuft bereits auf Port 5432 (PID 20412)
# Prüfen ob Docker Compose die DB nutzen kann oder Port ändern
cd strapi
docker compose up -d
```

**Hinweis:** Falls Port 5432 belegt ist:

- Option A: Bestehende PostgreSQL-Instanz nutzen (wenn kompatibel)
- Option B: Port in `docker-compose.yml` ändern (z.B. 5433)

#### Schritt 2: Strapi lokal installieren

```bash
cd strapi
# Falls noch nicht vorhanden:
npx create-strapi-app@latest app --quickstart --no-run

# Oder falls bereits vorhanden:
cd app
npm install
npm run develop
```

#### Schritt 3: Content Types registrieren

Die JSON-Schemas sind bereits erstellt:

- `strapi/app/src/api/scene/content-types/scene/schema.json`
- `strapi/app/src/api/asset/content-types/asset/schema.json`
- `strapi/app/src/api/zone/content-types/zone/schema.json`
- `strapi/app/src/api/portal/content-types/portal/schema.json`
- `strapi/app/src/api/audio-beacon/content-types/audio-beacon/schema.json`

**Aktion:** Strapi sollte diese beim Start automatisch erkennen. Falls nicht, in Admin-UI prüfen.

#### Schritt 4: Public API Rechte konfigurieren

1. Strapi Admin-UI öffnen: `http://localhost:1337/admin`
2. Settings → Roles → Public
3. Für jeden Content Type (Scene, Asset, Zone, Portal, Audio-Beacon):
   - `find` aktivieren
   - `findOne` aktivieren
   - Optional: `create`, `update`, `delete` (je nach Bedarf)

#### Schritt 5: API Token erstellen

1. Settings → API Tokens
2. "Create new API Token"
3. Name: z.B. "Seed Script Token"
4. Token type: "Full access" (oder eingeschränkt)
5. Token kopieren und in `.env.local` setzen:
   ```bash
   echo STRAPI_TOKEN=dein_token_hier >> .env.local
   ```

#### Schritt 6: Seeds ausführen

```bash
cd C:\cursor.ai\WattWelten_Metaverse
node scripts/seed-strapi.mjs
```

#### Schritt 7: Webhook konfigurieren

1. Strapi Admin → Settings → Webhooks
2. "Create new webhook"
3. Name: "Content Refresh"
4. URL: `http://localhost:3001/api/content/refresh`
5. Events: `entry.publish`, `entry.unpublish`, `entry.update`
6. Save

### Nach Strapi Setup

#### Whiteboard tldraw-Yjs vollständig integrieren (optional)

- Aktuell: Basis-Integration mit Yjs-Doc
- Optional: Vollständige Store-Bindung (erfordert tldraw-Dokumentation)
- Status: Funktioniert, aber vollständige Synchronisation optional

#### LiveKit Integration testen

- Credentials konfigurieren (`.env.local`)
- RTC Token-Endpoint testen
- Screenshare & PTT testen

#### Performance-Optimierung

- Chunk-Size reduzieren (Code-Splitting)
- Lazy-Loading für Feature-Packages
- Asset-Optimierung (DRACO/KTX2)

## 📋 Checkliste für neue Agent-Session

Wenn du in einer neuen Agent-Session weitermachst:

1. **Branch prüfen:**

   ```bash
   git checkout feat/auto-setup-mvp
   git pull origin feat/auto-setup-mvp
   ```

2. **Dependencies installieren:**

   ```bash
   pnpm install
   ```

3. **Build testen:**

   ```bash
   pnpm -w build
   pnpm -w typecheck
   ```

4. **Status prüfen:**
   - `docs/CURRENT_STATUS.md` lesen
   - `docs/NEXT_STEPS.md` (dieses Dokument) lesen

5. **Weitermachen mit:**
   - Phase A 1: Strapi Setup (siehe oben)

## 🔍 Bekannte Issues

- ⚠️ Chunk-Size-Warnungen im Web Build (erwartet, Three.js ist groß)
- ⚠️ SkeletonUtils dynamischer Import (funktioniert, aber Fallback aktiv)
- ⚠️ Port 5432 bereits belegt (PostgreSQL läuft, Docker Compose muss angepasst werden)

## 📚 Referenzen

- **MVP-Guide:** `docs/MVP-Guide.md`
- **ENV-Dokumentation:** `docs/ENV.md`
- **Aktueller Status:** `docs/CURRENT_STATUS.md`
- **Implementierungsübersicht:** `docs/PLAN_IMPLEMENTATION_COMPLETE.md`

## 🚀 Quick Commands

```bash
# Smoke-Tests
pnpm smoke

# E2E-Tests
pnpm e2e

# Audit
pnpm audit

# Build
pnpm -w build

# Typecheck
pnpm -w typecheck
```
