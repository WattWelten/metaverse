# Template-Integration: Test-Anleitung

**Datum:** 2026-01-12  
**Status:** ✅ Beide Templates integriert

---

## 📦 Integrierte Templates

### 1. Play Park Dirty

- **ID:** `play-park-dirty`
- **Scene:** 11.96 MB (optimiert von 53.9 MB)
- **HDRI:** sunset-forest.hdr (7.3 MB)
- **Audio:** forest-ambience.mp3 (6.8 MB)
- **Zonen:** 1 Zone

### 2. Park

- **ID:** `park`
- **Scene:** (wird nach Import angezeigt)
- **HDRI:** sunset-forest.hdr (7.3 MB)
- **Audio:** forest-ambience.mp3 (6.8 MB)
- **Zonen:** 1 Zone

---

## 🧪 Lokale Tests

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

### Schritt 2: Template 1 testen (Play Park Dirty)

**URL:** `http://localhost:5173?template=play-park-dirty`

**Checkliste:**

- [ ] Template lädt ohne Fehler
- [ ] Scene ist sichtbar (3D-Modell)
- [ ] Beleuchtung wirkt korrekt (HDRI)
- [ ] Ambient Audio spielt automatisch ab
- [ ] Performance: ~60 FPS (Desktop) oder ~40 FPS (Mobile)
- [ ] Keine Fehler in Browser-Console
- [ ] Template erscheint im Template-Switcher

**Browser-Console prüfen:**

```javascript
// Template-Manifest prüfen
console.log(window.__templateManifest);

// Performance prüfen
console.log(window.__perf);

// Fehler prüfen
console.log(window.__errors || []);
```

---

### Schritt 3: Template 2 testen (Park)

**URL:** `http://localhost:5173?template=park`

**Checkliste:**

- [ ] Template lädt ohne Fehler
- [ ] Scene ist sichtbar (3D-Modell)
- [ ] Beleuchtung wirkt korrekt (HDRI)
- [ ] Ambient Audio spielt automatisch ab
- [ ] Performance: ~60 FPS (Desktop) oder ~40 FPS (Mobile)
- [ ] Keine Fehler in Browser-Console
- [ ] Template erscheint im Template-Switcher

---

### Schritt 4: Template-Switching testen

**URL:** `http://localhost:5173`

**Checkliste:**

- [ ] Template-Switcher ist sichtbar (Dropdown)
- [ ] Beide Templates sind in der Liste
- [ ] Wechsel zu "Play Park Dirty" funktioniert (kein Reload)
- [ ] Wechsel zu "Park" funktioniert (kein Reload)
- [ ] URL wird aktualisiert (`?template=...`)
- [ ] Scene wechselt korrekt
- [ ] Audio wechselt korrekt
- [ ] Keine Memory-Leaks (Performance bleibt stabil)

**Manueller Test:**

1. Öffne Template-Switcher (Dropdown oben)
2. Wähle "Play Park Dirty"
3. Warte bis Template geladen ist
4. Wähle "Park"
5. Warte bis Template geladen ist
6. Wiederhole mehrmals
7. Prüfe Browser-Console auf Fehler

---

### Schritt 5: Performance-Test

**URL:** `http://localhost:5173?template=play-park-dirty`

**Checkliste:**

- [ ] FPS: ≥ 50 (Desktop) oder ≥ 35 (Mobile)
- [ ] Initial Load Time: < 5 Sekunden
- [ ] Memory Usage: < 500 MB (Chrome DevTools)
- [ ] Keine Memory-Leaks bei Template-Switching

**Performance-Metriken prüfen:**

```javascript
// FPS prüfen
console.log('FPS:', window.__perf?.fps);

// Memory prüfen (Chrome DevTools)
// Performance → Memory → Take Heap Snapshot
```

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
3. Prüfe ob `scene.glb` korrekt exportiert wurde (Y-Up)
4. Prüfe Browser-Console für Fehler

---

### Audio spielt nicht ab

**Problem:** Ambient Audio spielt nicht

**Lösung:**

1. Prüfe ob Audio-File existiert
2. Prüfe ob Pfad in `manifest.json` korrekt ist
3. Prüfe Browser-Console für Audio-Fehler
4. Prüfe ob Audio-Feature-Flag aktiviert ist
5. Interagiere mit Seite (Browser erfordert User-Interaction für Audio)

---

### Performance-Probleme

**Problem:** Niedrige FPS (< 50 auf Desktop)

**Lösung:**

1. Prüfe Scene-Größe (sollte < 20 MB sein)
2. Prüfe ob DRACO-Kompression aktiviert ist
3. Prüfe Browser-Console für Warnungen
4. Reduziere Textur-Auflösungen
5. Nutze LOD-Varianten für große Objekte

---

## ✅ Erfolgreiche Integration

Ein Template ist erfolgreich integriert, wenn:

1. ✅ Template lädt ohne Fehler
2. ✅ Scene ist sichtbar und korrekt beleuchtet
3. ✅ Ambient Audio spielt automatisch ab
4. ✅ Performance: 60 FPS (Desktop), 40 FPS (Mobile)
5. ✅ Template-Switching funktioniert ohne Reload
6. ✅ Keine Memory-Leaks
7. ✅ Keine Fehler in Browser-Console

---

**Viel Erfolg beim Testen! 🚀**
