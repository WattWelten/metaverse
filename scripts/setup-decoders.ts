#!/usr/bin/env tsx

import { mkdirSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const decoderPaths = [
  join(rootDir, 'apps/web/public/draco'),
  join(rootDir, 'apps/web/public/ktx2'),
];

// CDN URLs for decoder files
const DRACO_CDN_BASE = 'https://www.gstatic.com/draco/v1/decoders/';
const DRACO_FILES = ['draco_decoder.wasm', 'draco_decoder.js', 'draco_wasm_wrapper.js'];

const KTX2_CDN_BASE = 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/basis/';
const KTX2_FILES = ['basis_transcoder.js', 'basis_transcoder.wasm'];

async function downloadFile(url: string, dest: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return false;
    }
    const buffer = await response.arrayBuffer();
    const stream = Readable.from(Buffer.from(buffer));
    const writeStream = createWriteStream(dest);
    await pipeline(stream, writeStream);
    return true;
  } catch (error) {
    console.warn(`Failed to download ${url}:`, error);
    return false;
  }
}

async function setupDecoders(): Promise<void> {
  console.log('Setting up decoder directories...');

  // Create directories
  decoderPaths.forEach((path) => {
    try {
      if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
        console.log(`✅ Created directory: ${path}`);
      } else {
        console.log(`ℹ️  Directory already exists: ${path}`);
      }
    } catch (error) {
      console.error(`❌ Failed to setup ${path}:`, error);
      process.exit(1);
    }
  });

  const dracoDir = decoderPaths[0];
  const ktx2Dir = decoderPaths[1];

  // Download Draco decoders
  console.log('\n📥 Downloading Draco decoders...');
  let dracoDownloaded = 0;
  for (const file of DRACO_FILES) {
    const dest = join(dracoDir, file);
    if (existsSync(dest)) {
      console.log(`ℹ️  ${file} already exists, skipping`);
      dracoDownloaded++;
      continue;
    }
    const url = `${DRACO_CDN_BASE}${file}`;
    console.log(`  Downloading ${file}...`);
    if (await downloadFile(url, dest)) {
      console.log(`  ✅ Downloaded ${file}`);
      dracoDownloaded++;
    } else {
      console.log(`  ⚠️  Failed to download ${file}`);
    }
  }

  // Download KTX2 transcoders
  console.log('\n📥 Downloading KTX2 transcoders...');
  let ktx2Downloaded = 0;
  for (const file of KTX2_FILES) {
    const dest = join(ktx2Dir, file);
    if (existsSync(dest)) {
      console.log(`ℹ️  ${file} already exists, skipping`);
      ktx2Downloaded++;
      continue;
    }
    const url = `${KTX2_CDN_BASE}${file}`;
    console.log(`  Downloading ${file}...`);
    if (await downloadFile(url, dest)) {
      console.log(`  ✅ Downloaded ${file}`);
      ktx2Downloaded++;
    } else {
      console.log(`  ⚠️  Failed to download ${file}`);
    }
  }

  // Create README files if downloads failed
  if (dracoDownloaded < DRACO_FILES.length) {
    const readmePath = join(dracoDir, 'README.md');
    if (!existsSync(readmePath)) {
      writeFileSync(
        readmePath,
        `# Draco Decoder Files

This directory should contain the Draco decoder files:
- draco_decoder.wasm
- draco_decoder.js
- draco_wasm_wrapper.js

## Manual Download

If automatic download failed, download from:
https://github.com/google/draco/tree/master/javascript/draco_decoder

Or use CDN:
https://www.gstatic.com/draco/v1/decoders/
`,
        'utf-8'
      );
      console.log('✅ Created README.md in draco directory');
    }
  }

  if (ktx2Downloaded < KTX2_FILES.length) {
    const readmePath = join(ktx2Dir, 'README.md');
    if (!existsSync(readmePath)) {
      writeFileSync(
        readmePath,
        `# KTX2/Basis Transcoder Files

This directory should contain the KTX2 transcoder files:
- basis_transcoder.js
- basis_transcoder.wasm

## Manual Download

If automatic download failed, download from:
https://github.com/BinomialLLC/basis_universal/tree/master/webgl

Or use CDN:
https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/basis/
`,
        'utf-8'
      );
      console.log('✅ Created README.md in ktx2 directory');
    }
  }

  // Create .gitkeep if directories are empty
  decoderPaths.forEach((path) => {
    const gitkeepPath = join(path, '.gitkeep');
    const files = readdirSync(path).filter((f) => f !== '.gitkeep' && f !== 'README.md');
    if (files.length === 0 && !existsSync(gitkeepPath)) {
      writeFileSync(gitkeepPath, '');
      console.log(`✅ Created .gitkeep: ${gitkeepPath}`);
    }
  });

  console.log('\n✅ Decoder setup complete!');
  if (dracoDownloaded === DRACO_FILES.length && ktx2Downloaded === KTX2_FILES.length) {
    console.log('✅ All decoder files downloaded successfully');
  } else {
    console.log(
      '⚠️  Some decoder files failed to download. Check README files for manual download instructions.'
    );
  }
}

setupDecoders().catch((error) => {
  console.error('❌ Decoder setup failed:', error);
  process.exit(1);
});
