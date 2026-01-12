# Template-Integration: Workflow für Designer

**Version:** 1.0  
**Datum:** 2026-01-11

---

## 📋 Übersicht

Dieses Dokument beschreibt den vollständigen Workflow zur Integration eines Designer-Templates in das WattWelten Metaverse.

---

## 🚀 Schnellstart

### Schritt 1: Template-Verzeichnis erstellen

```bash
# Neues Template-Verzeichnis erstellen
mkdir -p apps/web/public/templates/my-template-name
cd apps/web/public/templates/my-template-name
```

### Schritt 2: Assets vorbereiten

Lade die Designer-Briefings:

- **Deutsch**: `docs/DESIGNER_BRIEFING_DE.md`
- **English**: `docs/DESIGNER_BRIEFING_EN.md`

Folge den Anweisungen in den Briefings, um:

- `scene.glb` zu erstellen
- `hdri.hdr` herunterzuladen
- `manifest.json` zu erstellen
- Optionale Assets vorzubereiten

### Schritt 3: Template importieren

```bash
# Zurück zum Projekt-Root
cd C:\cursor.ai\WattWelten_Metaverse

# Template importieren (falls Import-Script vorhanden)
node scripts/import-template.js ./designer-delivery/my-template-name
```

Oder manuell:

1. Alle Dateien in `apps/web/public/templates/my-template-name/` kopieren
2. `manifest.json` validieren (JSON-Syntax prüfen)

### Schritt 4: Template registrieren

**Option A: Automatisch (empfohlen)**

Das System lädt Templates automatisch aus `apps/web/public/templates/`.

**Option B: Manuell**

Falls `templates.json` existiert, Template hinzufügen:

```json
{
  "default": "watt-eco",
  "items": [
    { "id": "watt-eco", "name": "Watt Eco", "path": "/templates/watt-eco/manifest.json" },
    {
      "id": "my-template-name",
      "name": "My Template Name",
      "path": "/templates/my-template-name/manifest.json"
    }
  ]
}
```

### Schritt 5: Validierung

```bash
# Template validieren
node scripts/validate-templates.ts my-template-name

# Oder manuell prüfen:
# - manifest.json ist valide JSON
# - scene.glb existiert und lädt
# - hdri.hdr existiert (falls referenziert)
# - Alle Pfade sind relativ
```

### Schritt 6: Testen

```bash
# Web-App starten
cd apps/web && pnpm dev

# Im Browser öffnen:
# http://localhost:5173?template=my-template-name
```

**Erwartetes Ergebnis:**

- Template lädt ohne Fehler
- Szene ist sichtbar
- Beleuchtung wirkt korrekt
- Performance: 60 FPS (Desktop)

---

## 📂 Datei-Struktur

### Erwartete Struktur

```
apps/web/public/templates/my-template-name/
├── manifest.json          # ✅ Pflicht
├── scene.glb             # ✅ Pflicht
├── hdri.hdr              # ✅ Pflicht
├── navmesh.glb           # ⚪ Optional
├── ui-skin.css           # ⚪ Optional
├── ambient/               # ⚪ Optional
│   ├── background.mp3
│   └── ...
└── README.md             # ⚪ Optional (Credits)
```

### Strapi-Integration (optional)

Templates können auch über Strapi CMS verwaltet werden:

1. Scene in Strapi Admin erstellen
2. Assets hochladen
3. Manifest-Daten eingeben
4. Template wird automatisch verfügbar (wenn `VITE_CMS_PROVIDER=strapi`)

---

## 🔍 Validierung

### Automatische Validierung

```bash
# Alle Templates validieren
node scripts/validate-templates.ts

# Spezifisches Template validieren
node scripts/validate-templates.ts my-template-name
```

### Manuelle Checkliste

- [ ] `manifest.json` ist valide JSON
- [ ] `scene.glb` existiert und ist < 50MB
- [ ] `hdri.hdr` existiert (falls referenziert)
- [ ] Alle Pfade in `manifest.json` sind relativ
- [ ] Spawn-Position ist korrekt (Y = 1.6m)
- [ ] Zonen sind definiert (mindestens 1 Zone)
- [ ] Template lädt im Browser ohne Fehler
- [ ] Performance: 60 FPS (Desktop)

---

## 🐛 Troubleshooting

### Template lädt nicht

**Problem**: Template erscheint nicht im Template-Switcher

**Lösung**:

1. Prüfe ob `manifest.json` valide JSON ist
2. Prüfe ob Template-ID eindeutig ist
3. Prüfe ob `templates.json` aktualisiert wurde (falls verwendet)
4. Browser-Cache leeren

### Szene ist schwarz/unsichtbar

**Problem**: Szene lädt, aber ist nicht sichtbar

**Lösung**:

1. Prüfe Beleuchtung in `manifest.json`
2. Prüfe ob HDRI korrekt geladen wird
3. Prüfe ob `scene.glb` korrekt exportiert wurde (Y-Up)
4. Prüfe Browser-Console für Fehler

### Performance-Probleme

**Problem**: Niedrige FPS (< 60 auf Desktop)

**Lösung**:

1. Reduziere Polygon-Anzahl
2. Reduziere Textur-Auflösungen
3. Erstelle LOD-Varianten für große Objekte
4. Nutze Draco-Kompression
5. Nutze KTX2-Texturen

### Assets fehlen

**Problem**: Fehler beim Laden von Assets

**Lösung**:

1. Prüfe ob alle Pfade in `manifest.json` korrekt sind
2. Prüfe ob Dateien im richtigen Verzeichnis sind
3. Prüfe ob Dateinamen exakt übereinstimmen (Groß-/Kleinschreibung)
4. Prüfe Browser-Console für 404-Fehler

---

## 📚 Referenzen

- **Designer-Briefing (DE)**: `docs/DESIGNER_BRIEFING_DE.md`
- **Designer-Briefing (EN)**: `docs/DESIGNER_BRIEFING_EN.md`
- **Template-System**: `docs/templates.md`
- **Asset-Guide**: `docs/assets-shopping.md`
- **Performance-Guide**: `docs/performance.md`

---

## ✅ Erfolgreiche Integration

Ein Template ist erfolgreich integriert, wenn:

1. ✅ Template erscheint im Template-Switcher
2. ✅ Template lädt ohne Fehler
3. ✅ Szene ist sichtbar und korrekt beleuchtet
4. ✅ Performance: 60 FPS (Desktop), 40 FPS (Mobile)
5. ✅ Zonen funktionieren (Audio-Isolation)
6. ✅ Avatare können sich bewegen (mit NavMesh)
7. ✅ Template kann zur Laufzeit gewechselt werden

---

**Viel Erfolg bei der Template-Integration! 🚀**
