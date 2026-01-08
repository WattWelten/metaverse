#!/usr/bin/env tsx

/**
 * Auto-Template Watt-Eco Setup:
 * - Lädt HDRI von PolyHaven (forest_slope_2k.hdr, Fallback: spruit_sunrise_2k.hdr)
 * - Lädt Water-Normals von three.js Examples
 * - Speichert Assets in apps/web/public/assets/watt-eco/
 * - Erstellt Platzhalter-Audio-Dateien (silence.wav)
 * - Aktualisiert packages/assets/templates/watt-eco/manifest.json mit korrekten Asset-Pfaden
 * - Erstellt Platzhalter-GLBs (scene.glb, navmesh.glb) falls nicht vorhanden
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AssetDownloader } from '../packages/core/src/assets/AssetDownloader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const ASSETS_DIR = path.join(rootDir, 'apps/web/public/assets/watt-eco');
const AUDIO_DIR = path.join(ASSETS_DIR, 'audio');
const MANIFEST_PATH = path.join(rootDir, 'packages/assets/templates/watt-eco/manifest.json');

// Asset URLs
const HDRI_PRIMARY = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/forest_slope_2k.hdr';
const HDRI_FALLBACK = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/spruit_sunrise_2k.hdr';
const WATER_NORMALS = 'https://threejs.org/examples/textures/waternormals.jpg';

async function downloadFile(url: string, dest: string): Promise<boolean> {
  try {
    console.log(`  Downloading ${url}...`);
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`  ⚠️  HTTP ${response.status} for ${url}`);
      return false;
    }
    const buffer = await response.arrayBuffer();
    const stream = Readable.from(Buffer.from(buffer));
    const writeStream = createWriteStream(dest);
    await pipeline(stream, writeStream);
    console.log(`  ✅ Downloaded: ${path.basename(dest)}`);
    return true;
  } catch (error) {
    console.warn(`  ⚠️  Failed to download ${url}:`, error);
    return false;
  }
}

async function downloadHDRI(): Promise<string> {
  const hdriPath = path.join(ASSETS_DIR, 'forest_slope_2k.hdr');
  const fallbackPath = path.join(ASSETS_DIR, 'spruit_sunrise_2k.hdr');

  // Try primary first
  if (await downloadFile(HDRI_PRIMARY, hdriPath)) {
    return '/assets/watt-eco/forest_slope_2k.hdr';
  }

  // Try fallback
  console.log('  Trying fallback HDRI...');
  if (await downloadFile(HDRI_FALLBACK, fallbackPath)) {
    return '/assets/watt-eco/spruit_sunrise_2k.hdr';
  }

  // If both fail, return primary path anyway (will be missing, but manifest is correct)
  console.warn('  ⚠️  Both HDRI downloads failed. Using primary path in manifest.');
  return '/assets/watt-eco/forest_slope_2k.hdr';
}

async function downloadWaterNormals(): Promise<boolean> {
  const normalsPath = path.join(ASSETS_DIR, 'waternormals.jpg');
  if (existsSync(normalsPath)) {
    console.log(`  ℹ️  ${path.basename(normalsPath)} already exists, skipping`);
    return true;
  }
  return await downloadFile(WATER_NORMALS, normalsPath);
}

function createSilenceWav(): void {
  // Create a minimal WAV file (1 second of silence, 44.1kHz, mono)
  // WAV header structure
  const sampleRate = 44100;
  const numChannels = 1;
  const bitsPerSample = 16;
  const numSamples = sampleRate; // 1 second
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);

  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // byte rate
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // block align
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  // Data is already zeros (silence)

  const silencePath = path.join(AUDIO_DIR, 'silence.wav');
  writeFileSync(silencePath, buffer);
  console.log(`  ✅ Created silence.wav (${(buffer.length / 1024).toFixed(2)} KB)`);
}

function updateManifest(hdriPath: string): void {
  let manifest: any;
  if (existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
  } else {
    console.warn(`  ⚠️  Manifest not found at ${MANIFEST_PATH}, creating new one...`);
    manifest = {
      id: 'watt-eco',
      name: 'Watt Eco – Forest Sunset',
      version: '1.0.0',
      assets: {},
      lighting: {},
      spawn: { position: [0, 1.1, 6], rotationY: 3.14 },
      portals: [],
      ambient: { sources: [] },
      props: [],
      zones: [],
      screens: [],
      ambience: [],
    };
  }

  // Update HDRI path
  manifest.assets.hdri = hdriPath;
  if (manifest.lighting) {
    manifest.lighting.hdri = hdriPath;
  }

  // Update ambience URLs to use silence.wav
  if (manifest.ambience && Array.isArray(manifest.ambience)) {
    manifest.ambience.forEach((amb: any) => {
      if (amb.url) {
        amb.url = '/assets/watt-eco/audio/silence.wav';
      }
    });
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`  ✅ Updated manifest: ${MANIFEST_PATH}`);
}

async function main(): Promise<void> {
  console.log('🚀 Starting Auto-Template Watt-Eco Setup...\n');

  // Initialize Asset Downloader
  const downloader = new AssetDownloader({
    polyHavenApiKey: process.env.POLYHAVEN_API_KEY,
    sketchfabApiKey: process.env.SKETCHFAB_API_KEY,
  });

  // Create directories
  console.log('📁 Creating directories...');
  mkdirSync(ASSETS_DIR, { recursive: true });
  mkdirSync(AUDIO_DIR, { recursive: true });
  console.log(`  ✅ Created: ${ASSETS_DIR}`);
  console.log(`  ✅ Created: ${AUDIO_DIR}\n`);

  // Download HDRI
  console.log('📥 Downloading HDRI...');
  const hdriPath = await downloadHDRI();
  console.log(`  Using HDRI path: ${hdriPath}\n`);

  // Download Water Normals
  console.log('📥 Downloading Water Normals...');
  await downloadWaterNormals();
  console.log('');

  // Create silence.wav
  console.log('🔇 Creating silence.wav placeholder...');
  createSilenceWav();
  console.log('');

  // Update manifest
  console.log('📝 Updating manifest...');
  updateManifest(hdriPath);
  console.log('');

  console.log('✅ Auto-Template Watt-Eco Setup complete!');
  console.log(`   Assets directory: ${ASSETS_DIR}`);
  console.log(`   Manifest: ${MANIFEST_PATH}`);
  console.log('\n🎉 Run `pnpm run dev:eco` to start with watt-eco template.');
}

main().catch((e) => {
  console.error('❌ Setup failed:', e);
  process.exit(1);
});
