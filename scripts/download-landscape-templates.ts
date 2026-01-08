#!/usr/bin/env tsx

/**
 * Automatic Landscape Template Downloader
 * Downloads free CC0 landscape templates from PolyHaven, Sketchfab, etc.
 * Similar to Arthur, RaveSpace Metaverse Nordwest style
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { AssetDownloader } from '../packages/core/src/assets/AssetDownloader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Landscape template definitions
 * Curated list of free CC0 landscape templates
 */
interface LandscapeTemplate {
  id: string;
  name: string;
  category: 'forest' | 'mountain' | 'beach' | 'desert' | 'urban' | 'fantasy';
  source: 'polyhaven' | 'sketchfab' | 'opengameart' | 'free3d';
  hdriId?: string;
  modelIds?: string[];
  description: string;
  style: string; // e.g., "realistic", "stylized", "low-poly"
}

const LANDSCAPE_TEMPLATES: LandscapeTemplate[] = [
  // Forest Templates
  {
    id: 'forest-sunset',
    name: 'Forest Sunset',
    category: 'forest',
    source: 'polyhaven',
    hdriId: 'forest_slope',
    description: 'Realistic forest with sunset lighting',
    style: 'realistic',
  },
  {
    id: 'forest-dawn',
    name: 'Forest Dawn',
    category: 'forest',
    source: 'polyhaven',
    hdriId: 'spruit_sunrise',
    description: 'Forest at dawn with morning mist',
    style: 'realistic',
  },
  {
    id: 'forest-autumn',
    name: 'Autumn Forest',
    category: 'forest',
    source: 'polyhaven',
    hdriId: 'kiara_1_dawn',
    description: 'Autumn forest with warm colors',
    style: 'realistic',
  },

  // Mountain Templates
  {
    id: 'mountain-peak',
    name: 'Mountain Peak',
    category: 'mountain',
    source: 'polyhaven',
    hdriId: 'sunset_jhb_central',
    description: 'Mountain peak with dramatic lighting',
    style: 'realistic',
  },

  // Beach Templates
  {
    id: 'beach-sunset',
    name: 'Beach Sunset',
    category: 'beach',
    source: 'polyhaven',
    hdriId: 'sunset_jhb_central',
    description: 'Tropical beach at sunset',
    style: 'realistic',
  },

  // Desert Templates
  {
    id: 'desert-dunes',
    name: 'Desert Dunes',
    category: 'desert',
    source: 'polyhaven',
    hdriId: 'sunset_jhb_central',
    description: 'Desert landscape with sand dunes',
    style: 'realistic',
  },
];

/**
 * Download landscape template
 */
async function downloadLandscapeTemplate(template: LandscapeTemplate): Promise<void> {
  const templateDir = join(rootDir, 'packages', 'assets', 'templates', template.id);
  const assetsDir = join(templateDir, 'assets');
  const modelsDir = join(assetsDir, 'models');
  const hdriDir = join(assetsDir, 'hdri');

  // Create directories
  [templateDir, assetsDir, modelsDir, hdriDir].forEach((dir) => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });

  const downloader = new AssetDownloader({
    polyHavenApiKey: process.env.POLYHAVEN_API_KEY,
    sketchfabApiKey: process.env.SKETCHFAB_API_KEY,
  });

  console.log(`\n🌍 Downloading template: ${template.name} (${template.id})`);
  console.log(`   Category: ${template.category}, Style: ${template.style}`);

  // Download HDRI
  if (template.hdriId) {
    try {
      console.log(`   📥 Downloading HDRI: ${template.hdriId}...`);
      const hdriPath = await downloader.downloadPolyHavenHDRI(template.hdriId, {
        outputPath: hdriDir,
        templateId: template.id,
      });
      console.log(`   ✅ HDRI downloaded: ${basename(hdriPath)}`);
    } catch (error) {
      console.warn(`   ⚠️  Failed to download HDRI: ${error}`);
    }
  }

  // Download models
  if (template.modelIds && template.modelIds.length > 0) {
    for (const modelId of template.modelIds) {
      try {
        console.log(`   📥 Downloading model: ${modelId}...`);
        const modelPath = await downloader.downloadPolyHavenModel(modelId, {
          outputPath: modelsDir,
          templateId: template.id,
        });
        console.log(`   ✅ Model downloaded: ${basename(modelPath)}`);
      } catch (error) {
        console.warn(`   ⚠️  Failed to download model ${modelId}: ${error}`);
      }
    }
  }

  // Generate manifest
  generateTemplateManifest(template, templateDir, assetsDir);
  console.log(`   ✅ Template manifest created`);
}

