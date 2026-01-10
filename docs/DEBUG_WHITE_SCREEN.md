# Debugging: Weißes Browser-Fenster

## 🔍 Schnell-Diagnose

### 1. Browser-Console prüfen

**F12** drücken → **Console Tab** öffnen

**Häufige Fehler:**

- `Root element not found` → HTML-Problem
- `Cannot find module` → Import-Fehler
- `Uncaught TypeError` → JavaScript-Fehler
- `Failed to fetch` → Server-Verbindungsproblem

### 2. Network-Tab prüfen

**F12** → **Network Tab** → Seite neu laden

**Prüfe:**

- ✅ `main.tsx` wird geladen (Status 200)
- ✅ `index.html` wird geladen (Status 200)
- ❌ Rote Einträge = Fehler

### 3. React DevTools prüfen

- Installiere **React Developer Tools** Browser-Extension
- Prüfe ob React-Komponenten gerendert werden

## 🛠️ Häufige Lösungen

### Problem 1: Root-Element nicht gefunden

**Fehler:** `Root element not found`

**Lösung:**

```bash
# Prüfe index.html
cat apps/web/index.html

# Sollte enthalten:
<div id="root"></div>
```

### Problem 2: Import-Fehler

**Fehler:** `Cannot find module '@metaverse/...'`

**Lösung:**

```bash
# Dependencies installieren
cd apps/web
pnpm install

# Build Packages
cd ../..
pnpm -w build
```

### Problem 3: JavaScript-Fehler

**Fehler:** `Uncaught TypeError: ...`

**Lösung:**

1. Browser-Console öffnen (F12)
2. Fehler-Meldung lesen
3. Datei und Zeile notieren
4. Code prüfen

### Problem 4: Server nicht erreichbar

**Fehler:** `Failed to fetch` oder CORS-Fehler

**Lösung:**

```bash
# Server starten
cd apps/server
pnpm dev
```

### Problem 5: Vite Dev-Server Problem

**Fehler:** Keine Antwort vom Dev-Server

**Lösung:**

```bash
# Web-App neu starten
cd apps/web
# Strg+C zum Stoppen
pnpm dev
```

## 🔧 Debugging-Schritte

### Schritt 1: Browser-Console prüfen

1. **F12** drücken
2. **Console Tab** öffnen
3. **Rote Fehler** suchen
4. **Fehler-Meldung** kopieren

### Schritt 2: Network-Tab prüfen

1. **F12** → **Network Tab**
2. **Seite neu laden** (Strg+R)
3. **Rote Einträge** prüfen
4. **Status-Codes** prüfen (sollten 200 sein)

### Schritt 3: Quellcode prüfen

1. **F12** → **Sources Tab**
2. **main.tsx** öffnen
3. **Breakpoints** setzen
4. **Debugging** durchführen

### Schritt 4: React DevTools

1. **React Developer Tools** installieren
2. **Components Tab** öffnen
3. **App-Komponente** prüfen
4. **Props/State** prüfen

## 📝 Checkliste

- [ ] Browser-Console geöffnet (F12)
- [ ] Fehler-Meldungen notiert
- [ ] Network-Tab geprüft
- [ ] Server läuft (Port 3001)
- [ ] Web-App läuft (Port 5173)
- [ ] Dependencies installiert (`pnpm install`)
- [ ] Packages gebaut (`pnpm -w build`)

## 🚨 Sofort-Lösungen

### Lösung 1: Cache leeren

```bash
# Browser-Cache leeren
# Chrome: Strg+Shift+Delete
# Oder: Strg+Shift+R (Hard Reload)
```

### Lösung 2: Dev-Server neu starten

```bash
# Web-App stoppen (Strg+C)
cd apps/web
pnpm dev
```

### Lösung 3: Dependencies neu installieren

```bash
# Root-Verzeichnis
pnpm install

# Packages bauen
pnpm -w build
```

### Lösung 4: Port prüfen

```bash
# Prüfe ob Port 5173 belegt ist
netstat -ano | findstr ":5173"

# Falls belegt, anderen Port verwenden
# In vite.config.ts ändern: port: 5174
```

## 🔍 Erweiterte Diagnose

### React Error Boundary prüfen

Die App hat einen ErrorBoundary. Falls dieser greift:

- Prüfe `apps/web/src/components/ErrorBoundary.tsx`
- Error-Meldung wird angezeigt

### Sentry prüfen

Falls Sentry konfiguriert ist:

- Prüfe Sentry-Dashboard
- Fehler werden dort getrackt

### Logs prüfen

```bash
# Terminal wo pnpm dev läuft
# Prüfe auf Fehler-Meldungen
```

## 💡 Nächste Schritte

1. **Browser-Console öffnen** (F12)
2. **Fehler-Meldung kopieren**
3. **Fehler hier dokumentieren**
4. **Lösung anwenden**

Falls das Problem weiterhin besteht, bitte die **Fehler-Meldung aus der Browser-Console** teilen!
