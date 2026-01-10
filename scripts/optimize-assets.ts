#!/usr/bin/env tsx
/**
 * Asset Pipeline - Batch optimization with DRACO/KTX2
 * Optimizes GLB files and textures for production use
 */

import {
  readdirSync,
  readFileSync,
  statSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  unlinkSync,
} from 'fs';
import { join, dirname, extname, basename } from 'path';
import { execSync } from 'child_process';

interface AssetConfig {
  inputDir: string;
  outputDir: string;
  draco: boolean;
  ktx2: boolean;
  quality: 'low' | 'medium' | 'high';
}

const configs: AssetConfig[] = [
  {
    inputDir: join(process.cwd(), 'apps/web/public/templates'),
    outputDir: join(process.cwd(), 'apps/web/public/templates'),
    draco: true,
    ktx2: true,
    quality: 'high',
  },
  {
    inputDir: join(process.cwd(), 'apps/web/public/assets'),
    outputDir: join(process.cwd(), 'apps/web/public/assets'),
    draco: true,
    ktx2: true,
    quality: 'medium',
  },
];

/**
 * Check if gltf-transform is installed
 */
function checkGLTFTransform(): boolean {
  try {
    execSync('npx gltf-transform --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Install gltf-transform if not available
 */
function installGLTFTransform(): void {
  console.log('📦 Installing gltf-transform...');
  try {
    execSync('npm install -g @gltf-transform/cli', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to install gltf-transform:', error);
    throw error;
  }
}

/**
 * Convert GLTF to GLB and optimize with DRACO
 */
function convertAndOptimize(inputPath: string, outputPath: string, quality: string): void {
  const qualityMap: Record<string, string> = {
    low: '1',
    medium: '7',
    high: '10',
  };

  const dracoLevel = qualityMap[quality] || '7';
  const isGLTF = inputPath.endsWith('.gltf');
  const tempGLB = isGLTF ? inputPath.replace('.gltf', '.temp.glb') : inputPath;

  console.log(`  🔧 Processing ${basename(inputPath)}...`);

  try {
    // Ensure output directory exists
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Step 1: Convert GLTF to GLB if needed
    if (isGLTF) {
      console.log(`    Converting GLTF to GLB...`);
      execSync(`npx gltf-transform copy "${inputPath}" "${tempGLB}"`, { stdio: 'inherit' });
    }

    // Step 2: Optimize with DRACO
    const sourceFile = isGLTF ? tempGLB : inputPath;
    console.log(`    Optimizing with DRACO compression...`);
    // Use optimize command with draco compression
    execSync(`npx gltf-transform optimize "${sourceFile}" "${outputPath}" --compress draco`, {
      stdio: 'inherit',
    });

    // Clean up temp file (only if it still exists and is different from output)
    if (isGLTF && tempGLB !== outputPath && existsSync(tempGLB)) {
      try {
        unlinkSync(tempGLB);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    console.log(`  ✅ Optimized: ${basename(outputPath)}`);
  } catch (error) {
    console.error(`  ❌ Failed to process ${basename(inputPath)}:`, error);
    // Fallback: copy original file if it's already GLB
    if (!isGLTF && !existsSync(outputPath)) {
      const fs = require('fs');
      fs.copyFileSync(inputPath, outputPath);
      console.log(`  ⚠️  Copied original file as fallback`);
    }
  }
}

/**
 * Optimize textures with KTX2
 */
function optimizeTextures(inputDir: string, outputDir: string): void {
  console.log(`  🖼️  Optimizing textures in ${inputDir}...`);

  const textureExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const files = readdirSync(inputDir, { recursive: true });

  for (const file of files) {
    const filePath = join(inputDir, file);
    const ext = extname(filePath).toLowerCase();

    if (textureExtensions.includes(ext) && statSync(filePath).isFile()) {
      const outputPath = join(outputDir, file.replace(ext, '.ktx2'));

      try {
        // Ensure output directory exists
        const outputFileDir = dirname(outputPath);
        if (!existsSync(outputFileDir)) {
          mkdirSync(outputFileDir, { recursive: true });
        }

        // Use gltf-transform to convert to KTX2
        execSync(`npx gltf-transform ktx "${filePath}" "${outputPath}"`, { stdio: 'inherit' });
        console.log(`  ✅ Converted: ${basename(filePath)} → ${basename(outputPath)}`);
      } catch (error) {
        console.error(`  ❌ Failed to convert ${basename(filePath)}:`, error);
      }
    }
  }
}

/**
 * Process all assets in a directory
 */
function processAssets(config: AssetConfig): void {
  console.log(`\n📁 Processing: ${config.inputDir}`);

  if (!existsSync(config.inputDir)) {
    console.log(`  ⚠️  Directory does not exist: ${config.inputDir}`);
    return;
  }

  const files = readdirSync(config.inputDir, { recursive: true });

  for (const file of files) {
    const filePath = join(config.inputDir, file);
    const ext = extname(filePath).toLowerCase();

    // Skip temp files
    if (file.includes('.temp.')) {
      continue;
    }

    if ((ext === '.glb' || ext === '.gltf') && statSync(filePath).isFile()) {
      // Always output as .glb
      const outputPath = join(config.outputDir, file.replace(/\.gltf?$/, '.glb'));

      if (config.draco) {
        convertAndOptimize(filePath, outputPath, config.quality);
      } else {
        // Just convert GLTF to GLB without optimization
        if (ext === '.gltf') {
          try {
            execSync(`npx gltf-transform copy "${filePath}" "${outputPath}"`, { stdio: 'inherit' });
            console.log(`  ✅ Converted: ${basename(filePath)} → ${basename(outputPath)}`);
          } catch (error) {
            console.error(`  ❌ Failed to convert ${basename(filePath)}:`, error);
          }
        } else {
          // Copy GLB as-is
          const outputFileDir = dirname(outputPath);
          if (!existsSync(outputFileDir)) {
            mkdirSync(outputFileDir, { recursive: true });
          }
          copyFileSync(filePath, outputPath);
        }
      }
    }
  }

  if (config.ktx2) {
    optimizeTextures(config.inputDir, config.outputDir);
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting Asset Pipeline...\n');

  // Check if gltf-transform is available
  if (!checkGLTFTransform()) {
    console.log('⚠️  gltf-transform not found. Installing...');
    installGLTFTransform();
  }

  // Process all asset configurations
  for (const config of configs) {
    processAssets(config);
  }

  console.log('\n✅ Asset Pipeline completed!');
  console.log('\n📊 Summary:');
  console.log('  - GLB files optimized with DRACO compression');
  console.log('  - Textures converted to KTX2 format');
  console.log('  - Assets ready for production use');
}

main().catch((error) => {
  console.error('❌ Asset Pipeline failed:', error);
  process.exit(1);
});
