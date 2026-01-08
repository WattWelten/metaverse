# RPM Creator & Avatar-Animationen - Testanleitung

## 🎯 Übersicht

Diese Anleitung beschreibt, wie die Ready Player Me (RPM) Creator Integration und Avatar-Animationen getestet werden können.

## 📋 Voraussetzungen

### 1. Environment-Variablen einrichten

Erstelle eine `.env.local` Datei in `apps/web/` (basierend auf `.env.example`):

```bash
# Ready Player Me Integration
# Optional: Frame API funktioniert auch ohne API Key, aber API Key ermöglicht bessere Integration
# API Key erhalten: https://readyplayer.me/developers
VITE_READY_PLAYER_ME_API_KEY=your-api-key-here
```

**Hinweis**: Der API Key ist optional. Die Ready Player Me Frame API funktioniert auch ohne API Key für öffentliche Nutzung, aber mit API Key sind erweiterte Features verfügbar.

### 2. Dev-Server starten

```bash
pnpm dev
```

## 🧪 Test 1: RPM Creator Integration

### Schritt 1: Prejoin-Panel öffnen

1. Öffne `http://localhost:5173`
2. Login mit einem Benutzernamen
3. Im Prejoin-Panel sollte der Schritt "Wähle deinen Avatar" erscheinen

### Schritt 2: Avatar auswählen

1. Klicke auf "Avatar auswählen" (oder "Avatar ändern" wenn bereits ein Avatar gesetzt ist)
2. Das `AvatarModal` sollte sich öffnen

### Schritt 3: RPM Creator öffnen

**Option A: Über Galerie-Tab**

1. Im `AvatarModal` sollte der Tab "Galerie" aktiv sein
2. Wenn `VITE_READY_PLAYER_ME_API_KEY` gesetzt ist, sollte ein Button "✨ Neuen Avatar mit Ready Player Me erstellen" sichtbar sein
3. Klicke auf diesen Button

**Option B: Über Erstellen-Tab**

1. Wechsle zum Tab "Erstellen"
2. Wenn `VITE_READY_PLAYER_ME_API_KEY` gesetzt ist, sollte ein Button "Avatar erstellen" sichtbar sein
3. Klicke auf diesen Button

### Schritt 4: Avatar erstellen

1. Das `RpmCreatorModal` sollte sich öffnen mit einem Ready Player Me iframe
2. Erstelle einen Avatar im Ready Player Me Creator
3. Exportiere den Avatar (Button "Export" im RPM Creator)

### Schritt 5: Avatar-URL speichern

**Erwartetes Verhalten:**

- Console-Log: `[RpmCreatorModal] ✅ Avatar exported successfully: <url>`
- Console-Log: `[RpmCreatorModal] Saving avatar URL to preferences`
- Console-Log: `[AvatarModal] Avatar selected: <url>`
- Console-Log: `[AvatarModal] Saving avatar URL to preferences`
- Console-Log: `[PrejoinPanel] Avatar selected: <url>`
- Console-Log: `[PrejoinPanel] Saving avatar URL to preferences`

**Prüfen:**

- Öffne Browser DevTools → Application → Local Storage
- Suche nach `ww_prefs_v1`
- Prüfe ob `avatarUrl` gespeichert ist: `{"avatarUrl":"https://models.readyplayer.me/...","username":"..."}`

### Schritt 6: Avatar beim nächsten Login laden

1. Klicke auf "Weiter" im Prejoin-Panel
2. Klicke auf "Los geht's!" im Controls-Info-Schritt
3. Der Avatar sollte automatisch geladen werden

**Erwartete Console-Logs:**

```
[App] handlePrejoinContinue - Prefs: { username: "...", avatarUrl: "set", quality: "..." }
[App] Loading avatar from URL via World.loadAvatarFromUrl: <url>
[App] Setting local avatar URL via AvatarManager: <url>
[AvatarManager] setLocalAvatarUrl called with URL: <url>
[AvatarManager] Loading RPM avatar from URL: <url>
✅ Avatar loaded with VRM support: GLB only, X animation(s) found
[AvatarManager] Found X animation(s) in avatar
[AvatarManager] Registering animation: "..." (duration: X.XXs)
[AvatarManager] Registered X animation action(s)
[AvatarManager] Starting default idle animation for local avatar
[AvatarManager] Playing animation "idle" → "..."
[AvatarManager] ✅ Animation "idle" started successfully
✅ [AvatarManager] Local avatar loaded from URL: <url>
```

## 🧪 Test 2: Avatar-Animationen

### Schritt 1: Avatar-Loading beobachten

**Console-Logs prüfen:**

1. **Animation-Detection:**

   ```
   [AvatarManager] Found X animation(s) in avatar
   [AvatarManager] Registering animation: "..." (duration: X.XXs)
   [AvatarManager] Registered X animation action(s)
   ```

