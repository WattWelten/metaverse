#!/usr/bin/env tsx

/**
 * Automated Pipeline Script
 * Executes all steps: Download → Validate → Optimize → Test
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

interface PipelineStep {
  name: string;
  command: string;
  required: boolean;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    name: 'Download Templates',
    command: 'pnpm templates:download',
    required: true,
  },
  {
    name: 'Validate Templates',
    command: 'pnpm templates:validate',
    required: true,
  },
  {
    name: 'Download Professional Assets',
    command: 'pnpm assets:professional',
    required: false,
  },
  {
    name: 'Optimize All Templates',
    command: 'pnpm optimize:all',
    required: true,
  },
];

/**
 * Execute pipeline step
 */
function executeStep(step: PipelineStep): { success: boolean; error?: string } {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📦 Step: ${step.name}`);
  console.log(`   Command: ${step.command}`);
  console.log(`${'='.repeat(70)}\n`);

  try {
    execSync(step.command, {
      cwd: rootDir,
      stdio: 'inherit',
      encoding: 'utf-8',
    });
    console.log(`\n✅ ${step.name} completed successfully\n`);
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ ${step.name} failed: ${errorMsg}\n`);

    if (step.required) {
      return { success: false, error: errorMsg };
    } else {
      console.warn(`⚠️  Continuing despite failure (step is optional)\n`);
      return { success: false, error: errorMsg };
    }
  }
}

/**
 * Main pipeline execution
 */
async function main(): Promise<void> {
  console.log('🚀 Starting Automated Pipeline...\n');
  console.log(`📋 Steps to execute: ${PIPELINE_STEPS.length}\n`);

  const results: Array<{ step: string; success: boolean; error?: string }> = [];

  for (const step of PIPELINE_STEPS) {
    const result = executeStep(step);
    results.push({
      step: step.name,
      success: result.success,
      error: result.error,
    });

    if (!result.success && step.required) {
      console.error('\n❌ Pipeline failed at required step. Stopping.\n');
      process.exit(1);
    }
  }

  // Generate summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Pipeline Summary');
  console.log('='.repeat(70) + '\n');

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`Total Steps: ${results.length}`);
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed Steps:');
    failed.forEach((r) => {
      console.log(`  - ${r.step}: ${r.error || 'Unknown error'}`);
    });
  }

  console.log('\n' + '='.repeat(70));

  if (failed.length === 0) {
    console.log('\n🎉 Pipeline completed successfully!\n');
    process.exit(0);
  } else if (failed.every((r, i) => !PIPELINE_STEPS[i].required)) {
    console.log('\n⚠️  Pipeline completed with optional step failures\n');
    process.exit(0);
  } else {
    console.log('\n❌ Pipeline completed with errors\n');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { executeStep, PIPELINE_STEPS };
