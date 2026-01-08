#!/usr/bin/env tsx

/**
 * Automatic Asset Import Script
 * Downloads assets from PolyHaven/Sketchfab and imports them into templates
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { AssetDownloader } from '../packages/core/src/assets/AssetDownloader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

interface AutoImportOptions {
  templateId: string;
  hdriId?: string;
  modelIds?: string[];
  polyHavenApiKey?: string;
  sketchfabApiKey?: string;
}

async function autoImportAssets(options: AutoImportOptions): Promise<void> {
  const { templateId, hdriId, modelIds = [], polyHavenApiKey, sketchfabApiKey } = options;

  const templateDir = join(rootDir, 'packages', 'assets', 'templates', templateId);
  const assetsDir = join(templateDir, 'assets');

  // Ensure directories exist
  if (!existsSync(templateDir)) {
    mkdirSync(templateDir, { recursive: true });
  }
  if (!existsSync(assetsDir)) {
    mkdirSync(assetsDir, { recursive: true });
  }

  const downloader = new AssetDownloader({
    polyHavenApiKey,
    sketchfabApiKey,
  });

  console.log(`📦 Auto-importing assets for template: ${templateId}`);

  // Download HDRI
  if (hdriId) {
    try {
      console.log(`  📥 Downloading HDRI: ${hdriId}`);
      const hdriPath = await downloader.downloadPolyHavenHDRI(hdriId, {
        outputPath: assetsDir,
        templateId,
      });
      console.log(`  ✅ HDRI downloaded: ${hdriPath}`);
    } catch (error) {
      console.error(`  ❌ Failed to download HDRI: ${error}`);
    }
  }

  // Download models
  for (const modelId of modelIds) {
    try {
      console.log(`  📥 Downloading model: ${modelId}`);
      const modelPath = await downloader.downloadPolyHavenModel(modelId, {
        outputPath: assetsDir,
        templateId,
      });
      console.log(`  ✅ Model downloaded: ${modelPath}`);
    } catch (error) {
      console.error(`  ❌ Failed to download model ${modelId}: ${error}`);
    }
  }

  // Update manifest.json
  const manifestPath = join(templateDir, 'manifest.json');
  let manifest: any = {};

  if (existsSync(manifestPath)) {
    try {
      const manifestContent = await import(manifestPath, { assert: { type: 'json' } });
      manifest = manifestContent.default || manifestContent;
    } catch (error) {
      console.warn('  ⚠️  Could not read existing manifest, creating new one');
    }
  }

  // Update manifest with asset references
  if (!manifest.assets) {
    manifest.assets = {};
  }

  if (hdriId) {
    manifest.assets.hdri = `assets/${hdriId}.hdr`;
  }

  if (modelIds.length > 0) {
    manifest.assets.models = modelIds.map((id) => `assets/${id}.glb`);
  }

  // Write updated manifest
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`  ✅ Updated manifest.json`);

  console.log(`\n✅ Auto-import completed for template: ${templateId}`);
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  const options: AutoImportOptions = {
    templateId: 'watt-eco',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--template' && i + 1 < args.length) {
      options.templateId = args[++i];
    } else if (arg === '--hdri' && i + 1 < args.length) {
      options.hdriId = args[++i];
    } else if (arg === '--model' && i + 1 < args.length) {
      if (!options.modelIds) {
        options.modelIds = [];
      }
      options.modelIds.push(args[++i]);
    } else if (arg === '--polyhaven-key' && i + 1 < args.length) {
      options.polyHavenApiKey = args[++i];
    } else if (arg === '--sketchfab-key' && i + 1 < args.length) {
      options.sketchfabApiKey = args[++i];
    }
  }

  if (!options.hdriId && (!options.modelIds || options.modelIds.length === 0)) {
    console.error('❌ No assets specified. Usage:');
    console.error('  pnpm assets:auto-import --template <id> --hdri <id> [--model <id>...]');
    process.exit(1);
  }

  await autoImportAssets(options);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { autoImportAssets, AssetDownloader };
