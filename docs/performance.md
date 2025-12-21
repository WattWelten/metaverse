# Performance Guide

## Performance-Targets

- **Desktop**: 60 FPS
- **Mobile**: 40 FPS
- **Bundle-Size**: <2MB initial load (gzip)

## Aktuelle Performance

### Bundle-Size (Build)

- **Three.js**: ~527 KB (gzip: ~134 KB) ⚠️
- **React**: ~142 KB (gzip: ~45 KB)
- **App Code**: ~355 KB (gzip: ~112 KB)
- **Gesamt**: ~1 MB (gzip: ~290 KB) ✅

### Optimierungen

#### 1. Code-Splitting

- ✅ Three.js in separaten Chunk
- ✅ React in separaten Chunk
- ✅ Feature-Packages (AI, Voice, XR) können lazy geladen werden

#### 2. Asset-Optimierung

- ✅ KTX2 Texturen (komprimiert)
- ✅ Draco Geometrie-Kompression
- ✅ PMREM Cache für HDRI
- ✅ LOD-System für Distanz-basiertes Switching

#### 3. Lazy-Loading

- ✅ Audio-Context Resume (lazy import)
- ⚠️ Feature-Packages können lazy geladen werden (AI, Voice, XR)

## Performance-Monitoring

### FPS-Monitoring

- Real-time FPS-Anzeige im HUD
- Debug-Overlay zeigt detaillierte Stats (FPS, Draw Calls, GPU)

### Bundle-Analyse

```bash
# Nach Build ausführen
pnpm build
pnpm analyze:bundle
```

## Optimierungs-Empfehlungen

### 1. Lazy-Loading für Features

```typescript
// Statt direkter Import
import { AgentBridge } from '@metaverse/ai';

// Lazy-Load wenn Feature aktiviert
if (flags.AI_ENABLED) {
  const { AgentBridge } = await import('@metaverse/ai');
}
```

### 2. Three.js Optimierung

- Nur benötigte Three.js Module importieren
- Controls und Loader lazy laden wenn möglich

### 3. Asset-Lazy-Loading

- Templates lazy laden
- HDRI lazy laden
- Audio-Dateien lazy laden

### 4. Post-Processing

- Optional machen (Feature-Flag)
- Nur aktivieren wenn benötigt

## Performance-Tests

### FPS-Test

1. Öffne Debug-Overlay (F12)
2. Prüfe FPS-Anzeige
3. Ziel: 60 FPS auf Desktop, 40 FPS auf Mobile

### Bundle-Size-Test

```bash
pnpm build
pnpm analyze:bundle
```

### Memory-Profiling

- Chrome DevTools → Performance → Memory
- Prüfe auf Memory-Leaks bei Template-Switching

## Bekannte Performance-Probleme

### Three.js Bundle-Größe

- **Problem**: Three.js ist groß (~527 KB)
- **Lösung**: Bereits in separaten Chunk, weitere Optimierung möglich mit Tree-Shaking

### Template-Loading

- **Problem**: Template-Switching kann kurzzeitig FPS-Drop verursachen
- **Lösung**: LOD-System, asynchrones Laden

## Nächste Schritte

- [ ] Lazy-Loading für Feature-Packages implementieren
- [ ] Post-Processing optional machen
- [ ] Memory-Profiling durchführen
- [ ] Performance-Benchmarks erstellen
