# Scripts

## update-deps.js

Automatisches Dependency-Update-Script, das alle Dependencies auf die neuesten Versionen aktualisiert.

### Verwendung

```bash
pnpm update-deps
```

oder direkt:

```bash
node scripts/update-deps.js
```

### Was macht das Script?

1. Prüft veraltete Packages mit `pnpm outdated`
2. Aktualisiert alle Dependencies auf die neuesten Versionen mit `pnpm update --latest`
3. Installiert die aktualisierten Dependencies mit `pnpm install`

### Hinweise

- ⚠️ **Breaking Changes**: Major-Updates können Breaking Changes enthalten
- ✅ **Testen**: Nach dem Update sollte die Anwendung getestet werden:
  - `pnpm build`
  - `pnpm test`
  - `pnpm dev`

### Peer-Dependency-Warnungen

Einige Packages (z.B. `@readyplayerme/web-3d-viewer`) haben spezifische Peer-Dependency-Anforderungen. Diese Warnungen sind normalerweise unkritisch, solange die Hauptversionen kompatibel sind.



