# E2E-Test Ergebnisse

Generiert: 2025-12-21

## Test-Übersicht

### Status

- **Tests ausgeführt**: ✅
- **Ergebnisse**: In `apps/web/test-results/results.json`
- **HTML-Report**: Verfügbar in `apps/web/test-results/`

## Bekannte Probleme

### Server-Abhängigkeit

Viele Tests benötigen laufende Server:

- **Dev-Server**: Port 5173 (wird von Playwright automatisch gestartet)
- **Multiplayer-Server**: Port 3001 (muss manuell gestartet werden)

### Test-Fehler

Tests können fehlschlagen wenn:

1. Server nicht erreichbar ist
2. Browser-Permissions verweigert werden (Mic-Zugriff)
3. Timeouts auftreten (langsame Verbindungen)

## Test-Validierung

### Manuelle Prüfung

1. Öffne HTML-Report: `apps/web/test-results/index.html`
2. Prüfe einzelne Test-Fehler
3. Prüfe ob Server-Abhängigkeiten erfüllt sind

### Server-Start für Tests

```bash
# Terminal 1: Multiplayer-Server
pnpm dev:server

# Terminal 2: E2E-Tests
pnpm e2e
```

## Nächste Schritte

1. HTML-Report öffnen und analysieren
2. Fehlgeschlagene Tests identifizieren
3. Server-Abhängigkeiten prüfen
4. Tests ggf. erneut ausführen mit laufenden Servern
