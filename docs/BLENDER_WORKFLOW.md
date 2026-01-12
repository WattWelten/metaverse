# Blender Workflow: Template-Optimierung für MVP

**Datum:** 2026-01-12  
**Status:** ⏳ Template-Host-Fix implementiert, Blender-Installation läuft

---

## 🎯 Ziel

Die Templates (`park.glb`, `play-park-dirty.glb`) sind importiert, aber benötigen:

1. **NavMesh-Generierung** (für Avatar-Navigation)
2. **Performance-Optimierung** (LOD, Textur-Kompression)
3. **Validierung** (Performance-Tests)

---

## 📋 Schritt-für-Schritt: Blender-Workflow

### Schritt 1: Template in Blender öffnen

1. **Blender öffnen** (Version 3.6+ empfohlen)
2. **File → Import → glTF 2.0 (.glb/.gltf)**
3. **Template auswählen:**
   - `apps/web/public/templates/park/scene.glb`
   - Oder: `apps/web/public/templates/play-park-dirty/scene.glb`

**Wichtig:**

- Prüfe ob Scene korrekt geladen wird
- Prüfe ob Texturen vorhanden sind
- Prüfe ob Beleuchtung korrekt ist

---

### Schritt 2: NavMesh generieren

**Option A: Blender Addon (NavMesh Baker)**

1. **Addon installieren:**
   - Edit → Preferences → Add-ons
   - Suche: "NavMesh" oder "Navigation Mesh"
   - Empfohlen: "NavMesh Baker" oder "Recast Navigation"

2. **NavMesh erstellen:**
   - Wähle alle Objekte aus, die begehbar sein sollen
   - Addon-Menü öffnen
   - "Bake NavMesh" oder "Generate NavMesh"
   - Export als `navmesh.glb`

**Option B: Manuell (einfacher für MVP)**

1. **Begehbare Flächen identifizieren:**
   - Welche Flächen sollen Avatare betreten können?
   - (z.B. Boden, Wege, Plattformen)

2. **Einfache NavMesh erstellen:**
   - Plane erstellen (Shift+A → Mesh → Plane)
   - Auf begehbare Flächen skalieren/positionieren
   - Als `navmesh.glb` exportieren

**Export:**

- File → Export → glTF 2.0 (.glb)
- Dateiname: `navmesh.glb`
- Speichern in: `apps/web/public/templates/park/navmesh.glb`

---

### Schritt 3: Performance-Optimierung

#### 3.1 Geometrie reduzieren

**Für große Objekte (> 10.000 Polygone):**

1. Objekt auswählen
2. Edit Mode (Tab)
3. Mesh → Decimate
4. Ratio: 0.5-0.7 (50-70% Reduktion)
5. Apply

**Ziel:** Scene < 20 MB (nach DRACO-Kompression)

#### 3.2 Texturen optimieren

**Textur-Größe reduzieren:**

1. Image Editor öffnen
2. Textur auswählen
3. Image → Save As → PNG/JPEG
4. Größe reduzieren: 2048x2048 oder 1024x1024 (statt 4K)
5. Neu zuweisen

**KTX2-Konvertierung:**

- Wird automatisch beim Import-Script gemacht
- Manuell: `npx gltf-transform ktx texture.png texture.ktx2`

#### 3.3 LOD-Varianten (optional, für große Scenes)

**Level of Detail erstellen:**

1. Original-Objekt duplizieren
2. Decimate anwenden (höhere Reduktion)
3. Benennen: `ObjectName_LOD1`, `ObjectName_LOD2`
4. In Scene organisieren

**Ziel:** Automatisches LOD-Switching basierend auf Distanz

---

### Schritt 4: Export

1. **Scene exportieren:**
   - File → Export → glTF 2.0 (.glb)
   - **Wichtig:** "Selected Objects Only" deaktivieren (ganze Scene)
   - "Apply Modifiers" aktivieren
   - "Export" klicken

2. **NavMesh exportieren:**
   - NavMesh-Objekt auswählen
   - File → Export → glTF 2.0 (.glb)
   - Dateiname: `navmesh.glb`
   - Speichern in Template-Verzeichnis

