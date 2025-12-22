# Manuelle Feature-Validierung - Checkliste

**Datum:** 2025-01-22  
**Status:** In Bearbeitung

## Test-Umgebung

- **Production Build:** http://localhost:3000
- **Dev-Server:** http://localhost:5173
- **Multiplayer Server:** http://localhost:3001

## 1. Multiplayer-Test

### Setup

1. Öffne 2 Browser-Tabs (oder 2 Browser)
2. Navigiere beide zu: `http://localhost:5173?room=test-123`

### Erwartetes Verhalten

- [ ] Beide Clients verbinden sich zum Server
- [ ] Beide sehen sich in der Room-UI (Player-Liste)
- [ ] Avatare spawnen (Capsule-Fallback oder VRM)
- [ ] Bewegung wird synchronisiert (Transform-Broadcast)
- [ ] Beim Verlassen: Avatar wird entfernt

### Test-Schritte

1. **Tab 1:** Warte auf Verbindung
2. **Tab 2:** Öffne gleiche URL
3. **Tab 1:** Bewege Avatar (WASD oder Pfeiltasten)
4. **Tab 2:** Sollte Bewegung sehen
5. **Tab 2:** Bewege Avatar
6. **Tab 1:** Sollte Bewegung sehen

### Fehlerbehandlung

- [ ] Solo-Modus funktioniert wenn Server nicht erreichbar
- [ ] Keine Console-Errors
- [ ] Graceful Fallback

## 2. Voice-Test

### Setup

1. Öffne: `http://localhost:5173?room=test-123`
2. Stelle sicher, dass `VITE_VOICE_ENABLED=true` in `.env.local`

### Erwartetes Verhalten

- [ ] Consent-Modal erscheint beim Start
- [ ] "Accept" aktiviert Voice
- [ ] "Decline" deaktiviert Voice (No-Op)
- [ ] Mic-Toggle in Room-UI funktioniert
- [ ] Mute/Unmute funktioniert

### Test-Schritte

1. **Consent-Modal:**
   - [ ] Modal erscheint
   - [ ] "Accept" klicken → Voice aktiviert
   - [ ] "Decline" klicken → Voice deaktiviert

2. **Mic-Toggle:**
   - [ ] Room-UI zeigt Mic-Button
   - [ ] Klick auf Mic-Button → Mute
   - [ ] Erneut klicken → Unmute
   - [ ] Button-Status ändert sich visuell

3. **Spatial Audio:**
   - [ ] 2 Tabs im selben Room
   - [ ] Voice sollte räumlich klingen (PannerNode)
   - [ ] Distanz-basierte Lautstärke (DistanceAttenuation)

### Fehlerbehandlung

- [ ] Keine Fehler wenn `VITE_VOICE_ENABLED=false`
- [ ] Graceful Fallback bei fehlendem Mic-Zugriff

## 3. XR-Test

### Setup

1. Öffne: `http://localhost:5173`
2. Stelle sicher, dass `VITE_XR_ENABLED=true`
3. Browser mit WebXR-Support (Chrome/Edge)

### Erwartetes Verhalten

- [ ] WebXR-Button erscheint (falls unterstützt)
- [ ] Klick startet VR-Session (falls Headset vorhanden)
- [ ] Controller-Tracking funktioniert
- [ ] Exit-VR funktioniert

### Test-Schritte

1. **WebXR-Button:**
   - [ ] Button erscheint (falls Browser unterstützt)
   - [ ] Button-Text: "Enter VR" oder ähnlich

2. **VR-Session (falls Headset):**
   - [ ] Klick startet VR
   - [ ] Szene wird in VR gerendert
   - [ ] Controller sichtbar
   - [ ] Bewegung funktioniert

3. **Exit-VR:**
   - [ ] Exit-Button funktioniert
   - [ ] Zurück zu Desktop-Ansicht

### Fehlerbehandlung

- [ ] Keine Fehler wenn `VITE_XR_ENABLED=false`
- [ ] Graceful Fallback bei fehlendem WebXR-Support

## 4. Template-Switching-Test

### Setup

1. Öffne: `http://localhost:5173`
2. Drücke F12 für Debug-Overlay

### Erwartetes Verhalten

- [ ] Debug-Overlay erscheint (F12)
- [ ] Template-Dropdown zeigt verfügbare Templates
- [ ] Template-Wechsel funktioniert (Hot-Swap)
- [ ] Kein schwarzer Screen (Fallback)

### Test-Schritte

1. **Debug-Overlay:**
   - [ ] F12 drücken → Overlay erscheint
   - [ ] F12 erneut → Overlay verschwindet
   - [ ] FPS-Anzeige sichtbar
   - [ ] Draw-Calls sichtbar

2. **Template-Switcher:**
   - [ ] Dropdown zeigt: `watt-default`, `watt-eco`
   - [ ] Wechsel zu `watt-eco` → Template lädt
   - [ ] Wechsel zu `watt-default` → Template lädt
   - [ ] Keine Fehler beim Wechsel

3. **Fallback:**
   - [ ] Ungültiges Template → Fallback auf `watt-default`
   - [ ] Kein schwarzer Screen

### Fehlerbehandlung

- [ ] Keine Console-Errors beim Template-Wechsel
- [ ] Fallback funktioniert bei fehlendem Template

## 5. Production Build-Test

### Setup

1. Production Build: `http://localhost:3000`
2. Dev-Server: `http://localhost:5173` (zum Vergleich)

### Erwartetes Verhalten

- [ ] Production Build lädt korrekt
- [ ] Keine Console-Errors
- [ ] Alle Features funktionieren
- [ ] Performance ist gut

### Test-Schritte

1. **Laden:**
   - [ ] Seite lädt ohne Fehler
   - [ ] Canvas rendert
   - [ ] Keine 404-Errors für Assets

2. **Features:**
   - [ ] Multiplayer funktioniert
   - [ ] Voice funktioniert (falls aktiviert)
   - [ ] XR funktioniert (falls aktiviert)
   - [ ] Template-Switching funktioniert

3. **Performance:**
   - [ ] FPS stabil (Desktop: 60fps, Mobile: 40fps)
   - [ ] Keine Memory-Leaks
   - [ ] Bundle-Size akzeptabel (~294 KB gzip)

### Vergleich Dev vs. Production

- [ ] Production Build verhält sich wie Dev
- [ ] Keine Unterschiede in Features
- [ ] Performance ähnlich oder besser

## 6. Allgemeine Validierung

### Console-Errors

- [ ] Keine unhandled errors
- [ ] Keine kritischen Warnings
- [ ] Graceful Fallbacks bei Fehlern

### UI/UX

- [ ] HUD sichtbar (FPS, Player-Count)
- [ ] Room-UI sichtbar (falls Multiplayer aktiv)
- [ ] Debug-Overlay funktioniert (F12)
- [ ] Responsive Design (falls getestet)

### Performance

- [ ] FPS-Monitoring funktioniert
- [ ] Draw-Calls sichtbar
- [ ] Keine Performance-Probleme

## Test-Ergebnisse

### Multiplayer

- Status: ⏳ In Bearbeitung
- Notizen:

### Voice

- Status: ⏳ In Bearbeitung
- Notizen:

### XR

- Status: ⏳ In Bearbeitung
- Notizen:

### Template-Switching

- Status: ⏳ In Bearbeitung
- Notizen:

### Production Build

- Status: ⏳ In Bearbeitung
- Notizen:

## Nächste Schritte

Nach erfolgreicher Validierung:

1. Performance-Benchmarks durchführen
2. Load-Tests für Multiplayer
3. Deployment-Vorbereitung
