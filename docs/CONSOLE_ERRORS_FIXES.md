# Console-Fehler Fixes

**Datum:** 2026-01-04  
**Zweck:** Dokumentation der behobenen Console-Fehler

## Behobene Probleme

### 1. ✅ WebSocket-Verbindungsversuche reduziert

**Problem:** NetClient versuchte unbegrenzt zu verbinden, auch nach Timeout.

**Fix:**

- `reconnectionAttempts` von 5 auf 3 reduziert
- `reconnectionDelayMax: 5000` hinzugefügt
- `timeout: 5000` für Connection-Timeout
- Nach Timeout wird `disconnect()` aufgerufen
- Nach 3 Fehlern wird Reconnection gestoppt

**Dateien:**

- `packages/net/src/NetClient.ts`
- `apps/web/src/World.ts`

### 2. ✅ WebGL Context Lost Handler

**Problem:** WebGL Context wurde verloren ohne Recovery.

**Fix:**

- Event-Listener für `webglcontextlost` hinzugefügt
- Event-Listener für `webglcontextrestored` hinzugefügt
- Renderer-Settings werden nach Restore neu initialisiert

**Dateien:**

- `apps/web/src/World.ts`

### 3. ⚠️ events/util Module externalized (Harmlos)

**Problem:** Vite-Warnungen über externalized Module.

**Status:** Diese Warnungen sind **harmlos** und können ignoriert werden. Socket.io verwendet Node.js-Module, die von Vite automatisch externalized werden. Das ist das erwartete Verhalten.

**Empfehlung:** Warnungen in Browser-Console filtern.

### 4. ✅ XR-Mehrfach-Initialisierung verhindert

**Problem:** `initXR()` wurde mehrfach aufgerufen.

**Fix:**

- Prüfung `!this.xrAdapter` hinzugefügt, bevor XR initialisiert wird

**Dateien:**

- `apps/web/src/World.ts`

### 5. ✅ Connection-Error-Logging reduziert

**Problem:** Zu viele Console-Logs bei Connection-Fehlern.

**Fix:**

- Error-Counter hinzugefügt
- Nur erste Fehlermeldung wird geloggt
- Nach 3 Fehlern wird Reconnection gestoppt

**Dateien:**

- `apps/web/src/World.ts`

## Harmlose Warnungen (Können ignoriert werden)

1. **React DevTools** - Info-Meldung, kann ignoriert werden
2. **events/util externalized** - Vite-Verhalten, harmlos
3. **XR is not supported** - Normal wenn kein XR-Device vorhanden
4. **favicon.ico 404** - Harmlos, fehlt einfach
5. **AudioContext resume** - Normal, wird nach User-Interaction resümiert
6. **WebSocket connection refused** - Erwartet wenn Server nicht läuft (Solo-Modus)

## Kritische Probleme

### ⚠️ WebGL Context Lost

**Status:** Handler hinzugefügt, aber Problem könnte tiefer liegen.

**Mögliche Ursachen:**

- GPU-Treiber-Problem
- Memory-Leak
- Zu viele WebGL-Objekte
- GPU-Overload

**Empfehlung:**

- Browser-Console auf weitere Context-Lost-Events prüfen
- Performance-Tab prüfen (Memory-Usage)
- GPU-Treiber aktualisieren

## Nächste Schritte

1. ✅ WebSocket-Verbindungsversuche reduziert
2. ✅ WebGL Context Lost Handler hinzugefügt
3. ✅ XR-Mehrfach-Initialisierung verhindert
4. ⚠️ events/util Warnungen sind harmlos (können ignoriert werden)
5. ⚠️ WebGL Context Lost weiter beobachten

## Console-Filter für Browser

Empfohlene Filter in Chrome DevTools:

```
-favicon -sourcemap -events -util -WebSocket -XR -AudioContext
```
