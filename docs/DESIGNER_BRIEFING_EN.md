# Designer Briefing: 3D Template for WattWelten Metaverse

**Version:** 1.0  
**Date:** 2026-01-11  
**Project:** WattWelten Metaverse  
**Goal:** Professional 3D template for immersive WebXR experiences

---

## 📋 Project Overview

WattWelten Metaverse is a WebXR platform for immersive 3D experiences in the browser. Templates are complete 3D environments that can be loaded and switched at runtime without reloading the page.

### What is a Template?

A template consists of:

- **3D Scene** (scene.glb) – The main environment
- **HDRI Environment** (hdri.hdr) – Photorealistic lighting
- **Navigation Mesh** (navmesh.glb, optional) – For avatar movement
- **Ambient Audio** (optional) – Background sounds
- **Manifest** (manifest.json) – Configuration file
- **UI Theme** (ui-skin.css, optional) – Colors and styling

---

## 🎯 Design Goals

### Primary Goals

1. **Performance**: 60 FPS on desktop, 40 FPS on mobile
2. **Quality**: Photorealistic or stylish low-poly aesthetic
3. **Functionality**: Multiplayer-ready, interactive, immersive
4. **Compatibility**: Works in all modern browsers

### Target Audience

- **Desktop**: Chrome, Firefox, Safari, Edge (Windows, macOS, Linux)
- **Mobile**: iOS Safari, Android Chrome
- **XR**: WebXR-capable headsets (optional)

---

## 🔧 Technical Specifications

### 1. 3D Scene (scene.glb)

#### Format & Export

- **Format**: GLTF Binary (.glb)
- **Software**: Blender 3.0+ (recommended)
- **Coordinate System**: Y-Up (Blender standard)
- **Scale**: 1 meter = 1 Blender unit
- **Transform**: Apply All Transforms before export

#### Export Settings (Blender)

```
File → Export → glTF 2.0

✓ Include:
  - Selected Objects (if exporting only scene)
  - Custom Properties
  - UVs
  - Normals
  - Tangents
  - Vertex Colors

✓ Transform:
  - +Y Up
  - Apply Modifiers

✓ Geometry:
  - Apply Modifiers
  - UVs
  - Normals
  - Tangents
  - Vertex Colors

✓ Compression:
  - Draco (optional, recommended)
    - Quantization: Pos 14, Normals 10, UVs 12, Colors 8
```

#### Polygon Limits

| Object Type  | LOD0 (Hero) | LOD1 (Medium) | LOD2 (Far)  |
| ------------ | ----------- | ------------- | ----------- |
| Main Objects | ≤ 25k Tris  | ≤ 10-15k Tris | ≤ 3-5k Tris |
| Vegetation   | ≤ 5k Tris   | ≤ 2k Tris     | ≤ 500 Tris  |
| Props        | ≤ 2k Tris   | ≤ 1k Tris     | ≤ 300 Tris  |

**Recommendation**: For web optimization, prefer low-poly style.

#### LOD System (Level of Detail)

If large objects are present, create LOD variants:

**Naming Convention:**

```
Parent Empty: "Turbine"
  ├── Child: "Turbine_LOD0" (Hero, full details)
  ├── Child: "Turbine_LOD1" (Medium, reduced details)
  └── Child: "Turbine_LOD2" (Far, minimal details)
```

**LOD Creation (Blender):**

1. Duplicate original object
2. Apply Decimate Modifier:
   - LOD1: Ratio 0.35-0.5
   - LOD2: Ratio 0.1-0.2
3. Merge by Distance (merge loose vertices)
4. Normals: Recalculate Outside
5. Name: `ObjectName_LOD0/1/2`

#### Textures

**Resolutions:**

- **Hero Objects**: 2048×2048 (Albedo, Roughness, Metallic, Normal)
- **Vegetation**: 512-1024×512-1024
- **Ground/Terrain**: 2048×2048
- **Props**: 512-1024×512-1024

**Texture Maps:**

- **Albedo/Diffuse**: Base color
- **Normal Map**: Surface details (OpenGL convention, -Y)
- **Roughness**: Gloss/matte (grayscale)
- **Metallic**: Metal properties (grayscale)
- **AO** (optional): Ambient Occlusion

**Optimization:**

- KTX2 compression recommended (automatically converted)
- ETC1S for vegetation (small, good quality)
- UASTC for hero objects (higher quality)

#### Materials

