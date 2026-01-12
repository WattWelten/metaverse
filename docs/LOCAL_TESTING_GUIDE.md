# Lokale Tests: Template-Integration

**Datum:** 2026-01-12  
**Status:** ✅ Beide Templates integriert

---

## 🚀 Quick Start

### Schritt 1: Web-App starten

```bash
cd C:\cursor.ai\WattWelten_Metaverse
pnpm dev
```

**Erwartetes Ergebnis:**

- Server startet auf `http://localhost:5173`
- Keine Build-Fehler
- Keine TypeScript-Fehler

---

## 🧪 Template-Tests

### Test 1: Play Park Dirty

**URL:** `http://localhost:5173?template=play-park-dirty`

**Checkliste:**

- [ ] Template lädt ohne Fehler
- [ ] Scene ist sichtbar (3D-Modell)
- [ ] Beleuchtung wirkt korrekt (HDRI)
- [ ] Ambient Audio spielt automatisch ab
- [ ] Performance: ~60 FPS (Desktop)
- [ ] Keine Fehler in Browser-Console

**Browser-Console prüfen:**

```javascript
// Template-Manifest prüfen
console.log(window.__templateManifest);

// Performance prüfen
console.log('FPS:', window.__perf?.fps);

// Fehler prüfen
console.log('Errors:', window.__errors || []);
```

---

### Test 2: Park

**URL:** `http://localhost:5173?template=park`

**Checkliste:**

- [ ] Template lädt ohne Fehler
- [ ] Scene ist sichtbar (3D-Modell)
- [ ] Beleuchtung wirkt korrekt (HDRI)
- [ ] Ambient Audio spielt automatisch ab
- [ ] Performance: ~60 FPS (Desktop)
- [ ] Keine Fehler in Browser-Console

---

### Test 3: Template-Switching

**URL:** `http://localhost:5173`

**Checkliste:**

- [ ] Template-Switcher ist sichtbar (Dropdown oben)
- [ ] Beide Templates sind in der Liste
- [ ] Wechsel zu "Play Park Dirty" funktioniert (kein Reload)
- [ ] Wechsel zu "Park" funktioniert (kein Reload)
- [ ] URL wird aktualisiert (`?template=...`)
- [ ] Scene wechselt korrekt
- [ ] Audio wechselt korrekt
- [ ] Keine Memory-Leaks

**Manueller Test:**

1. Öffne Template-Switcher (Dropdown)
2. Wähle "Play Park Dirty"
3. Warte bis Template geladen ist
4. Wähle "Park"
5. Warte bis Template geladen ist
6. Wiederhole mehrmals
7. Prüfe Browser-Console auf Fehler

---

## 📊 Performance-Tests

### FPS-Messung

**URL:** `http://localhost:5173?template=play-park-dirty`

**Checkliste:**

- [ ] FPS: ≥ 50 (Desktop) oder ≥ 35 (Mobile)
- [ ] FPS bleibt stabil (keine großen Schwankungen)
- [ ] Keine Frame-Drops

**FPS prüfen:**

```javascript
// FPS in Browser-Console
console.log('FPS:', window.__perf?.fps);

// Oder F12 → Performance → Record
```

---

### Memory-Test

**URL:** `http://localhost:5173?template=play-park-dirty`

**Checkliste:**

- [ ] Memory Usage: < 500 MB (Chrome DevTools)
- [ ] Keine Memory-Leaks bei Template-Switching
- [ ] Memory bleibt stabil

**Memory prüfen:**

1. Chrome DevTools öffnen (F12)
2. Performance → Memory → Take Heap Snapshot
3. Template wechseln
4. Erneut Heap Snapshot nehmen
5. Vergleich: Memory sollte nicht kontinuierlich steigen

---

### Load-Time-Test

**URL:** `http://localhost:5173?template=play-park-dirty`

**Checkliste:**

- [ ] Initial Load Time: < 5 Sekunden
- [ ] Template-Switch Time: < 2 Sekunden

**Load-Time prüfen:**

1. Chrome DevTools öffnen (F12)
2. Network → Disable Cache
3. Seite neu laden
4. Network-Tab prüfen: Total Load Time

---

## 🐛 Troubleshooting

### Template lädt nicht

**Problem:** Template erscheint nicht oder lädt nicht

**Lösung:**

1. Prüfe Browser-Console auf Fehler
2. Prüfe ob `manifest.json` valide JSON ist
3. Prüfe ob `scene.glb` existiert
4. Prüfe ob Template in `templates.json` registriert ist
5. Browser-Cache leeren (Ctrl+Shift+R)

---

### Scene ist schwarz/unsichtbar

**Problem:** Scene lädt, aber ist nicht sichtbar

**Lösung:**

1. Prüfe Beleuchtung in `manifest.json`
2. Prüfe ob HDRI korrekt geladen wird
3. Prüfe Browser-Console für Fehler
4. Prüfe ob `scene.glb` korrekt exportiert wurde (Y-Up)

---

### Audio spielt nicht ab

**Problem:** Ambient Audio spielt nicht

**Lösung:**

1. Prüfe ob Audio-File existiert
2. Prüfe ob Pfad in `manifest.json` korrekt ist
3. Prüfe Browser-Console für Audio-Fehler
4. Interagiere mit Seite (Browser erfordert User-Interaction für Audio)

---

### Performance-Probleme

**Problem:** Niedrige FPS (< 50 auf Desktop)

**Lösung:**

1. Prüfe Scene-Größe (sollte < 20 MB sein)
2. Prüfe ob DRACO-Kompression aktiviert ist
3. Prüfe Browser-Console für Warnungen
4. Reduziere Textur-Auflösungen

---

## ✅ Erfolgreiche Tests

Ein Template ist erfolgreich getestet, wenn:

1. ✅ Template lädt ohne Fehler
2. ✅ Scene ist sichtbar und korrekt beleuchtet
3. ✅ Ambient Audio spielt automatisch ab
4. ✅ Performance: 60 FPS (Desktop), 40 FPS (Mobile)
5. ✅ Template-Switching funktioniert ohne Reload
6. ✅ Keine Memory-Leaks
7. ✅ Keine Fehler in Browser-Console

---

## 📝 Test-Protokoll

### Template 1: Play Park Dirty

- **Datum:** **\*\***\_\_\_**\*\***
- **Browser:** **\*\***\_\_\_**\*\***
- **FPS:** **\*\***\_\_\_**\*\***
- **Memory:** **\*\***\_\_\_**\*\***
- **Load Time:** **\*\***\_\_\_**\*\***
- **Fehler:** **\*\***\_\_\_**\*\***
- **Status:** ✅ / ❌

### Template 2: Park

- **Datum:** **\*\***\_\_\_**\*\***
- **Browser:** **\*\***\_\_\_**\*\***
- **FPS:** **\*\***\_\_\_**\*\***
- **Memory:** **\*\***\_\_\_**\*\***
- **Load Time:** **\*\***\_\_\_**\*\***
- **Fehler:** **\*\***\_\_\_**\*\***
- **Status:** ✅ / ❌

### Template-Switching

- **Datum:** **\*\***\_\_\_**\*\***
- **Browser:** **\*\***\_\_\_**\*\***
- **Wechsel funktioniert:** ✅ / ❌
- **Memory-Leaks:** ✅ / ❌
- **Fehler:** **\*\***\_\_\_**\*\***
- **Status:** ✅ / ❌

---

**Viel Erfolg beim Testen! 🚀**
