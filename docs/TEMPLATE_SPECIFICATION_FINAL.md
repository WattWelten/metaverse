# Template-Spezifikation – Final (MVP)

**Version:** 1.0  
**Datum:** 2026-01-11  
**Basierend auf:** Interview-Protokoll  
**Status:** Ready for Designer

---

## 🎯 Projekt-Übersicht

**Hauptzweck:**

- Präsentationen & Events
- Meetings & Konferenzen
- Networking & Socializing

**Zielgruppen:**

- B2B (Unternehmen)
- B2G (Behörden)
- Bildungseinrichtungen

**Emotion:**

- Professionell & Seriös
- Innovativ & Modern
- Warm & Einladend
- Natürlich & Organisch
- Interaktive Emotionen: Klatschen, Daumen hoch

---

## 🎨 Design-Spezifikation

### Stil

- **Design-Stil**: Stylized mit photorealistischen Elementen
- **Realitätsnah**: Nordwest-Deutschland, nicht futuristisch
- **Referenzen**:
  - https://moin.metaverse-nordwest.com/
  - https://grids-demo.zreality.com/WAWTroz/brandenburg-demo

### Farbpalette

- **Primär**: Natur (Grün, Braun, Erde) für Landschaft
- **Sekundär**: Neutral (Grau, Beige, Weiß) für Gebäude
- **Harmonie**: Analog (harmonische Farbübergänge)

### Umgebung

- **Typ**: Primär Außen, modern aber integriert
- **Landschaft**: Wald + Wasser + Felsen + Wege/Plattformen
- **Gebäude**: Moderne Architektur (Glaswände, minimalistisch)
- **Größe**: Klein bis Mittel (20-50m, für 5-20 Personen)

### Beleuchtung

- **Tageszeit**: Sonnenuntergang (warm, atmosphärisch)
- **Lichtquelle**: Natürlich (HDRI)
- **Helligkeit**: Mittel bis Hell
- **Farbtemperatur**: Warm (3000-4000K)

---

## 🏗️ Funktionale Anforderungen

### Zonen

- **Main Zone**: 10-15m Radius (Hauptbereich)
- **Stage**: 5-8m Radius (Bühne für Präsentationen)
- **Breakout**: 3-5m Radius pro Zone (Kleingruppen)
- **Lounge**: 5-8m Radius (Entspannungsbereich, optional)

### Interaktive Elemente

- **Bänke**: Sitzgelegenheiten
- **Schilder**: Informations-Tafeln (Wegweiser)
- **Screens**: Bildschirme für Präsentationen

### Navigation

- **Wege**: Klare Wege für Navigation
- **Navigation-Mesh**: Ja (Avatare nur auf bestimmten Flächen)
- **Spawn-Punkt**: Zentral (in der Mitte der Szene)

---

## 🎵 Audio

- **Ambient-Audio**: Ja
- **Art**: Natur (Vögel, Wasser)
- **Lautstärke**: Leise (0.1-0.2, subtiler Hintergrund)

---

## ⚡ Performance-Anforderungen

### Prioritäten

1. **Performance**: 1-2 (sehr wichtig)
2. **Ladezeit**: 1-2 (sehr wichtig)
3. **Visuelle Qualität**: 2-3 (wichtig)
4. **Interaktivität**: 2-3 (wichtig)
5. **Audio-Qualität**: 3-4 (nice-to-have)

### Limits

- **Asset-Größe**: < 50MB (gesamt) - **KRITISCH**
- **Polygone**: < 500k Tris (gesamt) - **KRITISCH**
- **Texturen**: < 100MB (gesamt)
- **Ziel-Geräte**: Laptop (Standard) + Mobile (Smartphones, Tablets)
- **Stil**: Ausgewogen (gute Qualität, gute Performance)

---

## ✅ Must-Have

- ✅ Natürliche Landschaft (Wald, Wasser, Felsen)
- ✅ Sonnenuntergangs-Atmosphäre (warme Beleuchtung)
- ✅ Navigation-Mesh (Wege, Plattformen)
- ✅ Ambient-Audio (Vögel, Wasser, leise)
- ✅ Mehrere Zonen (Main, Stage, Breakout, ggf. Lounge)
- ✅ Interaktive Elemente (Bänke, Schilder, Screens)
- ✅ Realitätsnah (Nordwest-Deutschland-Stil)
- ✅ Moderne Gebäude (Glaswände, minimalistisch)

---

## ❌ Must-Not-Have

- ❌ Futuristische Elemente
- ❌ Zu viele Details (Performance)
- ❌ Zu große Dateien (> 50MB)
- ❌ Komplexe Animationen
- ❌ Es ist ein MVP - Einfach, performant, funktional!

---

## 💰 Budget & Zeitplan

- **Budget**: Maximal 250€ für gesamtes Template (inkl. Assets & Erstellung)
- **Asset-Quellen**: Kostenlos bevorzugt (CC0/CC-BY)
- **Zeitplan**: Sofort (innerhalb 1 Woche)
- **Designer**: Extern über Fiverr

---

## 📦 Deliverables

### Pflicht-Dateien

1. ✅ **scene.glb** – 3D-Szene (optimiert, < 50MB)
2. ✅ **manifest.json** – Konfigurationsdatei
3. ✅ **hdri.hdr** – HDRI-Umgebung (Sonnenuntergang, 2K)

### Optionale Dateien

4. ⚪ **navmesh.glb** – Navigation-Mesh
5. ⚪ **ambient/background.mp3** – Ambient-Audio (Vögel, Wasser)
6. ⚪ **ui-skin.css** – UI-Theme

---

## 📚 Referenzen

- **Interview-Protokoll**: `docs/TEMPLATE_INTERVIEW_PROTOCOL.md`
- **Designer-Briefing (DE)**: `docs/DESIGNER_BRIEFING_DE.md`
- **Designer-Briefing (EN)**: `docs/DESIGNER_BRIEFING_EN.md`
- **Recherche-Guide**: `docs/TEMPLATE_RESEARCH_GUIDE.md`

---

**Spezifikation erstellt:** 2026-01-11