/**
 * Generate template manifest
 */
function generateTemplateManifest(
  template: LandscapeTemplate,
  templateDir: string,
  assetsDir: string
): void {
  const manifestPath = join(templateDir, 'manifest.json');

  // Find downloaded HDRI
  let hdriPath: string | undefined;
  if (template.hdriId) {
    const hdriFiles = [
      `${template.hdriId}_4k.hdr`,
      `${template.hdriId}_2k.hdr`,
      `${template.hdriId}_1k.hdr`,
    ];
    for (const file of hdriFiles) {
      if (existsSync(join(assetsDir, 'hdri', file))) {
        hdriPath = `assets/hdri/${file}`;
        break;
      }
    }
  }

  const manifest = {
    id: template.id,
    name: template.name,
    version: '1.0.0',
    description: template.description,
    category: template.category,
    style: template.style,
    assets: {
      hdri: hdriPath,
    },
    lighting: {
      exposure: 1,
      hdri: hdriPath,
      ambient: {
        color: '#ffffff',
        intensity: 0.3,
      },
      directional: {
        color: '#ffffff',
        intensity: 0.6,
        position: {
          x: 5,
          y: 10,
          z: 2,
        },
      },
    },
    spawn: {
      position: [0, 1.6, 6] as [number, number, number],
      rotationY: 0,
    },
    zones: [],
    props: [],
    screens: [],
    ambience: [],
  };

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

/**
 * Download all landscape templates
 */
async function downloadAllTemplates(): Promise<void> {
  console.log('🎨 Starting Landscape Template Download...\n');
  console.log(`📋 Found ${LANDSCAPE_TEMPLATES.length} templates\n`);

  for (const template of LANDSCAPE_TEMPLATES) {
    try {
      await downloadLandscapeTemplate(template);
    } catch (error) {
      console.error(`❌ Failed to download template ${template.id}:`, error);
    }
  }

  console.log('\n🎉 Landscape Template Download completed!');
  console.log(`\n📊 Summary:`);
  console.log(`   Templates: ${LANDSCAPE_TEMPLATES.length}`);
  console.log(`   Categories: ${new Set(LANDSCAPE_TEMPLATES.map((t) => t.category)).size}`);
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Landscape Template Downloader

Usage:
  pnpm templates:download [options]

Options:
  --help, -h          Show this help message
  --template <id>     Download specific template only
  --category <cat>    Download templates by category

Categories:
  forest, mountain, beach, desert, urban, fantasy

Examples:
  pnpm templates:download
  pnpm templates:download --template forest-sunset
  pnpm templates:download --category forest
    `);
    process.exit(0);
  }

  if (args.includes('--template')) {
    const templateId = args[args.indexOf('--template') + 1];
    const template = LANDSCAPE_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      await downloadLandscapeTemplate(template);
    } else {
      console.error(`Template not found: ${templateId}`);
      process.exit(1);
    }
  } else if (args.includes('--category')) {
    const category = args[args.indexOf('--category') + 1];
    const templates = LANDSCAPE_TEMPLATES.filter((t) => t.category === category);
    for (const template of templates) {
      await downloadLandscapeTemplate(template);
    }
  } else {
    await downloadAllTemplates();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { downloadLandscapeTemplate, LANDSCAPE_TEMPLATES };
