# Quick Start - Testing

## 🚀 Server & Web-App starten

### Option 1: Automatisch (beide gleichzeitig)

```bash
# Terminal 1: Server
cd apps/server && pnpm dev

# Terminal 2: Web-App
cd apps/web && pnpm dev
```

### Option 2: Manuell

```bash
# Server starten
cd apps/server
pnpm dev
# Läuft auf: http://localhost:3001

# Web-App starten (neues Terminal)
cd apps/web
pnpm dev
# Läuft auf: http://localhost:5173
```

## 🌐 Browser öffnen

Nachdem beide Server laufen:

- Öffne `http://localhost:5173` im Browser
- Für Multi-Browser-Tests: Öffne mehrere Tabs oder verschiedene Browser

## ✅ Quick Test-Checkliste

### Basis-Test (1 Browser)

1. ✅ Server läuft (`http://localhost:3001`)
2. ✅ Web-App läuft (`http://localhost:5173`)
3. ✅ Browser öffnet `http://localhost:5173`
4. ✅ Login funktioniert
5. ✅ Prejoin-Panel erscheint
6. ✅ World lädt (Canvas sichtbar)

### Multi-Browser-Test (2 Browser)

1. ✅ Browser 1: `http://localhost:5173?room=test1`
2. ✅ Browser 2: `http://localhost:5173?room=test1`
3. ✅ Beide Avatare sind sichtbar
4. ✅ Bewegung wird synchronisiert

### Audio-Zonen-Test (2 Browser)

1. ✅ Browser 1: `http://localhost:5173?template=demo-plaza&room=zones`
2. ✅ Browser 2: `http://localhost:5173?template=demo-plaza&room=zones`
3. ✅ Voice aktiviert in beiden
4. ✅ Zone-Isolation funktioniert

### Whiteboard-Test (2 Browser)

1. ✅ Browser 1: `http://localhost:5173?template=demo-meeting&room=whiteboard`
2. ✅ Browser 2: `http://localhost:5173?template=demo-meeting&room=whiteboard`
3. ✅ Whiteboard öffnet sich
4. ✅ Sync funktioniert

## 🔍 Debugging

### Server-Logs prüfen

- Terminal wo `pnpm dev` läuft zeigt Logs
- Fehler werden dort angezeigt

### Browser-Console prüfen

- **F12** → Console Tab
- Errors/Warnings werden angezeigt

### Network-Tab prüfen

- **F12** → Network Tab
- Prüfe ob Assets geladen werden
- Prüfe API-Requests

## 📝 Test-URLs

### Basis

- `http://localhost:5173` - Haupt-App
- `http://localhost:5173/remote` - Companion-Phone

### Mit Template

- `http://localhost:5173?template=demo-plaza&room=plaza`
- `http://localhost:5173?template=demo-meeting&room=meeting`
- `http://localhost:5173?template=watt-eco&room=eco`

### Mit Room

- `http://localhost:5173?room=test1`
- `http://localhost:5173?room=test2`

## 🛑 Server stoppen

### Windows (PowerShell)

```powershell
# Server stoppen
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process

# Oder: Strg+C in den Terminal-Fenstern
```

### Linux/Mac

```bash
# Server stoppen
pkill -f "pnpm dev"

# Oder: Strg+C in den Terminal-Fenstern
```
