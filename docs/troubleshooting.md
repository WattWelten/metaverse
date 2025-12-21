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