---

### Schritt 5: Template aktualisieren

**Manifest aktualisieren:**

```json
{
  "id": "park",
  "name": "Park",
  "version": "1.0.0",
  "assets": {
    "scene": "scene.glb",
    "hdri": "hdri.hdr",
    "navmesh": "navmesh.glb" // ← Neu hinzugefügt
  }
  // ... rest of manifest
}
```

**Import-Script ausführen (optional):**

```bash
pnpm import-template:enhanced apps/web/public/templates/park
```

---

## 🧪 Validierung

### Performance-Test

1. **Template laden:**

   ```
   http://localhost:5173?template=park
   ```

2. **FPS prüfen:**
   - Browser-Console: `console.log(window.__perf?.fps)`
   - Sollte ≥ 50 FPS sein (Desktop)

3. **Memory prüfen:**
   - Chrome DevTools → Performance → Memory
   - Sollte < 500 MB sein

### Asset-Check

```bash
# Template validieren
pnpm templates:validate park
```

**Erwartetes Ergebnis:**

- ✅ Manifest vorhanden
- ✅ Scene.glb vorhanden
- ✅ HDRI vorhanden
- ✅ NavMesh vorhanden (neu)
- ✅ Performance Score: ≥ 80/100

---

## 📊 Checkliste

### Vor Blender:

- [ ] Blender installiert (Version 3.6+)
- [ ] Template-Dateien lokalisiert
- [ ] Backup erstellt (optional)

### In Blender:

- [ ] Template geöffnet und geprüft
- [ ] NavMesh generiert
- [ ] Geometrie optimiert (falls nötig)
- [ ] Texturen optimiert (falls nötig)
- [ ] Scene exportiert als `scene.glb`
- [ ] NavMesh exportiert als `navmesh.glb`

### Nach Blender:

- [ ] Dateien in Template-Verzeichnis kopiert
- [ ] Manifest aktualisiert (`navmesh: "navmesh.glb"`)
- [ ] Template validiert (`pnpm templates:validate park`)
- [ ] Performance getestet (FPS ≥ 50)
- [ ] Browser-Test durchgeführt

---

## 🎯 Erfolgskriterien

Ein Template ist **produktionsreif**, wenn:

1. ✅ Scene lädt ohne Fehler
2. ✅ NavMesh vorhanden und funktioniert
3. ✅ Performance: ≥ 50 FPS (Desktop)
4. ✅ Scene-Größe: < 20 MB (nach DRACO)
5. ✅ Alle Assets vorhanden (Scene, HDRI, Audio, NavMesh)
6. ✅ Validierung erfolgreich (Score ≥ 80/100)

---

## 🐛 Troubleshooting

### NavMesh wird nicht geladen

**Problem:** NavMesh erscheint nicht oder funktioniert nicht

**Lösung:**

1. Prüfe ob `navmesh.glb` existiert
2. Prüfe Manifest: `"navmesh": "navmesh.glb"`
3. Prüfe Browser-Console auf Fehler
4. Prüfe ob NavMesh bei Y=0 ist (Avatar-Höhe)

### Performance-Probleme

**Problem:** Niedrige FPS (< 50)

**Lösung:**

1. Geometrie weiter reduzieren (Decimate)
2. Texturen kleiner machen (1024x1024)
3. Unnötige Objekte entfernen
4. LOD-Varianten erstellen

### Scene lädt nicht

**Problem:** Scene erscheint nicht oder ist schwarz

**Lösung:**

1. Prüfe ob `scene.glb` existiert
2. Prüfe Browser-Console auf Fehler
3. Prüfe ob Beleuchtung korrekt ist (HDRI)
4. Prüfe ob Scene bei Y=0 exportiert wurde

---

## 📚 Ressourcen

- **Blender Dokumentation:** https://docs.blender.org/
- **glTF Export Guide:** https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html
- **NavMesh Addons:**
  - NavMesh Baker: https://github.com/...
  - Recast Navigation: https://github.com/recastnavigation/recastnavigation

---

**Viel Erfolg mit Blender! 🎨**