- **PBR (Physically Based Rendering)**: Standard materials
- **Metallic/Roughness Workflow**: Preferred
- **No Custom Shaders**: Only standard materials
- **Transparency**: Use sparingly (performance)

#### Lighting in Scene

- **No Lights in scene.glb**: Lighting comes from HDRI/Manifest
- **Bake Shadows** (optional): Baked into textures
- **Lightmaps** (optional): For static lighting

### 2. HDRI Environment (hdri.hdr)

#### Format & Specifications

- **Format**: HDR or EXR
- **Resolution**:
  - MVP: 2K (2048×1024)
  - Production: 4K (4096×2048)
- **Type**: Equirectangular (360°)

#### Recommended Sources

**Free (CC0):**

- **PolyHaven**: https://polyhaven.com/hdris
  - "Sunset Forest" (warm, atmospheric)
  - "Forest Path" (natural, bright)
  - "Evening Road" (dramatic, warm)
  - "Spruit Sunrise" (peaceful, morning)

**Paid:**

- **HDRI Haven**: https://hdrihaven.com
- **NoEmotion HDRIs**: https://noemotionhdrs.com

#### Integration

1. Download HDRI
2. Save as `hdri.hdr` in template directory
3. Reference in manifest: `"hdri": "hdri.hdr"`

### 3. Navigation Mesh (navmesh.glb, optional)

#### Format & Specifications

- **Format**: GLTF Binary (.glb)
- **Geometry**: Only walkable surfaces
- **Materials**: None (or simple material)
- **Name**: "NavMesh" or "Navigation"
- **Scale**: Identical to scene.glb

#### Creation (Blender)

1. Duplicate scene
2. Keep only walkable surfaces (ground, paths, platforms)
3. Remove non-walkable objects (walls, obstacles)
4. Assign simple material (optional)
5. Export as `navmesh.glb`

**Important**: NavMesh should not have textures or complex materials.

### 4. Ambient Audio (ambient/\*.mp3, optional)

#### Format & Specifications

- **Format**: MP3
- **Sample Rate**: 44.1kHz
- **Bitrate**: 128-192kbps
- **Loop**: Must loop seamlessly
- **Duration**: 10-30 seconds (for loop)

#### Recommended Sources

**Free (CC0):**

- **Freesound**: https://freesound.org
  - Search: "birds", "wind", "forest ambient", "water"
  - Filter: CC0 License
- **Zapsplat**: https://www.zapsplat.com
  - Category: Nature, Ambient

**Paid:**

- **AudioJungle**: https://audiojungle.net
- **Epidemic Sound**: https://www.epidemicsound.com

#### File Structure

```
ambient/
  ├── background.mp3    # Main ambient sound
  ├── birds.mp3         # Bird sounds (optional)
  └── wind.mp3          # Wind sounds (optional)
```

### 5. Manifest (manifest.json)

#### Complete Template

```json
{
  "id": "my-template-name",
  "name": "My Template Name",
  "version": "1.0.0",
  "description": "Short description of the template",

  "assets": {
    "scene": "scene.glb",
    "hdri": "hdri.hdr",
    "navmesh": "navmesh.glb"
  },

  "lighting": {
    "exposure": 1.0,
    "hdri": "hdri.hdr",
    "ambient": {
      "color": "#ffffff",
      "intensity": 0.4
    },
    "directional": {
      "color": "#ffffff",
      "intensity": 0.8,
      "position": {
        "x": 5,
        "y": 10,
        "z": 5
      }
    }
  },

  "spawn": {
    "position": [0, 1.6, 0],
    "rotationY": 0
  },

  "zones": [
    {
      "id": "main-zone",
      "label": "Main Zone",
      "shape": "circle",
      "center": [0, 0],
      "radius": 10,
      "isStage": false,
      "maxParticipants": 20
    },
    {
      "id": "stage",
      "label": "Stage",
      "shape": "circle",
      "center": [0, 0],
      "radius": 5,
      "isStage": true,
      "maxParticipants": 10
    }
  ],

  "portals": [
    {
      "id": "portal-1",
      "position": {
        "x": 10,
        "y": 1.6,
        "z": 0
      },
      "target": "another-template"
    }
  ],

  "ambient": {
    "sources": [
      {
        "id": "background",
        "file": "ambient/background.mp3",
        "volume": 0.3,
        "loop": true,
        "position": {
          "x": 0,
          "y": 1.6,
          "z": 0
        }
      }
    ]
  },

  "props": [
    {
      "id": "bench-1",
      "type": "bench",
      "pos": [5, 0, 5],
      "rotY": 1.57,
      "seats": 4
    },
    {
      "id": "sign-1",
      "type": "sign",
      "pos": [0, 1.6, 10],
      "rotY": 0,
      "text": "Welcome"
    }
  ],

  "ui": {
    "showMinimap": true,
    "showZoneLabels": true,
    "theme": "warm"
  }
}
```

