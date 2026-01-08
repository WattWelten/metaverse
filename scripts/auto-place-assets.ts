#!/usr/bin/env tsx

/**
 * Automatic Asset Placement System
 * Intelligently places 3D assets in the scene based on layout rules
 * Similar to professional metaverse platforms
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

interface AssetPlacement {
  assetId: string;
  model: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  variant?: number;
}

interface PlacementRule {
  type: 'boundary' | 'cluster' | 'scatter' | 'path' | 'feature';
  area: { center: [number, number, number]; radius: number };
  assets: string[];
  density?: number;
  minDistance?: number;
  avoidAreas?: Array<{ center: [number, number, number]; radius: number }>;
}

/**
 * Professional scene layout rules
 * Similar to Arthur, RaveSpace Metaverse Nordwest
 */
const PLACEMENT_RULES: PlacementRule[] = [
  // Boundary trees - create natural forest boundaries
  {
    type: 'boundary',
    area: { center: [0, 0, 0], radius: 50 },
    assets: ['tree_oak_01', 'tree_pine_01', 'tree_birch_01'],
    density: 0.15, // Trees per 100m²
    minDistance: 3,
    avoidAreas: [
      { center: [0, 0, -1], radius: 5 }, // Main area
      { center: [-6, 0, -10], radius: 20 }, // Lake
      { center: [0, 0, -1], radius: 3 }, // Main path
      { center: [-4, 0, -2], radius: 2 }, // Side path A
      { center: [4, 0, -2], radius: 2 }, // Side path B
    ],
  },

  // Rocks near lake
  {
    type: 'cluster',
    area: { center: [-6, 0, -10], radius: 8 },
    assets: ['rock_large_01', 'rock_medium_01', 'rock_small_01'],
    density: 0.3,
    minDistance: 2,
  },

  // Vegetation patches around main area
  {
    type: 'scatter',
    area: { center: [0, 0, -5], radius: 15 },
    assets: ['grass_patch_01', 'bush_01'],
    density: 0.5,
    minDistance: 1.5,
    avoidAreas: [
      { center: [0, 0, -1], radius: 2 }, // Main path
      { center: [-2, 0, -9], radius: 3 }, // Firepit area
    ],
  },
];

/**
 * Generate asset placements based on rules
 */
async function generatePlacements(rules: PlacementRule[]): Promise<AssetPlacement[]> {
  const placements: AssetPlacement[] = [];
  const usedPositions: Array<{ pos: [number, number, number]; radius: number }> = [];

  for (const rule of rules) {
    const { area, assets, density = 0.2, minDistance = 2, avoidAreas = [] } = rule;

    // Calculate number of assets based on density
    const areaSize = Math.PI * area.radius * area.radius;
    const numAssets = Math.floor((areaSize * density) / 100);

    let placed = 0;
    let attempts = 0;
    const maxAttempts = numAssets * 10;

    while (placed < numAssets && attempts < maxAttempts) {
      attempts++;

      // Random position within area
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * area.radius;
      const x = area.center[0] + Math.cos(angle) * distance;
      const z = area.center[2] + Math.sin(angle) * distance;
      const y = area.center[1];
      const pos: [number, number, number] = [x, y, z];

      // Check if too close to avoid areas
      let tooClose = false;
      for (const avoid of avoidAreas) {
        const dist = Math.sqrt(
          Math.pow(pos[0] - avoid.center[0], 2) + Math.pow(pos[2] - avoid.center[2], 2)
        );
        if (dist < avoid.radius) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      // Check if too close to other placements
      let conflict = false;
      for (const used of usedPositions) {
        const dist = Math.sqrt(
          Math.pow(pos[0] - used.pos[0], 2) + Math.pow(pos[2] - used.pos[2], 2)
        );
        if (dist < minDistance + used.radius) {
          conflict = true;
          break;
        }
      }
      if (conflict) continue;

      // Select random asset from available
      const assetId = assets[Math.floor(Math.random() * assets.length)];

      // Get asset config for scale
      const assetConfig = await getAssetConfig(assetId);
      const scale = assetConfig?.scale || 1.0;
      const variants = assetConfig?.variants || 1;
      const variant = Math.floor(Math.random() * variants);

      placements.push({
        assetId,
        model: `/assets/watt-eco/models/${assetId}.glb`,
        position: pos,
        rotation: [0, Math.random() * Math.PI * 2, 0],
        scale: scale * (0.9 + Math.random() * 0.2), // 90-110% variation
        variant,
      });

      usedPositions.push({ pos, radius: minDistance });
      placed++;
    }
  }

  return placements;
}

/**
 * Get asset configuration (placeholder - would come from asset config)
 */
function getAssetConfig(assetId: string): { scale?: number; variants?: number } | null {
  // This would reference the actual asset config
  // For now, return defaults
  return { scale: 1.0, variants: 1 };
}

/**
 * Update manifest with generated placements
 */
function updateManifestWithPlacements(placements: AssetPlacement[]): void {
  const templateDir = join(rootDir, 'packages', 'assets', 'templates', 'watt-eco');
  const manifestPath = join(templateDir, 'manifest.json');

  if (!existsSync(manifestPath)) {
    console.error('Manifest not found:', manifestPath);
    return;
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  // Add placed assets to manifest
  if (!manifest.placedAssets) {
    manifest.placedAssets = [];
  }

  manifest.placedAssets = placements;

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✅ Updated manifest with ${placements.length} asset placements`);
}

async function main() {
  console.log('🎨 Generating professional asset placements...\n');

  const placements = await generatePlacements(PLACEMENT_RULES);
  console.log(`✅ Generated ${placements.length} asset placements\n`);

  updateManifestWithPlacements(placements);

  console.log('🎉 Asset placement completed!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { generatePlacements, PLACEMENT_RULES };
