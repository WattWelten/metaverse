# Automatisierter Manueller Test-Plan

**Datum:** 2025-01-22  
**Status:** Automatisierung mit Playwright

## Test-Strategie

Alle manuellen Tests werden mit Playwright automatisiert, um:

- Konsistente Ergebnisse zu gewährleisten
- Tests schnell wiederholbar zu machen
- Regressionen früh zu erkennen
- CI/CD Integration zu ermöglichen

## Test-Szenarien

### 1. Multiplayer-Test (2 Browser-Kontexte)

**Ziel:** Validieren, dass zwei Clients sich im selben Room sehen können

**Schritte:**

1. Browser-Kontext 1: Navigiere zu `?room=test-123`
2. Browser-Kontext 2: Navigiere zu `?room=test-123`
3. Warte auf Verbindung beider Clients
4. Prüfe, dass beide Clients verbunden sind
5. Prüfe, dass Room-UI beide Clients anzeigt
6. Simuliere Avatar-Bewegung in Kontext 1
7. Prüfe, dass Kontext 2 die Bewegung sieht

**Erwartetes Ergebnis:**

- Beide Clients verbunden
- Room-UI zeigt 2 Spieler
- Transform-Synchronisation funktioniert

### 2. Voice-Test

**Ziel:** Validieren, dass Voice-Features funktionieren

**Schritte:**

1. Navigiere zu App mit `VITE_VOICE_ENABLED=true`
2. Prüfe, dass Consent-Modal erscheint
3. Klicke "Accept" → Voice sollte aktiviert werden
4. Prüfe, dass Mic-Toggle in Room-UI sichtbar ist
5. Klicke Mic-Toggle → Mute
6. Prüfe, dass Button-Status sich ändert
7. Klicke erneut → Unmute

**Erwartetes Ergebnis:**

- Consent-Modal erscheint
- Accept aktiviert Voice
- Mic-Toggle funktioniert
- Mute/Unmute funktioniert

### 3. XR-Test

**Ziel:** Validieren, dass XR-Features verfügbar sind

**Schritte:**

1. Navigiere zu App mit `VITE_XR_ENABLED=true`
2. Prüfe, ob WebXR-Button vorhanden ist (falls Browser unterstützt)
3. Prüfe, dass Button-Text korrekt ist
4. Prüfe, dass Button klickbar ist (falls VR nicht verfügbar, sollte es graceful sein)

**Erwartetes Ergebnis:**

- WebXR-Button erscheint (falls unterstützt)
- Keine Fehler wenn XR nicht verfügbar
- Graceful Fallback

### 4. Template-Switching-Test

**Ziel:** Validieren, dass Template-Switching funktioniert

**Schritte:**

1. Navigiere zu App
2. Drücke F12 → Debug-Overlay sollte erscheinen
3. Prüfe, dass FPS-Anzeige sichtbar ist
4. Prüfe, dass Template-Dropdown vorhanden ist
5. Wähle `watt-eco` aus Dropdown
6. Warte auf Template-Load
7. Prüfe, dass kein Fehler aufgetreten ist
8. Wähle `watt-default` aus Dropdown
9. Warte auf Template-Load
10. Prüfe, dass kein Fehler aufgetreten ist

**Erwartetes Ergebnis:**

- F12 toggelt Debug-Overlay
- FPS-Anzeige sichtbar
- Template-Dropdown funktioniert
- Template-Wechsel funktioniert ohne Fehler

### 5. Production Build-Test

**Ziel:** Validieren, dass Production Build korrekt funktioniert

**Schritte:**

1. Starte Production-Server (localhost:3000)
2. Navigiere zu Production-Build
3. Prüfe, dass Seite lädt ohne Fehler
4. Prüfe, dass Canvas rendert
5. Prüfe, dass keine 404-Errors für Assets
6. Prüfe, dass alle Features funktionieren (wie Dev)

**Erwartetes Ergebnis:**

- Seite lädt korrekt
- Keine Console-Errors
- Alle Features funktionieren
- Performance akzeptabel

## Automatisierung mit Playwright

### Test-Dateien

1. `apps/web/e2e/manual-multiplayer.spec.ts` - Multiplayer-Test
2. `apps/web/e2e/manual-voice.spec.ts` - Voice-Test
3. `apps/web/e2e/manual-xr.spec.ts` - XR-Test
4. `apps/web/e2e/manual-template-switching.spec.ts` - Template-Switching-Test
5. `apps/web/e2e/manual-production-build.spec.ts` - Production Build-Test

### Test-Ausführung

```bash
# Alle manuellen Tests ausführen
pnpm e2e --grep "manual"

# Einzelne Tests
pnpm e2e apps/web/e2e/manual-multiplayer.spec.ts
```

## Erfolgs-Kriterien

- ✅ Alle Tests bestehen
- ✅ Keine Console-Errors
- ✅ Alle Features funktionieren wie erwartet
- ✅ Performance akzeptabel

## Nächste Schritte

Nach erfolgreicher Automatisierung:

1. Tests in CI/CD integrieren
2. Regelmäßige Ausführung
3. Performance-Metriken sammeln
