#!/usr/bin/env node

/**
 * Enhanced Template Import Script
 * Automatischer Import mit Validierung, Asset-Optimierung und Registrierung
 *
 * Features:
 * - Automatische Validierung
 * - Asset-Optimierung (Draco, KTX2)
 * - Manifest-Generierung
 * - Template-Registrierung
 */

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
  existsSync,
  statSync,
  readdirSync,
} from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const templatesDir = join(rootDir, 'apps', 'web', 'public', 'templates');
const templatesJsonPath = join(rootDir, 'apps', 'web', 'public', 'templates.json');

/**
 * Validiere Template-Manifest
 */
function validateManifest(manifest, sourceDir) {
  const errors = [];
  const warnings = [];

  // Pflichtfelder
  const required = ['id', 'name', 'version'];
  for (const field of required) {
    if (!manifest[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // ID-Validierung
  if (manifest.id && typeof manifest.id !== 'string') {
    errors.push('manifest.id must be a string');
  }

  // Name-Validierung
  if (manifest.name && typeof manifest.name !== 'string') {
    errors.push('manifest.name must be a string');
  }

  // Version-Validierung
  if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
    warnings.push('manifest.version should be valid semver (e.g., 1.0.0)');
  }

  // Asset-Validierung
  if (manifest.assets) {
    if (manifest.assets.scene) {
      const scenePath = join(sourceDir, manifest.assets.scene);
      if (!existsSync(scenePath)) {
        errors.push(`Scene asset not found: ${manifest.assets.scene}`);
      } else {
        const stats = statSync(scenePath);
        const sizeMB = stats.size / (1024 * 1024);
        if (sizeMB > 50) {
          warnings.push(`Scene asset is large (${sizeMB.toFixed(2)}MB). Consider optimization.`);
        }
      }
    }

    if (manifest.assets.hdri) {
      const hdriPath = join(sourceDir, manifest.assets.hdri);
      if (!existsSync(hdriPath)) {
        warnings.push(`HDRI asset not found: ${manifest.assets.hdri}`);
      }
    }
  }

  // Spawn-Validierung
  if (manifest.spawn) {
    if (typeof manifest.spawn.y !== 'number' || manifest.spawn.y < 0) {
      warnings.push('spawn.y should be >= 0 (recommended: 1.6 for avatar height)');
    }
  }

  // Zonen-Validierung
  if (manifest.zones && Array.isArray(manifest.zones)) {
    if (manifest.zones.length === 0) {
      warnings.push('No zones defined. At least one zone is recommended.');
    }
  }

  return { errors, warnings };
}

/**
 * Optimiere Assets (Draco, KTX2)
 */
function optimizeAssets(templateDir, manifest) {
  console.log('🔧 Optimizing assets...');

  try {
    // Prüfe ob gltf-transform verfügbar ist
    try {
      execSync('npx gltf-transform --version', { stdio: 'ignore' });
    } catch {
      console.log('⚠️  gltf-transform not found. Installing...');
      execSync('npm install -g @gltf-transform/cli', { stdio: 'inherit' });
    }

    // Optimiere Scene-GLB
    if (manifest.assets?.scene) {
      const scenePath = join(templateDir, manifest.assets.scene);
      if (existsSync(scenePath) && scenePath.endsWith('.glb')) {
        console.log(`  Optimizing scene: ${basename(scenePath)}`);
        try {
          execSync(`npx gltf-transform optimize "${scenePath}" "${scenePath}" --compress draco`, {
            stdio: 'inherit',
          });
          console.log('  ✅ Scene optimized with DRACO');
        } catch (error) {
          console.warn(`  ⚠️  Failed to optimize scene: ${error.message}`);
        }
      }
    }

    // Optimiere Texturen (KTX2)
    const imagesDir = join(templateDir, 'images');
    if (existsSync(imagesDir)) {
      const images = readdirSync(imagesDir).filter(
        (f) => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp')
      );
      for (const image of images) {
        const imagePath = join(imagesDir, image);
        const ktx2Path = imagePath.replace(/\.(jpg|png|webp)$/i, '.ktx2');
        try {
          execSync(`npx gltf-transform ktx "${imagePath}" "${ktx2Path}"`, {
            stdio: 'inherit',
          });
          console.log(`  ✅ Converted: ${basename(image)} → ${basename(ktx2Path)}`);
        } catch (error) {
          console.warn(`  ⚠️  Failed to convert ${image}: ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.warn('⚠️  Asset optimization failed:', error.message);
  }
}

/**
 * Generiere Manifest falls nicht vorhanden
 */
function generateManifest(templateDir, templateName) {
  const manifestPath = join(templateDir, 'manifest.json');

  if (existsSync(manifestPath)) {
    return JSON.parse(readFileSync(manifestPath, 'utf-8'));
  }

  console.log('📝 Generating manifest.json...');

  // Prüfe vorhandene Assets
  const hasScene = existsSync(join(templateDir, 'scene.glb'));
  const hasHDRI = existsSync(join(templateDir, 'hdri.hdr'));
  const hasNavMesh = existsSync(join(templateDir, 'navmesh.glb'));

  const manifest = {
    id: templateName.toLowerCase().replace(/\s+/g, '-'),
    name: templateName,
    version: '1.0.0',
    assets: {
      scene: hasScene ? 'scene.glb' : null,
      hdri: hasHDRI ? 'hdri.hdr' : null,
      navmesh: hasNavMesh ? 'navmesh.glb' : null,
    },
    spawn: {
      x: 0,
      y: 1.6,
      z: 3,
    },
    zones: [],
    portals: [],
    audioBeacons: [],
    lighting: {
      hdri: hasHDRI ? 'hdri.hdr' : null,
      exposure: 1.0,
    },
  };

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log('✅ Manifest generated');

  return manifest;
}

/**
 * Registriere Template in templates.json
 */
function registerTemplate(templateId, templateName) {
  console.log('📋 Registering template...');

  let templatesIndex = {
    default: 'watt-eco',
    items: [],
  };

  if (existsSync(templatesJsonPath)) {
    try {
      templatesIndex = JSON.parse(readFileSync(templatesJsonPath, 'utf-8'));
    } catch (error) {
      console.warn('⚠️  Failed to read templates.json, creating new one');
    }
  }

  // Prüfe ob Template bereits registriert ist
  const existingIndex = templatesIndex.items.findIndex((item) => item.id === templateId);
  const templateInfo = {
    id: templateId,
    name: templateName,
    path: `/templates/${templateId}/manifest.json`,
  };

  if (existingIndex >= 0) {
    templatesIndex.items[existingIndex] = templateInfo;
    console.log(`  ✅ Updated existing template: ${templateId}`);
  } else {
    templatesIndex.items.push(templateInfo);
    console.log(`  ✅ Added new template: ${templateId}`);
  }

  // Speichere templates.json
  writeFileSync(templatesJsonPath, JSON.stringify(templatesIndex, null, 2) + '\n');
  console.log('✅ Template registered in templates.json');
}

/**
 * Hauptfunktion: Template importieren
 */
async function importTemplate(sourcePath) {
  console.log(`📦 Importing template from: ${sourcePath}\n`);

  // Prüfe ob Quelle existiert
  if (!existsSync(sourcePath)) {
    console.error(`❌ Source path does not exist: ${sourcePath}`);
    process.exit(1);
  }

  const stats = statSync(sourcePath);
  let templateName = basename(sourcePath, extname(sourcePath));
  let tempDir = null;

  try {
    // Handle ZIP-Dateien
    if (stats.isFile() && extname(sourcePath) === '.zip') {
      console.log('📂 Extracting archive...');
      tempDir = join(rootDir, '.temp-template-import');
      if (existsSync(tempDir)) {
        // Cleanup altes temp-Verzeichnis
        execSync(`rm -rf "${tempDir}"`, { stdio: 'ignore' });
      }
      mkdirSync(tempDir, { recursive: true });

      const zip = new AdmZip(sourcePath);
      zip.extractAllTo(tempDir, true);
      sourcePath = tempDir;
    }

    // Prüfe oder generiere manifest.json
    const manifestPath = join(sourcePath, 'manifest.json');
    let manifest;

    if (existsSync(manifestPath)) {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      templateName = manifest.name || templateName;
    } else {
      console.log('⚠️  manifest.json not found, generating...');
      manifest = generateManifest(sourcePath, templateName);
    }

    // Validiere Manifest
    console.log('🔍 Validating manifest...');
    const validation = validateManifest(manifest, sourcePath);

    if (validation.errors.length > 0) {
      console.error('❌ Validation errors:');
      validation.errors.forEach((error) => console.error(`  - ${error}`));
      process.exit(1);
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️  Validation warnings:');
      validation.warnings.forEach((warning) => console.warn(`  - ${warning}`));
    }

    console.log('✅ Manifest validated\n');

    // Erstelle Template-Verzeichnis
    const templateId = manifest.id || templateName.toLowerCase().replace(/\s+/g, '-');
    const targetDir = join(templatesDir, templateId);

    if (existsSync(targetDir)) {
      console.warn(`⚠️  Template "${templateId}" already exists. Overwriting...`);
    }
    mkdirSync(targetDir, { recursive: true });

    // Kopiere Dateien
    console.log('📋 Copying template files...');
    copyTemplateFiles(sourcePath, targetDir, manifest);

    // Aktualisiere Manifest-Pfade
    manifest.id = templateId;
    manifest.name = templateName;
    const finalManifestPath = join(targetDir, 'manifest.json');
    writeFileSync(finalManifestPath, JSON.stringify(manifest, null, 2) + '\n');

    // Optimiere Assets
    optimizeAssets(targetDir, manifest);

    // Registriere Template
    registerTemplate(templateId, templateName);

    console.log(`\n✅ Template "${templateId}" imported successfully!`);
    console.log(`📁 Location: ${targetDir}`);
    console.log(`\n📝 Next steps:`);
    console.log(`  1. Validate: node scripts/validate-templates.ts ${templateId}`);
    console.log(`  2. Test: http://localhost:5173?template=${templateId}`);
  } catch (error) {
    console.error('❌ Failed to import template:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  } finally {
    // Cleanup temp directory
    if (tempDir && existsSync(tempDir)) {
      try {
        execSync(`rm -rf "${tempDir}"`, { stdio: 'ignore' });
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Kopiere Template-Dateien
 */
function copyTemplateFiles(sourceDir, targetDir, manifest) {
  // Kopiere manifest.json
  const manifestSource = join(sourceDir, 'manifest.json');
  if (existsSync(manifestSource)) {
    copyFileSync(manifestSource, join(targetDir, 'manifest.json'));
  }

  // Kopiere Assets basierend auf Manifest
  if (manifest.assets) {
    if (manifest.assets.scene) {
      const sceneSource = join(sourceDir, manifest.assets.scene);
      if (existsSync(sceneSource)) {
        copyFileSync(sceneSource, join(targetDir, basename(manifest.assets.scene)));
      }
    }

    if (manifest.assets.hdri) {
      const hdriSource = join(sourceDir, manifest.assets.hdri);
      if (existsSync(hdriSource)) {
        copyFileSync(hdriSource, join(targetDir, basename(manifest.assets.hdri)));
      }
    }

    if (manifest.assets.navmesh) {
      const navmeshSource = join(sourceDir, manifest.assets.navmesh);
      if (existsSync(navmeshSource)) {
        copyFileSync(navmeshSource, join(targetDir, basename(manifest.assets.navmesh)));
      }
    }
  }

  // Kopiere optionale Verzeichnisse
  const optionalDirs = ['images', 'ambient', 'partials'];
  for (const dir of optionalDirs) {
    const sourcePath = join(sourceDir, dir);
    if (existsSync(sourcePath) && statSync(sourcePath).isDirectory()) {
      const targetPath = join(targetDir, dir);
      mkdirSync(targetPath, { recursive: true });
      copyDirectory(sourcePath, targetPath);
    }
  }

  // Kopiere ui-skin.css falls vorhanden
  const cssSource = join(sourceDir, 'ui-skin.css');
  if (existsSync(cssSource)) {
    copyFileSync(cssSource, join(targetDir, 'ui-skin.css'));
  }
}

/**
 * Kopiere Verzeichnis rekursiv
 */
function copyDirectory(source, target) {
  const entries = readdirSync(source);
  for (const entry of entries) {
    const sourcePath = join(source, entry);
    const targetPath = join(target, entry);
    const stats = statSync(sourcePath);

    if (stats.isDirectory()) {
      mkdirSync(targetPath, { recursive: true });
      copyDirectory(sourcePath, targetPath);
    } else {
      copyFileSync(sourcePath, targetPath);
    }
  }
}

// Main
const sourcePath = process.argv[2];
if (!sourcePath) {
  console.error('Usage: node scripts/import-template-enhanced.js <path|zip>');
  console.error(
    'Example: node scripts/import-template-enhanced.js ./template-research-downloads/models/perfect-template.glb'
  );
  console.error(
    'Example: node scripts/import-template-enhanced.js ./designer-delivery/my-template.zip'
  );
  process.exit(1);
}

importTemplate(sourcePath).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