#### Important Fields

- **id**: Unique template ID (lowercase, kebab-case)
- **name**: Display name in template switcher
- **spawn.position**: [x, y, z] in meters, Y = 1.6m (eye height)
- **zones**: Audio zones for multiplayer
- **portals**: Teleport points to other templates

### 6. UI Theme (ui-skin.css, optional)

#### CSS Variables

```css
:root {
  --color-primary: #ffaa66;
  --color-secondary: #8b6f47;
  --color-background: rgba(20, 15, 10, 0.85);
  --color-text: #f5e6d3;
  --color-accent: #4ecdc4;

  --glass-background: rgba(20, 15, 10, 0.7);
  --glass-backdrop-blur: blur(20px);
  --glass-border: rgba(255, 255, 255, 0.1);

  --font-system: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

---

## 🎨 Design Guidelines

### Spawn Position

- **Y Height**: 1.6m (eye height for avatars)
- **Position**: Central, good overview
- **No Collisions**: Spawn point must be free
- **Rotation**: Optional, for viewing direction

### Lighting

- **HDRI**: For photorealistic lighting
- **Exposure**: 1.0-1.5 (depending on HDRI)
- **Ambient**: 0.3-0.5 (base brightness)
- **Directional**: 0.6-0.8 (main light)

### Zones

- **At least 1 Zone**: Main zone for general interaction
- **Stage Zone**: For presentations (isStage: true)
- **Breakout Zones**: For group work
- **Radius**: 5-10m per zone (depending on scene size)

### Performance Optimization

- **Asset Size**: < 50MB (total)
- **Textures**: < 100MB (total)
- **Polygons**: < 500k Tris (total)
- **Draw Calls**: < 100 (optimal)

---

## 📦 Deliverables

### Required Files

1. ✅ **scene.glb** – 3D scene (optimized)
2. ✅ **manifest.json** – Configuration file
3. ✅ **hdri.hdr** – HDRI environment (2K or 4K)

### Optional Files

4. ⚪ **navmesh.glb** – Navigation mesh
5. ⚪ **ambient/background.mp3** – Ambient audio
6. ⚪ **ui-skin.css** – UI theme

### Additional Assets (optional)

7. ⚪ **Textures** (if not embedded in GLB)
8. ⚪ **LOD Variants** (for large objects)
9. ⚪ **Documentation** (README.md with credits)

---

## ✅ Quality Checklist

### Technical Validation

- [ ] `scene.glb` loads without errors in browser
- [ ] Textures are visible and correctly assigned
- [ ] Lighting looks natural and balanced
- [ ] Spawn position is correct (Y = 1.6m)
- [ ] Zones are defined and logically placed
- [ ] Manifest is valid JSON (no syntax errors)
- [ ] All paths in manifest are relative (no absolute paths)

### Performance

- [ ] Desktop: 60 FPS (tested in Chrome)
- [ ] Mobile: 40 FPS (tested in mobile browser)
- [ ] Asset size: < 50MB (total)
- [ ] Textures: < 100MB (total)
- [ ] Load time: < 5 seconds (on fast connection)

### Design Quality

- [ ] Visually appealing and consistent
- [ ] Lighting matches the mood
- [ ] Colors are harmonious
- [ ] Scaling is realistic (1m = 1 Blender unit)
- [ ] No visible artifacts or errors

### Functionality

- [ ] Avatars can move (with NavMesh)
- [ ] Zones work (audio isolation)
- [ ] Portals work (if present)
- [ ] Ambient audio plays (if present)
- [ ] Template can be switched at runtime

---

## 📂 File Structure

### Final Structure

```
my-template-name/
├── manifest.json          # ✅ Required
├── scene.glb             # ✅ Required
├── hdri.hdr              # ✅ Required
├── navmesh.glb           # ⚪ Optional
├── ui-skin.css           # ⚪ Optional
├── ambient/               # ⚪ Optional
│   ├── background.mp3
│   ├── birds.mp3
│   └── wind.mp3
└── README.md             # ⚪ Optional (credits, description)
```

### Example Template

Reference: `apps/web/public/templates/watt-eco/`

- Complete implementation
- All files present
- Optimized for performance

---

## 🔄 Workflow

### Step 1: Design & Concept

1. Create concept (moodboard, sketches)
2. Define style direction (realistic, stylized, low-poly)
3. Define color palette
4. Plan lighting mood

### Step 2: 3D Modeling

1. Create scene in Blender
2. Model/import assets
3. Create/assign textures
4. Configure materials
5. Create LOD variants (if needed)

### Step 3: Optimization

1. Reduce polygon count (if needed)
2. Optimize textures (resolution, compression)
3. Apply Draco compression (optional)
4. Prepare KTX2 compression (automatically converted)

### Step 4: Export

1. Export scene.glb (with correct settings)
2. Export navmesh.glb (if present)
3. Download/assign HDRI
4. Prepare ambient audio

### Step 5: Create Manifest

1. Create manifest.json (see template)
2. Set all paths correctly
3. Define spawn position
4. Configure zones
5. Validate JSON (no syntax errors)

### Step 6: Testing

1. Test template in browser
2. Check performance (FPS)
3. Test functionality (zones, portals, audio)
4. Perform mobile test
5. Fix errors

### Step 7: Finalization

1. Copy all files to template directory
2. Go through quality checklist
3. Create documentation (README.md)
4. List credits (assets, sources)

---

## 🛠️ Tools & Software

### Recommended Software

- **Blender 3.0+**: 3D modeling, export
- **Substance Painter** (optional): Texturing
- **GIMP/Photoshop**: Texture editing
- **Audacity** (optional): Audio editing

### Online Tools

- **glTF Validator**: https://github.khronos.org/glTF-Validator/
- **PolyHaven**: HDRI download
- **Freesound**: Audio download

---

## 📚 References & Examples

### Example Templates

1. **watt-eco**: Forest sunset theme
   - Path: `apps/web/public/templates/watt-eco/`
   - Complete implementation

2. **demo-plaza**: Meeting plaza
   - Path: `apps/web/public/templates/demo-plaza/`
   - Multi-zone setup

### Documentation

- **Template System**: `docs/templates.md`
- **Asset Guide**: `docs/assets-shopping.md`
- **Performance Guide**: `docs/performance.md`

### External Resources

- **GLTF Specification**: https://www.khronos.org/gltf/
- **Blender GLTF Export**: https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html
- **PolyHaven**: https://polyhaven.com

---

## ❓ Frequently Asked Questions (FAQ)

### Q: Which Blender version should I use?

**A:** Blender 3.0 or higher. GLTF export is available from version 2.8, but 3.0+ has better optimizations.

### Q: Do I need to use Draco compression?

**A:** Optional, but recommended. Reduces file size by 50-70% without visible quality loss.

### Q: How large can scene.glb be?

**A:** < 50MB (total). For web performance, large assets should be split.

### Q: Can I use custom shaders?

**A:** No. Only standard PBR materials (Metallic/Roughness workflow).

### Q: How do I test the template?

**A:**

1. Copy files to `apps/web/public/templates/my-template-name/`
2. Start web app: `cd apps/web && pnpm dev`
3. In browser: `http://localhost:5173?template=my-template-name`

### Q: What happens if assets are missing?

**A:** The system uses fallbacks:

- No scene.glb → Generated default scene
- No HDRI → Standard lighting
- No NavMesh → No navigation (avatars can still move)

---

## 📞 Support & Contact

For questions about technical implementation:

- **Template Documentation**: `docs/templates.md`
- **Asset Guide**: `docs/assets-shopping.md`
- **Performance Guide**: `docs/performance.md`

---

## 📝 Checklist for Designer

### Before Starting

- [ ] Project briefing read and understood
- [ ] Blender installed (3.0+)
- [ ] Example template reviewed (`watt-eco`)
- [ ] Design concept created

### During Work

- [ ] Polygon limits followed
- [ ] Texture resolutions correct
- [ ] LOD variants created (if needed)
- [ ] Lighting tested
- [ ] Performance kept in mind

### Before Submission

- [ ] All required files present
- [ ] manifest.json validated (JSON syntax)
- [ ] Template tested in browser
- [ ] Performance check completed
- [ ] Quality checklist completed
- [ ] Credits documented (README.md)

---

**Good luck with template creation! 🚀**
