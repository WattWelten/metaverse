#!/usr/bin/env tsx

/**
 * Generate Status Report
 * Creates a comprehensive status report of the project
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

interface TemplateStatus {
  id: string;
  exists: boolean;
  hasManifest: boolean;
  hasAssets: boolean;
  assetCount: number;
  size: number;
}

interface ProjectStatus {
  templates: TemplateStatus[];
  totalTemplates: number;
  totalSize: number;
  scripts: {
    download: boolean;
    validate: boolean;
    optimize: boolean;
    pipeline: boolean;
  };
}

/**
 * Get template status
 */
function getTemplateStatus(templateId: string): TemplateStatus {
  const templateDir = join(rootDir, 'packages', 'assets', 'templates', templateId);
  const status: TemplateStatus = {
    id: templateId,
    exists: existsSync(templateDir),
    hasManifest: false,
    hasAssets: false,
    assetCount: 0,
    size: 0,
  };

  if (!status.exists) {
    return status;
  }

  // Check manifest
  const manifestPath = join(templateDir, 'manifest.json');
  status.hasManifest = existsSync(manifestPath);

  // Check assets
  const assetsDir = join(templateDir, 'assets');
  if (existsSync(assetsDir)) {
    status.hasAssets = true;

    // Count assets
    const countAssets = (dir: string): number => {
      if (!existsSync(dir)) return 0;
      let count = 0;
      try {
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isFile()) {
            count++;
            const filePath = join(dir, entry.name);
            try {
              const stats = statSync(filePath);
              status.size += stats.size;
            } catch {
              // Ignore errors
            }
          } else if (entry.isDirectory()) {
            count += countAssets(join(dir, entry.name));
          }
        }
      } catch {
        // Ignore errors
      }
      return count;
    };

    status.assetCount = countAssets(assetsDir);
  }

  return status;
}

/**
 * Get project status
 */
function getProjectStatus(): ProjectStatus {
  const templatesDir = join(rootDir, 'packages', 'assets', 'templates');

  const templates: TemplateStatus[] = [];
  let totalSize = 0;

  if (existsSync(templatesDir)) {
    const templateIds = readdirSync(templatesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const templateId of templateIds) {
      const status = getTemplateStatus(templateId);
      templates.push(status);
      totalSize += status.size;
    }
  }

  // Check scripts
  const scripts = {
    download: existsSync(join(rootDir, 'scripts', 'download-landscape-templates.ts')),
    validate: existsSync(join(rootDir, 'scripts', 'validate-templates.ts')),
    optimize: existsSync(join(rootDir, 'scripts', 'optimize-and-test.ts')),
    pipeline: existsSync(join(rootDir, 'scripts', 'auto-pipeline.ts')),
  };

  return {
    templates,
    totalTemplates: templates.length,
    totalSize,
    scripts,
  };
}

/**
 * Generate report
 */
function generateReport(status: ProjectStatus): void {
  console.log('\n' + '='.repeat(70));
  console.log('📊 WattWelten Metaverse - Status Report');
  console.log('='.repeat(70) + '\n');

  // Templates
  console.log('📦 Templates:');
  console.log(`   Total: ${status.totalTemplates}`);
  console.log(`   Total Size: ${(status.totalSize / 1024 / 1024).toFixed(2)} MB\n`);

  if (status.templates.length > 0) {
    console.log('   Details:');
    for (const template of status.templates) {
      const sizeMB = (template.size / 1024 / 1024).toFixed(2);
      console.log(`   - ${template.id}`);
      console.log(`     Exists: ${template.exists ? '✅' : '❌'}`);
      console.log(`     Manifest: ${template.hasManifest ? '✅' : '❌'}`);
      console.log(
        `     Assets: ${template.hasAssets ? '✅' : '❌'} (${template.assetCount} files)`
      );
      console.log(`     Size: ${sizeMB} MB`);
    }
  } else {
    console.log('   ⚠️  No templates found');
  }

  // Scripts
  console.log('\n🔧 Scripts:');
  console.log(`   Download: ${status.scripts.download ? '✅' : '❌'}`);
  console.log(`   Validate: ${status.scripts.validate ? '✅' : '❌'}`);
  console.log(`   Optimize: ${status.scripts.optimize ? '✅' : '❌'}`);
  console.log(`   Pipeline: ${status.scripts.pipeline ? '✅' : '❌'}`);

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📋 Summary:');

  const validTemplates = status.templates.filter((t) => t.exists && t.hasManifest);
  console.log(`   Valid Templates: ${validTemplates.length}/${status.totalTemplates}`);
  console.log(`   Scripts Available: ${Object.values(status.scripts).filter(Boolean).length}/4`);

  if (validTemplates.length === status.totalTemplates && validTemplates.length > 0) {
    console.log('\n   ✅ All templates are valid!');
  } else if (validTemplates.length === 0) {
    console.log('\n   ⚠️  No valid templates found. Run: pnpm templates:download');
  } else {
    console.log('\n   ⚠️  Some templates need attention.');
  }

  console.log('='.repeat(70) + '\n');
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const status = getProjectStatus();
  generateReport(status);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { getProjectStatus, generateReport };
