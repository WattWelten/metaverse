# Troubleshooting Guide

## Häufige Probleme und Lösungen

### Build-Probleme

#### "Cannot find module" Fehler

```bash
# Dependencies neu installieren
pnpm install

# Build-Cache löschen
pnpm clean
pnpm build
```

#### TypeScript-Fehler

```bash
# Type-Check ausführen
pnpm typecheck

# Oft hilft: node_modules löschen und neu installieren
rm -rf node_modules
pnpm install
```

### Runtime-Probleme

#### Canvas wird nicht gerendert

1. Prüfe Browser-Konsole auf Fehler
2. Prüfe ob WebGL unterstützt wird: `chrome://gpu`
3. Prüfe ob Template korrekt geladen wurde

#### Multiplayer-Verbindung fehlgeschlagen

1. Prüfe ob Server läuft: `http://localhost:3001`
2. Prüfe Feature-Flag: `VITE_MULTIPLAYER_ENABLED=true`
3. Prüfe Server-URL: `VITE_SERVER_URL=http://localhost:3001`
4. Fallback zu Solo-Modus sollte automatisch erfolgen

#### Voice funktioniert nicht

1. Prüfe Feature-Flags:
   - `VITE_VOICE_ENABLED=true`
   - `VITE_MULTIPLAYER_ENABLED=true` (benötigt!)
2. Prüfe Mic-Zugriff im Browser
3. Prüfe Consent-Modal (wird angezeigt?)
4. Prüfe Browser-Konsole auf Fehler

#### Ambient Audio spielt nicht

1. Prüfe Feature-Flag: `VITE_AMBIENT_AUDIO_ENABLED=true`
2. Prüfe Template-Manifest (enthält `ambient` Section?)
3. Prüfe Audio-Dateien (existieren sie?)
4. Prüfe Browser-Autoplay-Policy (User-Interaction erforderlich)

### Performance-Probleme

#### Niedrige FPS

1. Öffne Debug-Overlay (F12)
2. Prüfe Draw Calls (sollte <1000 sein)
3. Prüfe Template-Komplexität
4. Reduziere Post-Processing-Effekte

#### Hohe Memory-Nutzung

1. Prüfe Template-Switching (Memory-Leaks?)
2. Prüfe Asset-Loading (werden Assets korrekt freigegeben?)
3. Chrome DevTools → Memory Profiler

### Test-Probleme

#### E2E-Tests schlagen fehl

1. Prüfe ob Dev-Server läuft
2. Prüfe ob Server läuft (für Multiplayer-Tests)
3. Prüfe Browser-Installation (Playwright)
4. Führe Tests mit Progress aus: `pnpm e2e:progress`

#### Tests hängen

1. Verwende Heartbeat: Tests zeigen Updates alle 5 Min
2. Prüfe Timeouts in `playwright.config.ts`
3. Prüfe ob Server antwortet

### Feature-Flag-Probleme

#### Features funktionieren nicht

1. Prüfe `.env.local` Datei
2. Prüfe Feature-Flag-Namen (Groß-/Kleinschreibung!)
3. Prüfe ob Server neu gestartet wurde nach Änderung
4. Prüfe Browser-Konsole auf Feature-Flag-Logs

### Asset-Probleme

#### Assets werden nicht geladen

1. Prüfe Asset-Pfade (relativ zu `/public` oder `/templates`)
2. Prüfe CORS-Einstellungen
3. Prüfe Template-Manifest (korrekte Pfade?)
4. Prüfe Browser-Netzwerk-Tab

#### KTX2/Draco Decoder fehlen

```bash
# Decoder-Ordner einrichten
pnpm setup:decoders
```

### Strapi-Probleme

#### "Cannot connect to database"

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

#### "Content Type not found (404)"

**Lösung:**

1. Öffne Strapi Admin: http://localhost:1337/admin
2. Gehe zu: **Content-Type Builder**
3. Klicke auf jeden Content Type → **"Save"**
4. Starte Strapi neu: `cd strapi/app && npm run develop`

**Automatisch:**

```bash
node scripts/fix-strapi-content-types.mjs
```

#### "Forbidden (403)"

**Lösung:**

```bash
# Permissions automatisch setzen
node scripts/setup-strapi-permissions.mjs

# Oder manuell in Admin-UI
# Settings → Users & Permissions → Roles → Public
# Aktiviere "find" und "findOne" für alle Content Types
```

**Hinweis:** Das Bootstrap-Script setzt Permissions automatisch beim Start (nur in DEV-Modus).

#### "API Token not found"

**Lösung:**

```bash
# Token automatisch erstellen
node scripts/setup-strapi-simple.mjs

# Oder manuell in Admin-UI
# Settings → API Tokens → Create new API Token
```

#### "Bootstrap script not running"

**Lösung:**

1. Prüfe `strapi/app/src/index.ts` → `bootstrap` Funktion
2. Prüfe Logs beim Start: `npm run develop`
3. Sollte zeigen: `✅ Public permissions seeded (DEV)`

#### "Webhook not triggering"

**Lösung:**

1. Prüfe Webhook-Konfiguration in Admin-UI
2. Prüfe Server-Logs: `cd apps/server && pnpm dev`
3. Teste Webhook manuell:

```bash
node scripts/test-webhook.mjs
```

**Setup:**

```bash
node scripts/setup-strapi-webhook.mjs
```

#### Strapi startet nicht

**Lösung:**

```bash
# Prüfe Environment
cd strapi/app
cat .env | grep DATABASE

# Prüfe Dependencies
npm install

# Prüfe PostgreSQL
docker ps | grep postgres

# Prüfe Logs
npm run develop
# Suche nach Fehlermeldungen
```

**Vollständiger Setup-Guide:** Siehe `docs/STRAPI_SETUP.md`

## Debug-Tipps

### Debug-Overlay

- **F12**: Toggle Debug-Overlay
- Zeigt: FPS, Draw Calls, GPU-Info, Template-Switcher, Exposure

### Browser-Konsole

- Alle wichtigen Events werden geloggt
- Suche nach: `✅`, `⚠️`, `❌` für Status-Meldungen

### Network-Tab

- Prüfe Asset-Loading
- Prüfe WebSocket-Verbindungen
- Prüfe API-Calls

## Support

Bei weiteren Problemen:

1. Prüfe `docs/` für detaillierte Dokumentation
2. Prüfe `docs/integration-status.md` für Integration-Status
3. Prüfe `docs/health-report.md` für System-Status
