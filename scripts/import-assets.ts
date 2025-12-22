#!/usr/bin/env tsx

import { existsSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

interface ImportOptions {
  hdri?: string;
  scene?: string;
  audio?: string;
  attr?: string;
  templateId?: string;
}

function parseArgs(): ImportOptions {
  const args = process.argv.slice(2);
  const options: ImportOptions = { templateId: 'watt-eco' };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--hdri' && i + 1 < args.length) {
      options.hdri = args[++i];
    } else if (arg === '--scene' && i + 1 < args.length) {
      options.scene = args[++i];
    } else if (arg === '--audio' && i + 1 < args.length) {
      options.audio = args[++i];
    } else if (arg === '--attr' && i + 1 < args.length) {
      options.attr = args[++i];
    } else if (arg === '--template' && i + 1 < args.length) {
      options.templateId = args[++i];
    }
  }

  return options;
}

function validatePath(path: string, type: string): boolean {
  if (!existsSync(path)) {
    console.error(`❌ ${type} file not found: ${path}`);
    return false;
  }
  return true;
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function copyAsset(source: string, dest: string, type: string): boolean {
  try {
    copyFileSync(source, dest);
    console.log(`✅ Copied ${type}: ${basename(source)} → ${basename(dest)}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to copy ${type}:`, error);
    return false;
  }
}

function updateManifest(templateDir: string, options: ImportOptions): void {
  const manifestPath = join(templateDir, 'manifest.json');
  let manifest: Record<string, unknown> = {};

  if (existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    } catch (error) {
      console.warn('⚠️  Could not parse existing manifest.json, creating new one');
    }
  }

  // Ensure structure
  if (!manifest.id) {
    manifest.id = options.templateId || 'watt-eco';
  }
  if (!manifest.assets) {
    manifest.assets = {};
  }

  const assets = manifest.assets as Record<string, string>;

  if (options.hdri) {
    assets.hdri = 'hdri.hdr';
  }
  if (options.scene) {
    const ext = extname(options.scene);
    assets.scene = `scene${ext}`;
  }

  // Audio support
  if (options.audio) {
    const ext = extname(options.audio);
    const audioFileName = `ambient${ext}`;
    if (!manifest.audio) {
      manifest.audio = {};
    }
    const audio = manifest.audio as Record<string, unknown>;
    audio.ambient = audioFileName;
    audio.gain = audio.gain || 0.2;
  }

  // Ensure lighting defaults
  if (!manifest.lighting) {
    manifest.lighting = { exposure: 1.0 };
  }

  try {
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`✅ Updated manifest.json`);
  } catch (error) {
    console.error('❌ Failed to update manifest.json:', error);
  }
}

function createAttribution(templateDir: string, attrPath?: string): void {
  const attributionPath = join(templateDir, 'ATTRIBUTION.md');

  if (attrPath && existsSync(attrPath)) {
    try {
      const content = readFileSync(attrPath, 'utf-8');
      writeFileSync(attributionPath, content);
      console.log(`✅ Created ATTRIBUTION.md from ${basename(attrPath)}`);
    } catch (error) {
      console.error('❌ Failed to copy attribution file:', error);
    }
  } else if (!existsSync(attributionPath)) {
    const defaultAttribution = `# Attribution

This template uses assets that are either:
- CC0 (Public Domain) - No attribution required
- CC-BY - Attribution required (see source in docs/assets-shopping.md)

For detailed attribution information, see:
- docs/assets-shopping.md
- Run \`pnpm assets:attr\` to generate consolidated attribution

Generated: ${new Date().toISOString()}
`;
    writeFileSync(attributionPath, defaultAttribution);
    console.log(`✅ Created default ATTRIBUTION.md`);
  }
}

async function main() {
  const options = parseArgs();

  if (!options.hdri && !options.scene && !options.audio && !options.attr) {
    console.error('❌ No assets specified. Usage:');
    console.error(
      '  pnpm assets:import -- --hdri <path.hdr> --scene <path.glb> [--audio <path.wav>] [--attr <path.txt>] [--template <id>]'
    );
    process.exit(1);
  }

  const templateId = options.templateId || 'watt-eco';
  const templateDir = join(rootDir, 'packages', 'assets', 'templates', templateId);

  console.log(`📦 Importing assets to template: ${templateId}`);
  console.log(`📁 Template directory: ${templateDir}`);

  ensureDir(templateDir);

  let hasErrors = false;

  // Copy HDRI
  if (options.hdri) {
    if (!validatePath(options.hdri, 'HDRI')) {
      hasErrors = true;
    } else {
      const dest = join(templateDir, 'hdri.hdr');
      if (!copyAsset(options.hdri, dest, 'HDRI')) {
        hasErrors = true;
      }
    }
  }

  // Copy Scene
  if (options.scene) {
    if (!validatePath(options.scene, 'Scene')) {
      hasErrors = true;
    } else {
      const ext = extname(options.scene);
      const dest = join(templateDir, `scene${ext}`);
      if (!copyAsset(options.scene, dest, 'Scene')) {
        hasErrors = true;
      }
    }
  }

  // Copy Audio
  if (options.audio) {
    if (!validatePath(options.audio, 'Audio')) {
      hasErrors = true;
    } else {
      const ext = extname(options.audio);
      const dest = join(templateDir, `ambient${ext}`);
      if (!copyAsset(options.audio, dest, 'Audio')) {
        hasErrors = true;
      }
    }
  }

  // Update manifest
  updateManifest(templateDir, options);

  // Create attribution
  createAttribution(templateDir, options.attr);

  if (hasErrors) {
    console.error('\n❌ Some assets failed to import. Check errors above.');
    process.exit(1);
  }

  console.log('\n✅ Asset import completed successfully!');
  console.log(`\nNext steps:`);
  console.log(`  1. Verify assets in: ${templateDir}`);
  console.log(`  2. Run: pnpm assets:attr (to generate attribution)`);
  console.log(`  3. Test template: pnpm dev`);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
