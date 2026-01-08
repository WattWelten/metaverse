# Landscape Template Catalog

## 🌲 Forest Templates

### forest-sunset

- **Name**: Forest Sunset
- **Source**: PolyHaven
- **HDRI**: forest_slope
- **Style**: Realistic
- **Description**: Realistic forest with sunset lighting, perfect for warm, atmospheric scenes

### forest-dawn

- **Name**: Forest Dawn
- **Source**: PolyHaven
- **HDRI**: spruit_sunrise
- **Style**: Realistic
- **Description**: Forest at dawn with morning mist, ideal for peaceful, serene environments

### forest-autumn

- **Name**: Autumn Forest
- **Source**: PolyHaven
- **HDRI**: kiara_1_dawn
- **Style**: Realistic
- **Description**: Autumn forest with warm colors, great for seasonal themes

## ⛰️ Mountain Templates

### mountain-peak

- **Name**: Mountain Peak
- **Source**: PolyHaven
- **HDRI**: sunset_jhb_central
- **Style**: Realistic
- **Description**: Mountain peak with dramatic lighting, perfect for epic landscapes

## 🏖️ Beach Templates

### beach-sunset

- **Name**: Beach Sunset
- **Source**: PolyHaven
- **HDRI**: sunset_jhb_central
- **Style**: Realistic
- **Description**: Tropical beach at sunset, ideal for relaxing, vacation-themed spaces

## 🏜️ Desert Templates

### desert-dunes

- **Name**: Desert Dunes
- **Source**: PolyHaven
- **HDRI**: sunset_jhb_central
- **Style**: Realistic
- **Description**: Desert landscape with sand dunes, great for adventure themes

## 📥 Download

```bash
# Download all templates
pnpm templates:download

# Download specific template
pnpm templates:download --template forest-sunset

# Download by category
pnpm templates:download --category forest
```

## 🔧 Integration

Templates werden automatisch in `packages/assets/templates/` gespeichert und können über das Template-System geladen werden:

```typescript
// In World.ts
await this.templateHost.loadTemplate('forest-sunset');
```

## 🎨 Customization

Jedes Template kann über das Manifest angepasst werden:

```json
{
  "id": "forest-sunset",
  "name": "Forest Sunset",
  "lighting": {
    "exposure": 1.2,
    "ambient": {
      "intensity": 0.4
    }
  },
  "spawn": {
    "position": [0, 1.6, 6]
  }
}
```

## 📊 Template Statistics

- **Total Templates**: 5
- **Categories**: 4 (Forest, Mountain, Beach, Desert)
- **Sources**: PolyHaven (primary)
- **License**: CC0 (Public Domain)

## 🔄 Updates

Templates können aktualisiert werden durch erneutes Ausführen des Download-Scripts. Bestehende Assets werden überschrieben.
