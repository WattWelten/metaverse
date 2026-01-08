# Apple-inspiriertes Design-System

## Übersicht

Das WattWelten Metaverse verwendet ein Apple-inspiriertes Design-System mit Fokus auf Klarheit, Deferenz und Tiefe.

## Design-Prinzipien

### 1. Klarheit (Clarity)

- Klare Typografie-Hierarchie
- Deutliche Kontraste
- Fokussierte UI-Elemente

### 2. Deferenz (Deference)

- UI unterstützt den Inhalt, dominiert ihn nicht
- Glassmorphism für subtile Transparenz
- Minimale Ablenkungen

### 3. Tiefe (Depth)

- Layered Interface
- Sanfte Schatten
- Räumliche Hierarchie

## Design-Tokens

### Typografie

**Font Stack:**

- System: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', sans-serif`
- Mono: `'SF Mono', 'Monaco', 'Menlo', monospace`

**Font Sizes (Apple's Typographic Scale):**

- `largeTitle`: 34px
- `title1`: 28px
- `title2`: 22px
- `title3`: 20px
- `headline`: 17px (semibold)
- `body`: 17px
- `callout`: 16px
- `subheadline`: 15px
- `footnote`: 13px
- `caption1`: 12px
- `caption2`: 11px

### Farben (Dark Mode)

**System Colors:**

- `systemBlue`: #0a84ff
- `systemGreen`: #30d158
- `systemIndigo`: #5e5ce6
- `systemOrange`: #ff9f0a
- `systemPink`: #ff375f
- `systemPurple`: #bf5af2
- `systemRed`: #ff453a
- `systemTeal`: #40c8e0
- `systemYellow`: #ffd60a

**Label Colors (für Text):**

- `label`: rgba(255, 255, 255, 0.9) - Primary text
- `labelSecondary`: rgba(255, 255, 255, 0.6) - Secondary text
- `labelTertiary`: rgba(255, 255, 255, 0.4) - Tertiary text
- `labelQuaternary`: rgba(255, 255, 255, 0.18) - Quaternary text

**Fill Colors (für Hintergründe):**

- `fillPrimary`: rgba(120, 120, 128, 0.36)
- `fillSecondary`: rgba(120, 120, 128, 0.32)
- `fillTertiary`: rgba(120, 120, 128, 0.24)
- `fillQuaternary`: rgba(120, 120, 128, 0.18)

### Glassmorphism

**Eigenschaften:**

- `background`: rgba(28, 28, 30, 0.8)
- `backdropBlur`: blur(20px)
- `border`: rgba(255, 255, 255, 0.1)

**Verwendung:**

```css
.glass {
  background: var(--glass-background);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  border: 1px solid var(--glass-border);
}
```

### Animation

**Easing Functions:**

- `easeInOut`: cubic-bezier(0.4, 0, 0.2, 1)
- `easeOut`: cubic-bezier(0, 0, 0.2, 1)
- `easeIn`: cubic-bezier(0.4, 0, 1, 1)
- `spring`: cubic-bezier(0.175, 0.885, 0.32, 1.275)

**Durations:**

- `fast`: 150ms
- `normal`: 250ms
- `slow`: 350ms

### Spacing (8pt Grid System)

- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 40px
- `3xl`: 48px

### Border Radius

- `sm`: 6px
- `md`: 10px
- `lg`: 14px
- `xl`: 20px
- `full`: 9999px (pill)

## Komponenten

### AppleButton

Button im Apple-Stil mit Varianten:

- `primary`: System Blue
- `secondary`: Fill Primary
- `destructive`: System Red

```tsx
import { AppleButton } from '@metaverse/ui';

<AppleButton variant="primary" onClick={handleClick}>
  Weiter
</AppleButton>;
```

### AppleInput

Input-Feld im Apple-Stil mit automatischem Focus-State.

```tsx
import { AppleInput } from '@metaverse/ui';

<AppleInput value={value} onChange={(e) => setValue(e.target.value)} placeholder="Username" />;
```

### AppleModal

Modal mit Glassmorphism und sanften Animationen.

```tsx
import { AppleModal } from '@metaverse/ui';

<AppleModal open={open} onClose={handleClose} title="Einstellungen">
  {/* Content */}
</AppleModal>;
```

### AppleSegmentedControl

Segmented Control für Optionen (z.B. Qualität: Low/Fair/High).

```tsx
import { AppleSegmentedControl } from '@metaverse/ui';

<AppleSegmentedControl
  options={[
    { value: 'low', label: 'Low' },
    { value: 'fair', label: 'Fair' },
    { value: 'high', label: 'High' },
  ]}
  value={quality}
  onChange={(v) => setQuality(v)}
/>;
```

### AppleCard

Card mit Glassmorphism für Grid-Layouts.

```tsx
import { AppleCard } from '@metaverse/ui';

<AppleCard onClick={handleClick}>{/* Content */}</AppleCard>;
```

### AppleSlider

Slider im Apple-Stil.

```tsx
import { AppleSlider } from '@metaverse/ui';

<AppleSlider
  min={0}
  max={1}
  step={0.01}
  value={volume}
  onChange={(e) => setVolume(parseFloat(e.target.value))}
/>;
```

## Usage-Beispiele

### Prejoin Panel

```tsx
<PrejoinPanel onContinue={handleContinue} />
```

### Settings Modal

```tsx
<SettingsModal
  open={settingsOpen}
  onClose={() => setSettingsOpen(false)}
  onViewToggle={() => world.switchView()}
  onQuality={(q) => applyQuality(q)}
/>
```

## Best Practices

1. **Konsistenz**: Verwende immer die Design-Tokens, keine hardcodierten Werte
2. **Hierarchie**: Nutze die Typografie-Skala für klare Hierarchie
3. **Animationen**: Sanfte, natürliche Animationen mit Spring-Easing
4. **Glassmorphism**: Subtile Transparenz, nicht zu stark
5. **Spacing**: Immer 8pt Grid System verwenden

## Weitere Ressourcen

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [SF Pro Font](https://developer.apple.com/fonts/)
