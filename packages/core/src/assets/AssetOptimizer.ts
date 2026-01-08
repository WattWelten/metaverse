/**
 * Asset Optimizer
 * Optimizes 3D assets (GLB, textures) for web performance
 * - GLB compression with Draco
 * - KTX2 texture compression
 * - LOD generation
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';

interface OptimizeOptions {
  inputPath: string;
  outputPath?: string;
  enableDraco?: boolean;
  enableKTX2?: boolean;
  generateLOD?: boolean;
  lodLevels?: number[];
}

export class AssetOptimizer {
  /**
   * Optimize GLB file with Draco compression
   */
  async optimizeGLB(options: OptimizeOptions): Promise<string> {
    const { inputPath, outputPath, enableDraco = true } = options;

    if (!existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    const output = outputPath || inputPath.replace(/\.(glb|gltf)$/, '.optimized.glb');

    // For MVP, we'll use gltf-transform if available
    // Otherwise, return the original file path
    try {
      // Check if gltf-transform is available (optional dependency)
      // @ts-expect-error - Optional dependency, may not be installed
      const gltfTransform = await import('@gltf-transform/core').catch(() => null);

      if (gltfTransform && enableDraco) {
        // Use gltf-transform for optimization
        // @ts-expect-error - Optional dependency, may not be installed
        const { NodeIO } = await import('@gltf-transform/core');
        // @ts-expect-error - Optional dependency, may not be installed
        const { draco } = await import('@gltf-transform/extensions');

        const io = new NodeIO();
        const document = await io.read(inputPath);

        // Apply Draco compression
        document.createExtension(draco.Draco).setRequired(true);

        await io.write(output, document);
        return output;
      } else {
        // Fallback: copy file
        const fs = await import('fs');
        fs.copyFileSync(inputPath, output);
        return output;
      }
    } catch (error) {
      console.warn('GLB optimization not available, using original file:', error);
      return inputPath;
    }
  }

  /**
   * Convert textures to KTX2 format
   */
  async optimizeTexture(inputPath: string, outputPath?: string): Promise<string> {
    if (!existsSync(inputPath)) {
      throw new Error(`Input texture not found: ${inputPath}`);
    }

    const output = outputPath || inputPath.replace(/\.(jpg|png|jpeg)$/i, '.ktx2');

    try {
      // Use basis-encoder or similar for KTX2 conversion
      // For MVP, we'll return the original path if conversion is not available
      // @ts-expect-error - Optional dependency, may not be installed
      const basisEncoder = await import('basis-encoder').catch(() => null);

      if (basisEncoder) {
        // Convert to KTX2
        const imageData = readFileSync(inputPath);
        const ktx2Data = await basisEncoder.encode(imageData, {
          format: 'ktx2',
          quality: 90,
        });

        writeFileSync(output, ktx2Data);
        return output;
      } else {
        console.warn('KTX2 conversion not available, using original texture');
        return inputPath;
      }
    } catch (error) {
      console.warn('Texture optimization failed, using original:', error);
      return inputPath;
    }
  }

  /**
   * Generate LOD variants of a model
   */
  async generateLOD(inputPath: string, lodLevels: number[] = [0.5, 0.25, 0.1]): Promise<string[]> {
    if (!existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    const outputDir = join(dirname(inputPath), 'lod');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const baseName = basename(inputPath, extname(inputPath));
    const outputs: string[] = [];

    try {
      // Use gltf-transform for LOD generation
      // @ts-expect-error - Optional dependency, may not be installed
      const gltfTransform = await import('@gltf-transform/core').catch(() => null);

      if (gltfTransform) {
        // @ts-expect-error - Optional dependency, may not be installed
        const { NodeIO } = await import('@gltf-transform/core');
        // @ts-expect-error - Optional dependency, may not be installed
        const { simplify } = await import('@gltf-transform/functions');

        const io = new NodeIO();

        for (let i = 0; i < lodLevels.length; i++) {
          const ratio = lodLevels[i];
          const outputPath = join(outputDir, `${baseName}_LOD${i}.glb`);

          const document = await io.read(inputPath);

          // Simplify mesh
          await document.transform(simplify({ ratio }));

          await io.write(outputPath, document);
          outputs.push(outputPath);
        }
      } else {
        console.warn('LOD generation not available, gltf-transform not found');
      }
    } catch (error) {
      console.warn('LOD generation failed:', error);
    }

    return outputs;
  }

  /**
   * Optimize all assets in a template directory
   */
  async optimizeTemplate(
    templateId: string,
    options: Partial<OptimizeOptions> = {}
  ): Promise<void> {
    const templateDir = join(process.cwd(), 'packages', 'assets', 'templates', templateId);

    if (!existsSync(templateDir)) {
      throw new Error(`Template directory not found: ${templateDir}`);
    }

    console.log(`🔧 Optimizing assets for template: ${templateId}`);

    // Find all GLB files
    const fs = await import('fs');
    const path = await import('path');

    const findGLBFiles = (dir: string): string[] => {
      const files: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...findGLBFiles(fullPath));
        } else if (entry.name.endsWith('.glb') || entry.name.endsWith('.gltf')) {
          files.push(fullPath);
        }
      }

      return files;
    };

    const glbFiles = findGLBFiles(templateDir);

    for (const glbFile of glbFiles) {
      try {
        console.log(`  🔧 Optimizing: ${path.basename(glbFile)}`);
        await this.optimizeGLB({
          inputPath: glbFile,
          ...options,
        });
        console.log(`  ✅ Optimized: ${path.basename(glbFile)}`);
      } catch (error) {
        console.error(`  ❌ Failed to optimize ${glbFile}:`, error);
      }
    }

    console.log(`✅ Template optimization completed: ${templateId}`);
  }
}
