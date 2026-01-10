# Manuelle Test-Anleitung

## 🚀 Server & Web-App starten

### 1. Server starten

```bash
cd apps/server
pnpm dev
```

Server läuft auf: `http://localhost:3001`

### 2. Web-App starten

```bash
cd apps/web
pnpm dev
```

Web-App läuft auf: `http://localhost:5173`

### 3. Browser öffnen

- Öffne `http://localhost:5173` im Browser
- Für Multi-Browser-Tests: Öffne mehrere Browser-Tabs oder verschiedene Browser

## 🧪 Manuelle Test-Szenarien

### Test 1: Join-Flow

1. Öffne `http://localhost:5173`
2. **Login**: Gib einen Username ein (z.B. "TestUser")
3. **Prejoin-Panel**:
   - Avatar auswählen → Weiter
   - Username/Qualität/Rolle → Weiter
   - Steuerungshinweise → Weiter
   - Geräte-Check → Weiter
4. **Enter**: Klicke "Metaverse betreten"
5. **Erwartet**: 3D-Welt lädt, Canvas wird gerendert, HUD ist sichtbar

### Test 2: Audio-Zonen (2 Browser)

1. **Browser 1**: Öffne `http://localhost:5173?template=demo-plaza&room=test-zones`
   - Join als "User1"
   - Bewege dich zur "Stage"-Zone (Zentrum, z=-15)
   - Aktiviere Voice (VoicePanel öffnen)
2. **Browser 2**: Öffne `http://localhost:5173?template=demo-plaza&room=test-zones`
   - Join als "User2"
   - Bewege dich zur "Breakout-1"-Zone (links, z=-5)
   - Aktiviere Voice
3. **Test Cross-Zone-Muting**:
   - User1 spricht → User2 sollte **nichts** hören (Hard-Mute)
4. **Test Same-Zone**:
   - User2 bewegt sich zur "Stage"-Zone
   - User1 spricht → User2 sollte hören (mit Distance-Attenuation)

### Test 3: Whiteboard-Sync (2 Browser)

1. **Browser 1**: Öffne `http://localhost:5173?template=demo-meeting&room=test-whiteboard`
   - Join als "User1"
   - Öffne Whiteboard (Whiteboard-Button im HUD)
2. **Browser 2**: Öffne `http://localhost:5173?template=demo-meeting&room=test-whiteboard`
   - Join als "User2"
   - Öffne Whiteboard
3. **Test Sync**:
   - User1 zeichnet etwas → User2 sollte Änderung < 200ms sehen
   - User2 zeichnet gleichzeitig → User1 sollte Änderung sehen

### Test 4: Companion-Phone

1. **Desktop**: Öffne `http://localhost:5173`
   - Join als "DesktopUser"
   - QR-Code sollte im HUD angezeigt werden
2. **Phone**: Öffne `http://localhost:5173/remote`
   - Scanne QR-Code oder gib Pair-Code ein
   - PTT-Button sollte aktiv werden
3. **Test PTT**:
   - Halte PTT-Button auf Phone gedrückt
   - Sprich → Desktop sollte Audio hören

### Test 5: Performance-Metriken

1. Öffne `http://localhost:5173`
2. **F12** drücken → Debug-Overlay öffnen
3. **Performance-Tab** in Browser DevTools öffnen
4. **Join-Zeit messen**:
   - Performance-Tab → Record starten
   - Join durchführen
   - Record stoppen
   - Join-Zeit sollte < 6s sein
5. **FPS prüfen**:
   - Debug-Overlay zeigt FPS
   - FPS sollte ≥ 50 sein (Desktop)
6. **Memory prüfen**:
   - Performance-Tab → Memory-Profiling
   - Memory sollte < 500MB sein (nach 10 Min)

## 🔍 Debugging

### Console-Logs prüfen

- **Browser Console** (F12 → Console)
- **Server-Logs** (Terminal wo Server läuft)

### Häufige Probleme

**Problem**: Whiteboard sync nicht

- **Lösung**: Y-WebSocket Server läuft? `/yws` erreichbar?
- **Check**: `http://localhost:3001/yws` sollte erreichbar sein

**Problem**: Audio nicht

- **Lösung**: LiveKit konfiguriert? Token-Endpoint funktioniert?
- **Check**: `http://localhost:3001/api/rtc/token` sollte erreichbar sein

**Problem**: Zone-Isolation nicht

- **Lösung**: Zone-Engine aktiviert? Zones im Manifest definiert?
- **Check**: ZoneIndicator im HUD zeigt aktuelle Zone

**Problem**: Performance schlecht

- **Lösung**: DRACO/KTX2 aktiviert? Assets optimiert?
- **Check**: Browser DevTools → Network Tab → Asset-Größen prüfen

## 📊 Metriken sammeln

### Während Tests

1. **FPS**: Kontinuierlich über Debug-Overlay (F12)
2. **Memory**: Browser DevTools → Memory Tab
3. **Network**: Browser DevTools → Network Tab
4. **Console**: Errors/Warnings

### Nach Tests

1. **Lighthouse-Score**: Chrome DevTools → Lighthouse Tab
2. **Bundle-Analyse**: `pnpm analyze:bundle`
3. **Sentry-Dashboard**: Errors, Performance-Metriken

## ✅ Checkliste

### Vor jedem Test

- [ ] Server läuft (`apps/server`)
- [ ] Web-App läuft (`apps/web`)
- [ ] Y-WebSocket aktiviert
- [ ] LiveKit konfiguriert (falls Voice-Tests)
- [ ] Browser-Cache geleert

### Nach jedem Test

- [ ] Ergebnisse dokumentiert
- [ ] Errors in Sentry geprüft
- [ ] Performance-Metriken notiert
- [ ] Browser-Logs gespeichert
