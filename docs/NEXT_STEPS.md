# Nächste Schritte - WattWelten Metaverse

**Aktualisiert:** 2026-01-11  
**Branch:** `feat/auto-setup-mvp`  
**Status:** Phase A1 (Strapi Setup) abgeschlossen ✅

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

## ✅ Phase A 1: Strapi Setup (abgeschlossen)

### Abgeschlossene Schritte

- ✅ **Docker Compose:** PostgreSQL auf Port 5433 konfiguriert
- ✅ **Strapi installiert:** Läuft auf `http://localhost:1337`
- ✅ **Content Types registriert:** Routes/Controller/Service für alle 5 CTs erstellt
- ✅ **Public API Rechte:** Automatisch via Bootstrap-Script gesetzt (find/findOne)
- ✅ **API Token:** Erstellt und in `.env.local` gespeichert
- ✅ **Seeds ausgeführt:** Test-Daten vorhanden (1 Scene, 2 Assets, 2 Zones, 1 Portal, 1 Audio-Beacon)
- ✅ **Webhook konfiguriert:** Automatisch erstellt via `scripts/setup-strapi-webhook.mjs`

### Automatisierung

Alle Schritte sind automatisiert:

- **Bootstrap-Script:** `strapi/app/src/index.ts` setzt Permissions automatisch
- **Webhook-Setup:** `scripts/setup-strapi-webhook.mjs` erstellt Webhook automatisch
- **Seeds:** `scripts/seed-strapi.mjs` erstellt Test-Daten
- **Tests:** `scripts/test-webhook.mjs` testet Webhook + Client-Integration

### Verifizierung

```bash
# Test Webhook + Client Integration
node scripts/test-webhook.mjs

# Erwartete Ausgabe:
# ✅ Webhook Endpoint: ✅
# ✅ Webhook Trigger: ✅
# ✅ Client Integration: ✅
```

## 🎯 Nächste Schritte (Priorisiert)

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
