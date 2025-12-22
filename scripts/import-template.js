#!/usr/bin/env node

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
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createGunzip } from 'zlib';
import { createUnzip } from 'zlib';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const templatesDir = join(rootDir, 'packages', 'assets', 'templates');

async function importTemplate(sourcePath) {
  console.log(`📦 Importing template from: ${sourcePath}`);

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
    if (stats.isFile() && (extname(sourcePath) === '.zip' || extname(sourcePath) === '.tar.gz')) {
      console.log('📂 Extracting archive...');
      tempDir = join(rootDir, '.temp-template-import');
      mkdirSync(tempDir, { recursive: true });

      if (extname(sourcePath) === '.zip') {
        const zip = new AdmZip(sourcePath);
        zip.extractAllTo(tempDir, true);
      } else {
        // Tar.gz handling würde hier kommen
        console.error('❌ .tar.gz not yet supported');
        process.exit(1);
      }

      // Finde manifest.json im extrahierten Inhalt
      const manifestPath = findManifest(tempDir);
      if (manifestPath) {
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
        templateName = manifest.name || templateName;
      }

      sourcePath = tempDir;
    }

    // Prüfe ob manifest.json existiert
    const manifestPath = join(sourcePath, 'manifest.json');
    if (!existsSync(manifestPath)) {
      console.error('❌ manifest.json not found in template');
      process.exit(1);
    }

    // Validiere manifest.json
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    validateManifest(manifest, sourcePath);

    // Erstelle Template-Verzeichnis
    const targetDir = join(templatesDir, templateName);
    if (existsSync(targetDir)) {
      console.warn(`⚠️  Template "${templateName}" already exists. Overwriting...`);
    }
    mkdirSync(targetDir, { recursive: true });

    // Kopiere Dateien
    console.log('📋 Copying template files...');
    copyTemplateFiles(sourcePath, targetDir, manifest);

    // Anpasse Pfade in manifest.json
    adjustManifestPaths(targetDir, manifest);

    console.log(`✅ Template "${templateName}" imported successfully!`);
    console.log(`📁 Location: ${targetDir}`);
  } catch (error) {
    console.error('❌ Failed to import template:', error.message);
    process.exit(1);
  } finally {
    // Cleanup temp directory
    if (tempDir && existsSync(tempDir)) {
      // Würde hier tempDir löschen (vereinfacht für MVP)
    }
  }
}

function findManifest(dir) {
  const manifestPath = join(dir, 'manifest.json');
  if (existsSync(manifestPath)) {
    return manifestPath;
  }

  // Rekursiv suchen
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      const found = findManifest(fullPath);
      if (found) return found;
    }
  }

  return null;
}

function validateManifest(manifest, sourceDir) {
  const required = ['name', 'version'];
  for (const field of required) {
    if (!manifest[field]) {
      throw new Error(`Missing required field in manifest: ${field}`);
    }
  }

  if (typeof manifest.name !== 'string' || manifest.name.length === 0) {
    throw new Error('manifest.name must be a non-empty string');
  }

  if (typeof manifest.version !== 'string' || !/^\d+\.\d+\.\d+/.test(manifest.version)) {
    throw new Error('manifest.version must be a valid semver string');
  }

  // Validate referenced assets (optional, warnings only)
  if (manifest.assets) {
    if (manifest.assets.scene && !existsSync(join(sourceDir, manifest.assets.scene))) {
      console.warn(`⚠️  Referenced scene asset not found: ${manifest.assets.scene}`);
    }
    if (manifest.assets.hdri && !existsSync(join(sourceDir, manifest.assets.hdri))) {
      console.warn(`⚠️  Referenced HDRI asset not found: ${manifest.assets.hdri}`);
    }
  }

  if (manifest.lighting?.hdri && !existsSync(join(sourceDir, manifest.lighting.hdri))) {
    console.warn(`⚠️  Referenced HDRI in lighting not found: ${manifest.lighting.hdri}`);
  }

  // Validate ambient audio sources
  if (manifest.ambient?.sources) {
    for (const source of manifest.ambient.sources) {
      if (source.file && !existsSync(join(sourceDir, source.file))) {
        console.warn(`⚠️  Referenced ambient audio not found: ${source.file}`);
      }
    }
  }
}

function copyTemplateFiles(sourceDir, targetDir, manifest) {
  // Kopiere manifest.json
  copyFileSync(join(sourceDir, 'manifest.json'), join(targetDir, 'manifest.json'));

  // Kopiere ui-skin.css falls vorhanden
  const cssSource = join(sourceDir, 'ui-skin.css');
  if (existsSync(cssSource)) {
    copyFileSync(cssSource, join(targetDir, 'ui-skin.css'));
  }

  // Kopiere partials/ Verzeichnis falls vorhanden
  const partialsSource = join(sourceDir, 'partials');
  if (existsSync(partialsSource) && statSync(partialsSource).isDirectory()) {
    const partialsTarget = join(targetDir, 'partials');
    mkdirSync(partialsTarget, { recursive: true });
    copyDirectory(partialsSource, partialsTarget);
  }

  // Kopiere scene.glb falls vorhanden
  const sceneSource = join(sourceDir, 'scene.glb');
  if (existsSync(sceneSource)) {
    copyFileSync(sceneSource, join(targetDir, 'scene.glb'));
  }

  // Kopiere hdri falls vorhanden
  const hdriSource = join(sourceDir, 'hdri.hdr');
  if (existsSync(hdriSource)) {
    copyFileSync(hdriSource, join(targetDir, 'hdri.hdr'));
  }

  // Kopiere ambient/ Verzeichnis falls vorhanden
  const ambientSource = join(sourceDir, 'ambient');
  if (existsSync(ambientSource) && statSync(ambientSource).isDirectory()) {
    const ambientTarget = join(targetDir, 'ambient');
    mkdirSync(ambientTarget, { recursive: true });
    copyDirectory(ambientSource, ambientTarget);
  }

  // Kopiere images/ Verzeichnis falls vorhanden
  const imagesSource = join(sourceDir, 'images');
  if (existsSync(imagesSource) && statSync(imagesSource).isDirectory()) {
    const imagesTarget = join(targetDir, 'images');
    mkdirSync(imagesTarget, { recursive: true });
    copyDirectory(imagesSource, imagesTarget);
  }
}

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

function adjustManifestPaths(targetDir, manifest) {
  // Passe relative Pfade an (falls nötig)
  // Für MVP: Manifest bleibt wie es ist
  const manifestPath = join(targetDir, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

// Main
const sourcePath = process.argv[2];
if (!sourcePath) {
  console.error('Usage: pnpm import-template <path|zip>');
  console.error('Example: pnpm import-template ./my-template.zip');
  process.exit(1);
}

importTemplate(sourcePath).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
