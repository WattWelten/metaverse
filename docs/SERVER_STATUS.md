# Server-Status

## ✅ Aktueller Status

### Web-App (Vite)

- **Port**: 5173
- **Status**: ✅ Läuft
- **URL**: http://localhost:5173

### Server (Express)

- **Port**: 3001
- **Status**: ⚠️ Prüfe manuell
- **URL**: http://localhost:3001

## 🔍 Server prüfen

### Web-App prüfen

```powershell
# Port prüfen
Test-NetConnection -ComputerName localhost -Port 5173

# Browser öffnen
Start-Process "http://localhost:5173"
```

### Server prüfen

```powershell
# Port prüfen
Test-NetConnection -ComputerName localhost -Port 3001

# Health-Check
Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing
```

## 🚀 Server starten (falls nicht läuft)

### Server starten

```bash
cd apps/server
pnpm dev
```

### Web-App starten

```bash
cd apps/web
pnpm dev
```

## 📝 Nächste Schritte

1. ✅ Web-App läuft auf Port 5173
2. ⚠️ Server prüfen (Port 3001)
3. ✅ Browser sollte geöffnet sein
4. 🧪 Tests durchführen

Siehe `docs/MANUAL_TESTING_GUIDE.md` für detaillierte Test-Anleitung.
