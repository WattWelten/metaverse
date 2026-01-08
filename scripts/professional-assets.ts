#!/usr/bin/env tsx

/**
 * Professional Asset Pipeline
 * Downloads and optimizes high-quality 3D assets from PolyHaven and Sketchfab
 * Similar to Arthur, RaveSpace Metaverse Nordwest quality standards
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { AssetDownloader } from '../packages/core/src/assets/AssetDownloader.js';
import { AssetOptimizer } from '../packages/core/src/assets/AssetOptimizer.js';
import {
  PROFESSIONAL_HDRIS,
  PROFESSIONAL_TREES,
  PROFESSIONAL_ROCKS,
  PROFESSIONAL_VEGETATION,
  PROFESSIONAL_GROUND_TEXTURES,
  type AssetConfig,
} from './professional-asset-config.js';
import { generatePlacements } from './auto-place-assets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Use professional asset configuration
const ASSET_CONFIG = {
  hdri: {
    primary: PROFESSIONAL_HDRIS[0], // Use first HDRI as primary
    alternatives: PROFESSIONAL_HDRIS.slice(1),
    quality: '4k', // Use 4K for professional quality
  },
  trees: PROFESSIONAL_TREES,
  rocks: PROFESSIONAL_ROCKS,
  vegetation: PROFESSIONAL_VEGETATION,
  groundTextures: PROFESSIONAL_GROUND_TEXTURES,
};

interface AssetPlacement {
  assetId: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  variant?: number; // For random variations
}

// Professional scene layout - similar to Arthur/RaveSpace
const SCENE_LAYOUT: AssetPlacement[] = [
  // Trees around the main area (creating natural boundaries)
  { assetId: 'tree_01', position: [8, 0, -3], scale: 1.0, variant: 0 },
  { assetId: 'tree_02', position: [-8, 0, -3], scale: 1.1, variant: 1 },
  { assetId: 'tree_03', position: [10, 0, 2], scale: 0.9, variant: 2 },
  { assetId: 'tree_01', position: [-10, 0, 2], scale: 1.0, variant: 0 },
  { assetId: 'tree_02', position: [12, 0, -6], scale: 1.2, variant: 1 },
  { assetId: 'tree_03', position: [-12, 0, -6], scale: 0.9, variant: 2 },

  // Rocks near the lake
  { assetId: 'rock_01', position: [-4, 0, -12], scale: 0.8 },
  { assetId: 'rock_02', position: [-8, 0, -14], scale: 0.6 },
  { assetId: 'rock_03', position: [-2, 0, -13], scale: 0.4 },

  // Vegetation patches
  { assetId: 'grass_patch_01', position: [3, 0, -4], scale: 0.3 },
  { assetId: 'grass_patch_01', position: [-3, 0, -4], scale: 0.3 },
  { assetId: 'bush_01', position: [5, 0, -6], scale: 0.5 },
  { assetId: 'bush_01', position: [-5, 0, -6], scale: 0.5 },
];

async function downloadProfessionalAssets(): Promise<void> {
  const templateDir = join(rootDir, 'packages', 'assets', 'templates', 'watt-eco');
  const assetsDir = join(templateDir, 'assets');
  const modelsDir = join(assetsDir, 'models');
  const texturesDir = join(assetsDir, 'textures');

  // Create directories
  [assetsDir, modelsDir, texturesDir].forEach((dir) => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });

  const downloader = new AssetDownloader({
    polyHavenApiKey: process.env.POLYHAVEN_API_KEY,
    sketchfabApiKey: process.env.SKETCHFAB_API_KEY,
  });

  console.log('🎨 Starting Professional Asset Pipeline...\n');

  // 1. Download HDRI (4K quality)
  console.log('📥 Downloading HDRI (4K)...');
  try {
    const hdriConfig = ASSET_CONFIG.hdri.primary;
    const hdriPath = await downloader.downloadPolyHavenHDRI(hdriConfig.polyHavenId, {
      outputPath: assetsDir,
      templateId: 'watt-eco',
    });
    console.log(`✅ HDRI downloaded: ${hdriConfig.name} -> ${hdriPath}\n`);
  } catch (error) {
    console.error('❌ Failed to download primary HDRI:', error);
    // Try alternatives
    for (const alt of ASSET_CONFIG.hdri.alternatives) {
      try {
        console.log(`  Trying alternative: ${alt.name}...`);
        await downloader.downloadPolyHavenHDRI(alt.polyHavenId, {
          outputPath: assetsDir,
          templateId: 'watt-eco',
        });
        console.log(`✅ Alternative HDRI downloaded: ${alt.name}\n`);
        break;
      } catch (altError) {
        console.warn(`  Failed: ${alt.name}`);
      }
    }
  }

  // 2. Download tree models
  console.log('🌳 Downloading tree models...');
  for (const tree of ASSET_CONFIG.trees) {
    try {
      console.log(`  📥 ${tree.name} (${tree.polyHavenId})...`);
      const modelPath = await downloader.downloadPolyHavenModel(tree.polyHavenId, {
        outputPath: modelsDir,
        templateId: 'watt-eco',
      });
      console.log(`  ✅ ${tree.name}: ${basename(modelPath)}`);
    } catch (error) {
      console.warn(`  ⚠️  Failed to download ${tree.name} (${tree.polyHavenId}):`, error);
      // Note: PolyHaven model IDs need to be verified - they may not exist
      // In production, you would search PolyHaven first to get valid IDs
    }
  }
  console.log('');

  // 3. Download rock models
  console.log('🪨 Downloading rock models...');
  for (const rock of ASSET_CONFIG.rocks) {
    try {
      console.log(`  📥 ${rock.name} (${rock.polyHavenId})...`);
      const modelPath = await downloader.downloadPolyHavenModel(rock.polyHavenId, {
        outputPath: modelsDir,
        templateId: 'watt-eco',
      });
      console.log(`  ✅ ${rock.name}: ${basename(modelPath)}`);
    } catch (error) {
      console.warn(`  ⚠️  Failed to download ${rock.name} (${rock.polyHavenId}):`, error);
    }
  }
  console.log('');

  // 4. Download vegetation
  console.log('🌿 Downloading vegetation...');
  for (const veg of ASSET_CONFIG.vegetation) {
    try {
      console.log(`  📥 ${veg.name} (${veg.polyHavenId})...`);
      const modelPath = await downloader.downloadPolyHavenModel(veg.polyHavenId, {
        outputPath: modelsDir,
        templateId: 'watt-eco',
      });
      console.log(`  ✅ ${veg.name}: ${basename(modelPath)}`);
    } catch (error) {
      console.warn(`  ⚠️  Failed to download ${veg.name} (${veg.polyHavenId}):`, error);
    }
  }
  console.log('');

  // 5. Download ground textures
  console.log('🌍 Downloading ground textures...');
  for (const texture of ASSET_CONFIG.groundTextures) {
    try {
      console.log(`  📥 ${texture.name} (${texture.polyHavenId})...`);
      // For textures, we need to use texture API
      const texturePath = await downloader.downloadPolyHavenTexture(texture.polyHavenId, {
        outputPath: texturesDir,
        templateId: 'watt-eco',
      });
      console.log(`  ✅ ${texture.name}: ${basename(texturePath)}`);
    } catch (error) {
      console.warn(`  ⚠️  Failed to download ${texture.name} (${texture.polyHavenId}):`, error);
    }
  }
  console.log('');

  // 5. Optimize all downloaded models
  console.log('🔧 Optimizing assets...');
  const optimizer = new AssetOptimizer();
  try {
    await optimizer.optimizeTemplate('watt-eco', {
      enableDraco: true,
      enableKTX2: true,
      generateLOD: true,
    });
    console.log('✅ Asset optimization completed\n');
  } catch (error) {
    console.warn('⚠️  Optimization failed (continuing without optimization):', error);
  }

  // 6. Generate automatic asset placements
  console.log('📍 Generating asset placements...');
  const { generatePlacements, PLACEMENT_RULES } = await import('./auto-place-assets.js');
  const placements = await generatePlacements(PLACEMENT_RULES);
  console.log(`✅ Generated ${placements.length} placements\n`);

  // 7. Update manifest with asset references
  console.log('📝 Updating manifest...');
  updateManifestWithAssets(templateDir, placements);
  console.log('✅ Manifest updated\n');

  console.log('🎉 Professional Asset Pipeline completed!');
  console.log(`   Assets directory: ${assetsDir}`);
  console.log(`   Models: ${modelsDir}`);
  console.log(`   Textures: ${texturesDir}`);
}

function updateManifestWithAssets(
  templateDir: string,
  placements: Array<{
    assetId: string;
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    variant?: number;
  }>
): void {
  const manifestPath = join(templateDir, 'manifest.json');
  let manifest: any = {};

  if (existsSync(manifestPath)) {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  }

  // Update HDRI path (use 4K if available)
  const hdriFiles = ['forest_slope_4k.hdr', 'forest_slope_2k.hdr', 'spruit_sunrise_2k.hdr'];
  for (const hdriFile of hdriFiles) {
    if (existsSync(join(templateDir, 'assets', hdriFile))) {
      manifest.assets.hdri = `/assets/watt-eco/${hdriFile}`;
      if (manifest.lighting) {
        manifest.lighting.hdri = `/assets/watt-eco/${hdriFile}`;
      }
      break;
    }
  }

  // Add 3D models section to manifest
  if (!manifest.assets.models) {
    manifest.assets.models = [];
  }

  // Add placed assets
  if (!manifest.placedAssets) {
    manifest.placedAssets = [];
  }

  manifest.placedAssets = placements.map((placement) => ({
    id: placement.assetId,
    model: `/assets/watt-eco/models/${placement.assetId}.glb`,
    position: placement.position,
    rotation: placement.rotation || [0, Math.random() * Math.PI * 2, 0],
    scale: placement.scale || 1.0,
    variant: placement.variant || 0,
  }));

  // Add ground textures
  if (!manifest.assets.textures) {
    manifest.assets.textures = {};
  }
  manifest.assets.textures.ground = '/assets/watt-eco/textures/ground_forest.jpg';
  manifest.assets.textures.path = '/assets/watt-eco/textures/ground_dirt.jpg';

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Professional Asset Pipeline for WattWelten Metaverse

Usage:
  pnpm assets:professional [options]

Options:
  --help, -h          Show this help message
  --hdri <id>        Use specific HDRI ID
  --skip-optimize    Skip asset optimization
  --models-only      Only download models (skip HDRI)
  --hdri-only        Only download HDRI (skip models)

Environment Variables:
  POLYHAVEN_API_KEY  Optional API key for PolyHaven
  SKETCHFAB_API_KEY  Optional API key for Sketchfab

Examples:
  pnpm assets:professional
  pnpm assets:professional --hdri sunset_jhb_central_2k
  pnpm assets:professional --models-only
    `);
    process.exit(0);
  }

  const skipOptimize = args.includes('--skip-optimize');
  const modelsOnly = args.includes('--models-only');
  const hdriOnly = args.includes('--hdri-only');

  if (skipOptimize) {
    console.log('⚠️  Asset optimization will be skipped');
  }

  await downloadProfessionalAssets();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { downloadProfessionalAssets, ASSET_CONFIG, SCENE_LAYOUT };