2. **Idle-Animation Start:**

   ```
   [AvatarManager] Starting default idle animation for local avatar
   [AvatarManager] Playing animation "idle" → "..."
   [AvatarManager] ✅ Animation "idle" started successfully
   ```

3. **Verifikation (100ms später):**
   - Keine Warnung: `[AvatarManager] ⚠️ Animation "idle" was started but is not running!`

### Schritt 2: T-Pose-Problem prüfen

**Wenn keine Animationen gefunden werden:**

```
[AvatarManager] ⚠️ No animations available for local avatar - avatar will remain in T-Pose
[AvatarManager] Available animation names: none
```

**Ursachen:**

- Avatar hat keine Animationen (Ready Player Me Standard-Avatare haben manchmal keine Animationen)
- GLTF wurde nicht korrekt geladen
- Animationen sind in einem anderen Format

**Lösung:**

- Verwende einen Avatar mit Animationen (z.B. von Ready Player Me mit Animations-Pack)
- Prüfe Console-Logs für Details

### Schritt 3: Bewegung testen

1. Klicke auf "Los geht's!" um in die Metaverse zu gelangen
2. Klicke auf "Enter" um Pointer Lock zu aktivieren
3. Bewege dich mit WASD

**Erwartetes Verhalten:**

- Console-Log: `[AvatarManager] Playing animation "walk" → "..."`
- Avatar sollte von "idle" zu "walk" wechseln
- Wenn Bewegung stoppt: `[AvatarManager] Playing animation "idle" → "..."`

**Prüfen:**

- Avatar sollte sich bewegen (nicht gleiten)
- Avatar sollte animiert sein (nicht T-Pose)
- Animation sollte zwischen "idle" und "walk" wechseln

## 🔍 Debugging

### Console-Logs filtern

Verwende Browser DevTools Console-Filter:

- **Nur Avatar-Logs**: Filter: `AvatarManager`
- **Nur RPM-Logs**: Filter: `RpmCreatorModal`
- **Nur Animation-Logs**: Filter: `animation`

### Häufige Probleme

#### 1. RPM Creator öffnet sich nicht

**Symptom**: Button "Avatar erstellen" ist nicht sichtbar

**Ursache**: `VITE_READY_PLAYER_ME_API_KEY` nicht gesetzt

**Lösung**:

- Setze `VITE_READY_PLAYER_ME_API_KEY` in `.env.local`
- Starte Dev-Server neu

#### 2. Avatar bleibt in T-Pose

**Symptom**: Avatar bewegt sich, aber bleibt in T-Pose

**Ursache**: Keine Animationen im Avatar gefunden

**Lösung**:

- Prüfe Console-Logs: `[AvatarManager] Found X animation(s) in avatar`
- Wenn `X = 0`: Avatar hat keine Animationen
- Verwende einen Avatar mit Animationen

#### 3. Animation startet nicht

**Symptom**: Animationen gefunden, aber Avatar bleibt in T-Pose

**Ursache**: Animation-Name stimmt nicht überein

**Lösung**:

- Prüfe Console-Logs: `[AvatarManager] Available animations: ...`
- Prüfe ob "idle" oder ähnliche Animation vorhanden ist
- Fallback sollte erste verfügbare Animation spielen

#### 4. Avatar-URL wird nicht gespeichert

**Symptom**: Avatar wird erstellt, aber nicht gespeichert

**Ursache**: `onExport` Callback wird nicht aufgerufen

**Lösung**:

- Prüfe Console-Logs: `[RpmCreatorModal] ✅ Avatar exported successfully`
- Prüfe Browser Console für Fehler
- Prüfe LocalStorage: `ww_prefs_v1`

## ✅ Erfolgs-Kriterien

### RPM Creator Integration

- [ ] RPM Creator öffnet sich (wenn API Key gesetzt)
- [ ] Avatar kann erstellt werden
- [ ] Avatar-URL wird in Prefs gespeichert
- [ ] Avatar wird beim nächsten Login automatisch geladen

### Avatar-Animationen

- [ ] Animationen werden beim Avatar-Load erkannt
- [ ] Idle-Animation startet automatisch
- [ ] Animation läuft tatsächlich (kein T-Pose)
- [ ] Walk-Animation startet bei Bewegung
- [ ] Idle-Animation startet wenn Bewegung stoppt

## 📝 Notizen

- Ready Player Me Frame API funktioniert auch ohne API Key (öffentliche Nutzung)
- API Key ermöglicht erweiterte Features (Custom Subdomain, etc.)
- Nicht alle Ready Player Me Avatare haben Animationen
- Animation-Namen variieren je nach Avatar-Quelle
- Fallback-Logik spielt erste verfügbare Animation wenn "idle" nicht gefunden wird
