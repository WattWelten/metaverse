# Nächste Schritte - WattWelten Metaverse

## ✅ Erledigt

- [x] Monorepo-Setup mit pnpm + Turborepo
- [x] Alle Packages implementiert (core, ui, avatars, voice, audio, net, ai, content)
- [x] Multiplayer-Server (Socket.io)
- [x] Web-App Basis (Vite + Three.js)
- [x] Ready Player Me Integration
- [x] Spatial Audio System
- [x] Ambient-Audio-System
- [x] AI-Bridge zu wattos_plattform
- [x] Content Provider (Local/Strapi)
- [x] CI/CD Setup (GitHub Actions)
- [x] Dependencies auf neueste Versionen aktualisiert
- [x] Automatisches Update-Script erstellt

## 🔧 Sofortige Fixes (Priorität 1)

### 1. Turbo 2.0 Migration
- [x] `pipeline` → `tasks` in `turbo.json` umbenennen
- [ ] Build testen: `pnpm build`
- [ ] Typecheck testen: `pnpm typecheck`

### 2. Build-Fehler beheben
- [ ] TypeScript-Fehler prüfen und beheben
- [ ] Import-Pfade validieren
- [ ] Missing Dependencies installieren

### 3. Development-Server testen
- [ ] `pnpm dev` erfolgreich starten
- [ ] Client auf http://localhost:5173 erreichbar
- [ ] Server auf http://localhost:3001 erreichbar
- [ ] Template `watt-default` lädt korrekt

## 🚀 MVP-Vervollständigung (Priorität 2)

### 4. Integrationen vervollständigen

#### Multiplayer
- [ ] NetClient in World.ts integrieren
- [ ] Avatar-Synchronisation testen
- [ ] Room-Join/Leave funktioniert
- [ ] State-Sync zwischen Clients testen

#### Avatare
- [ ] Ready Player Me Avatar tatsächlich laden und anzeigen
- [ ] Avatar-Position/Rotation synchronisieren
- [ ] Animationen (Walk, Idle) implementieren
- [ ] Avatar-UI (Auswahl, Anpassung) erstellen

#### Spatial Audio
- [ ] VoiceClient in World.ts integrieren
- [ ] Mic-Consent Modal funktioniert
- [ ] Peer-to-Peer Audio-Verbindung testen
- [ ] Spatial Audio-Effekte (Distance, Reverb) testen

#### Ambient Audio
- [ ] AmbientManager in World.ts integrieren
- [ ] Template-Manifest lädt Ambient-Sounds
- [ ] Audio-Dateien hinzufügen (Placeholder oder echte)
- [ ] Fade-In/Out testen

### 5. UI-Komponenten integrieren

- [ ] HUD in App.tsx einbinden
- [ ] Menu-Komponente funktioniert
- [ ] TemplateSwitcher funktioniert
- [ ] ConsentModal für Mic-Zugriff
- [ ] DebugOverlay (F12) funktioniert

### 6. Template-System

- [ ] Template-Registry funktioniert
- [ ] Hot-Swap zwischen Templates
- [ ] Theme-Tokens werden angewendet
- [ ] Lighting-Presets funktionieren
- [ ] Echte 3D-Szene für watt-default (oder generierte)

## 🧪 Testing & Qualität (Priorität 3)

### 7. Tests erweitern

- [ ] Unit-Tests für Core-Packages
- [ ] Integration-Tests für Multiplayer
- [ ] E2E-Tests erweitern:
  - Template-Switch
  - Avatar-Loading
  - Multiplayer-Verbindung
  - Audio-Consent

### 8. Linting & TypeScript

- [ ] Alle ESLint-Fehler beheben
- [ ] TypeScript strict mode überall
- [ ] Prettier-Formatierung konsistent
- [ ] Pre-Commit-Hooks (Husky) einrichten

## 📚 Dokumentation (Priorität 4)

### 9. Dokumentation erweitern

- [ ] Getting Started Guide vervollständigen
- [ ] API-Dokumentation für Packages
- [ ] Template-Erstellungs-Guide
- [ ] Deployment-Guide
- [ ] Troubleshooting-Guide

### 10. Beispiele & Demos

- [ ] Beispiel-Template erstellen
- [ ] Demo-Szenario dokumentieren
- [ ] Screenshots/Videos hinzufügen

## 🔌 Externe Integrationen (Priorität 5)

### 11. wattos_plattform Integration

- [ ] AgentBridge mit echtem Backend testen
- [ ] WebSocket-Verbindung stabil
- [ ] Tool-Invocations testen
- [ ] Error-Handling verbessern

### 12. Strapi Integration

- [ ] StrapiProvider vollständig testen
- [ ] Content-Upload funktioniert
- [ ] Media-Management

### 13. Ready Player Me

- [ ] Avatar-Erstellung Flow
- [ ] API-Key-Integration
- [ ] Avatar-Customization

## 🎨 Features & Verbesserungen (Priorität 6)

### 14. Post-Processing

- [ ] Bloom-Effekt optional
- [ ] FXAA Anti-Aliasing
- [ ] Performance-Optimierung

### 15. WebXR

- [ ] VR-Modus testen
- [ ] Controller-Support
- [ ] Teleportation

### 16. Performance

- [ ] FPS-Monitoring
- [ ] Asset-Lazy-Loading
- [ ] Code-Splitting optimieren
- [ ] Bundle-Size analysieren

## 📦 Deployment (Priorität 7)

### 17. Production-Build

- [ ] Production-Build testen
- [ ] Environment-Variablen dokumentieren
- [ ] Docker-Setup (optional)
- [ ] Vercel/Netlify Deployment

### 18. CI/CD erweitern

- [ ] Preview-Deployments
- [ ] Automated Testing in CI
- [ ] Release-Automation testen

## 🎯 Quick Wins (kann sofort gemacht werden)

1. **Turbo.json fixen** ✅ (gerade gemacht)
2. **Build testen** - `pnpm build`
3. **Dev-Server starten** - `pnpm dev`
4. **Einfache Integrationen** - NetClient, VoiceClient in World.ts einbinden
5. **UI-Komponenten** - HUD, Menu in App.tsx einbinden
6. **E2E-Tests erweitern** - Mehr Szenarien testen

## 📝 Notizen

- Peer-Dependency-Warnungen bei @readyplayerme/web-3d-viewer sind normal (three.js Version)
- Viele Adapter sind noch Stubs (LiveKit, Janus, VRM, Avaturn) - können später implementiert werden
- Ambient-Audio-Dateien müssen noch hinzugefügt werden (oder Placeholder)

## 🚦 Aktueller Status

- **Code-Basis**: ✅ Vollständig
- **Build**: ⚠️ Muss getestet werden
- **Integrationen**: ⚠️ Teilweise
- **Tests**: ⚠️ Basis vorhanden
- **Dokumentation**: ✅ Grundlagen vorhanden



