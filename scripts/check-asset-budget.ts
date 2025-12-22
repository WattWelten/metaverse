#!/usr/bin/env tsx
/**
 * Asset Budget Checker
 * Validates that GLB files are within budget (≤20 MB total)
 * Checks for KTX2/Draco compression
 */

import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const MAX_TOTAL_SIZE_MB = 20;
const MAX_INDIVIDUAL_SIZE_MB = 10;

interface AssetInfo {
  path: string;
  size: number;
  sizeMB: number;
}

async function getFilesRecursive(dir: string, extensions: string[]): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await getFilesRecursive(fullPath, extensions)));
      } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory might not exist, ignore
  }
  return files;
}

async function checkAssetBudget(): Promise<void> {
  console.log('🔍 Checking asset budget...\n');

  // Find all GLB files
  const glbFiles = await getFilesRecursive('apps/web/public', ['.glb', '.gltf']);
  const assets: AssetInfo[] = [];

  for (const file of glbFiles) {
    try {
      const stats = await stat(file);
      const sizeMB = stats.size / (1024 * 1024);
      assets.push({
        path: file,
        size: stats.size,
        sizeMB,
      });
    } catch (error) {
      console.warn(`⚠️  Could not read ${file}:`, error);
    }
  }

  // Calculate totals
  const totalSizeMB = assets.reduce((sum, asset) => sum + asset.sizeMB, 0);
  const largestAsset = assets.reduce((max, asset) => (asset.sizeMB > max.sizeMB ? asset : max), {
    path: '',
    size: 0,
    sizeMB: 0,
  });

  // Report
  console.log(`📦 Found ${assets.length} GLB/GLTF files`);
  console.log(`📊 Total size: ${totalSizeMB.toFixed(2)} MB`);
  if (largestAsset.path) {
    console.log(`📈 Largest file: ${largestAsset.path} (${largestAsset.sizeMB.toFixed(2)} MB)`);
  }
  console.log('');

  // Check budget
  let passed = true;

  if (totalSizeMB > MAX_TOTAL_SIZE_MB) {
    console.error(
      `❌ Total size exceeds budget: ${totalSizeMB.toFixed(2)} MB > ${MAX_TOTAL_SIZE_MB} MB`
    );
    passed = false;
  } else {
    console.log(
      `✅ Total size within budget: ${totalSizeMB.toFixed(2)} MB ≤ ${MAX_TOTAL_SIZE_MB} MB`
    );
  }

  if (largestAsset.sizeMB > MAX_INDIVIDUAL_SIZE_MB) {
    console.error(
      `❌ Largest file exceeds limit: ${largestAsset.sizeMB.toFixed(2)} MB > ${MAX_INDIVIDUAL_SIZE_MB} MB`
    );
    passed = false;
  } else if (largestAsset.path) {
    console.log(
      `✅ Largest file within limit: ${largestAsset.sizeMB.toFixed(2)} MB ≤ ${MAX_INDIVIDUAL_SIZE_MB} MB`
    );
  }

  // Check for compression
  const ktx2Files = await getFilesRecursive('apps/web/public', ['.ktx2']);
  const dracoFiles = await getFilesRecursive('apps/web/public/draco', ['.js', '.wasm']);

  console.log('');
  console.log(`🔧 Compression check:`);
  console.log(`   KTX2 files: ${ktx2Files.length}`);
  console.log(`   Draco decoders: ${dracoFiles.length > 0 ? '✅ Present' : '⚠️  Missing'}`);

  if (!passed) {
    console.error('\n❌ Asset budget check failed!');
    process.exit(1);
  } else {
    console.log('\n✅ Asset budget check passed!');
  }
}

checkAssetBudget().catch((error) => {
  console.error('Error checking asset budget:', error);
  process.exit(1);
});
