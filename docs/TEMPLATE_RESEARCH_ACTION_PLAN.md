# Template-Recherche Action Plan – Sofort starten!

**Datum:** 2026-01-11  
**Status:** 🚀 AKTIV – URLs geöffnet  
**Priorität:** HÖCHSTE

---

## ✅ Was wurde bereits gemacht

1. ✅ Interview durchgeführt (40 Fragen beantwortet)
2. ✅ Designer-Briefing erweitert
3. ✅ Template-Spezifikation erstellt
4. ✅ Recherche-Guide erstellt
5. ✅ Download-Ordner erstellt
6. ✅ **URLs im Browser geöffnet** (Sketchfab, PolyHaven, Freesound)

---

## 🎯 JETZT SOFORT (In den geöffneten Browser-Tabs)

### Sketchfab (7 Tabs geöffnet)

**Was zu tun ist:**

1. Durchsuche jeden Tab nach passenden Templates
2. Filter: CC0, CC-BY, Downloadable, GLTF/GLB
3. Prüfe jeden Kandidaten:
   - [ ] Realitätsnah (nicht futuristisch)?
   - [ ] Nordwest-Deutschland-Stil?
   - [ ] Wald + Wasser + Felsen?
   - [ ] Moderne Gebäude?
   - [ ] Größe < 50MB?
   - [ ] Polygone < 500k Tris?
   - [ ] Format: GLTF/GLB?
   - [ ] Lizenz: CC0/CC-BY?

**Für jeden guten Kandidaten:**

- Screenshot machen (Strg+Shift+S oder Browser-Tool)
- Download-Link kopieren
- In `docs/TEMPLATE_CANDIDATE_LIST.md` dokumentieren
- Bewertung (1-5 Sterne) vergeben

---

### PolyHaven (5 Tabs geöffnet)

**Models (3 Tabs):**

1. Forest Models
2. Outdoor Models
3. Nature Models

**HDRI (2 Tabs):**

1. Sunset HDRI → **WICHTIG:** Lade "Sunset Forest" oder "Evening Road" herunter
2. Evening HDRI

**Was zu tun ist:**

- Models: Dokumentiere passende Modelle (Wald, Gebäude, Bänke, Schilder)
- HDRI: **Lade sofort herunter:**
  - "Sunset Forest" (2K für MVP)
  - Speichere in: `template-research-downloads/hdri/sunset-forest.hdr`
  - Link in `template-research-downloads/links.md` speichern

---

### Freesound (3 Tabs geöffnet)

**Audio-Tabs:**

1. Birds Forest
2. Water Nature
3. Forest Ambient

**Was zu tun ist:**

- Suche nach passenden Sounds:
  - Vögel (leise, atmosphärisch)
  - Wasser (leise, natürliches Plätschern)
- **Lade 2-3 Sounds herunter:**
  - Speichere in: `template-research-downloads/audio/`
  - Format: MP3, 44.1kHz, 128-192kbps
  - Links in `template-research-downloads/links.md` speichern

---

## 📋 Dokumentation (Während der Recherche)

### Für jeden Template-Kandidaten

Öffne `docs/TEMPLATE_CANDIDATE_LIST.md` und füge hinzu:

```markdown
### Kandidat X: [Name]

**Plattform:** Sketchfab/PolyHaven  
**Link:** [URL]  
**Lizenz:** CC0/CC-BY  
**Preis:** Kostenlos  
**Format:** GLTF/GLB  
**Größe:** [MB]  
**Polygone:** [Tris]

**Beschreibung:**
[Kurze Beschreibung]

**Screenshots:**

- [Pfad zu Screenshot]

**Bewertung:**

- Realitätsnah: ⭐⭐⭐⭐⭐
- Stil: ⭐⭐⭐⭐⭐
- Landschaft: ⭐⭐⭐⭐⭐
- Gebäude: ⭐⭐⭐⭐⭐
- Performance: ⭐⭐⭐⭐⭐
- Gesamt: ⭐⭐⭐⭐⭐

**Pro:**

- ✅ [Vorteil 1]
- ✅ [Vorteil 2]

**Contra:**

- ❌ [Nachteil 1]

**Download-Link:**
[URL]
```

---

## 🎯 Ziel: Top 5 Kandidaten

**Bis Ende heute:**

- [ ] Mindestens 10 Kandidaten dokumentiert
- [ ] Top 5 identifiziert
- [ ] HDRI heruntergeladen (Sunset Forest)
- [ ] Audio heruntergeladen (Vögel, Wasser)
- [ ] Alle Links in `template-research-downloads/links.md` gespeichert

---

## ⚡ Quick Commands

### URLs erneut öffnen (falls geschlossen)

```bash
# Sketchfab
node scripts/open-research-urls.mjs sketchfab

# PolyHaven
node scripts/open-research-urls.mjs polyhaven

# Freesound
node scripts/open-research-urls.mjs freesound

# Alle
node scripts/open-research-urls.mjs all
```

### Recherche-Guide öffnen

```bash
# Öffne in Editor:
docs/TEMPLATE_RESEARCH_GUIDE.md
```

---

## 📊 Erfolgs-Kriterien

Ein perfekter Kandidat sollte haben:

- ✅ Realitätsnah (Nordwest-Deutschland-Stil)
- ✅ Natürliche Landschaft (Wald, Wasser, Felsen)
- ✅ Moderne Gebäude (Glaswände, minimalistisch)
- ✅ Sonnenuntergangs-Atmosphäre möglich
- ✅ Klein bis Mittel (20-50m)
- ✅ Mehrere Zonen möglich
- ✅ Performance-optimiert (< 50MB, < 500k Tris)
- ✅ Format: GLTF/GLB
- ✅ Lizenz: CC0/CC-BY (kostenlos)

---

## 🚀 LOS GEHT'S!

**Die Browser-Tabs sind geöffnet – jetzt durchsuchen und dokumentieren!**

1. **Sketchfab-Tabs**: Suche nach Templates
2. **PolyHaven-Tabs**: Lade HDRI & Models
3. **Freesound-Tabs**: Lade Audio
4. **Dokumentiere**: In `docs/TEMPLATE_CANDIDATE_LIST.md`
5. **Speichere Links**: In `template-research-downloads/links.md`

---

**Viel Erfolg! 🎯**
