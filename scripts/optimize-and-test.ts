#!/usr/bin/env tsx

/**
 * Optimization & Testing Pipeline
 * Runs optimization and tests for all templates
 */

import { existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { AssetOptimizer } from '../packages/core/src/assets/AssetOptimizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

interface OptimizationResult {
  templateId: string;
  optimized: boolean;
  errors: string[];
  stats: {
    filesProcessed: number;
    sizeReduction: number;
    timeMs: number;
  };
}

/**
 * Optimize all templates
 */
async function optimizeAllTemplates(): Promise<OptimizationResult[]> {
  const templatesDir = join(rootDir, 'packages', 'assets', 'templates');
  const results: OptimizationResult[] = [];

  if (!existsSync(templatesDir)) {
    console.warn('Templates directory not found');
    return results;
  }

  const templates = readdirSync(templatesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  console.log(`🔧 Optimizing ${templates.length} templates...\n`);

  const optimizer = new AssetOptimizer();

  for (const templateId of templates) {
    const startTime = Date.now();
    const result: OptimizationResult = {
      templateId,
      optimized: false,
      errors: [],
      stats: {
        filesProcessed: 0,
        sizeReduction: 0,
        timeMs: 0,
      },
    };

    try {
      console.log(`📦 Optimizing template: ${templateId}...`);

      await optimizer.optimizeTemplate(templateId, {
        enableDraco: true,
        enableKTX2: true,
        generateLOD: true,
      });

      result.optimized = true;
      result.stats.timeMs = Date.now() - startTime;
      console.log(`   ✅ Optimized in ${result.stats.timeMs}ms`);
    } catch (error) {
      result.errors.push(String(error));
      console.error(`   ❌ Failed: ${error}`);
    }

    results.push(result);
  }

  return results;
}

/**
 * Run performance tests
 */
async function runPerformanceTests(): Promise<void> {
  console.log('\n📊 Running performance tests...\n');

  // This would run actual performance tests
  // For now, we'll just check if assets exist and are optimized

  const templatesDir = join(rootDir, 'packages', 'assets', 'templates');
  if (!existsSync(templatesDir)) {
    console.warn('Templates directory not found');
    return;
  }

  const templates = readdirSync(templatesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const templateId of templates) {
    const templateDir = join(templatesDir, templateId);
    const manifestPath = join(templateDir, 'manifest.json');

    if (existsSync(manifestPath)) {
      console.log(`✅ ${templateId}: Manifest exists`);
    } else {
      console.warn(`⚠️  ${templateId}: Manifest missing`);
    }

    // Check for optimized assets
    const assetsDir = join(templateDir, 'assets');
    if (existsSync(assetsDir)) {
      const hasOptimized = existsSync(join(assetsDir, 'models', 'optimized'));
      if (hasOptimized) {
        console.log(`   ✅ Optimized assets found`);
      } else {
        console.log(`   ⚠️  No optimized assets found`);
      }
    }
  }
}

/**
 * Generate optimization report
 */
function generateReport(results: OptimizationResult[]): void {
  console.log('\n📋 Optimization Report\n');
  console.log('='.repeat(60));

  const successful = results.filter((r) => r.optimized);
  const failed = results.filter((r) => !r.optimized);

  console.log(`Total Templates: ${results.length}`);
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed Templates:');
    failed.forEach((r) => {
      console.log(`  - ${r.templateId}: ${r.errors.join(', ')}`);
    });
  }

  const avgTime = successful.reduce((sum, r) => sum + r.stats.timeMs, 0) / successful.length;
  console.log(`\n⏱️  Average optimization time: ${avgTime.toFixed(0)}ms`);

  console.log('='.repeat(60));
}

/**
 * Main optimization and testing pipeline
 */
async function main(): Promise<void> {
  console.log('🚀 Starting Optimization & Testing Pipeline...\n');

  // 1. Optimize all templates
  const results = await optimizeAllTemplates();

  // 2. Generate report
  generateReport(results);

  // 3. Run performance tests
  await runPerformanceTests();

  console.log('\n🎉 Optimization & Testing Pipeline completed!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { optimizeAllTemplates, runPerformanceTests };
