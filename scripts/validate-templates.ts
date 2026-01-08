#!/usr/bin/env tsx

/**
 * Template Validation Script
 * Validates downloaded templates and their assets
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

interface ValidationResult {
  templateId: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    hasManifest: boolean;
    hasHDRI: boolean;
    hasModels: boolean;
    manifestSize: number;
    assetCount: number;
  };
}

/**
 * Validate template
 */
function validateTemplate(templateId: string): ValidationResult {
  const templateDir = join(rootDir, 'packages', 'assets', 'templates', templateId);
  const result: ValidationResult = {
    templateId,
    valid: true,
    errors: [],
    warnings: [],
    stats: {
      hasManifest: false,
      hasHDRI: false,
      hasModels: false,
      manifestSize: 0,
      assetCount: 0,
    },
  };

  // Check if template directory exists
  if (!existsSync(templateDir)) {
    result.valid = false;
    result.errors.push('Template directory does not exist');
    return result;
  }

  // Check manifest
  const manifestPath = join(templateDir, 'manifest.json');
  if (existsSync(manifestPath)) {
    result.stats.hasManifest = true;
    try {
      const manifestContent = readFileSync(manifestPath, 'utf-8');
      result.stats.manifestSize = manifestContent.length;
      const manifest = JSON.parse(manifestContent);

      // Validate manifest structure
      if (!manifest.id) result.errors.push('Manifest missing id');
      if (!manifest.name) result.errors.push('Manifest missing name');
      if (!manifest.version) result.warnings.push('Manifest missing version');
    } catch (error) {
      result.valid = false;
      result.errors.push(`Invalid manifest JSON: ${error}`);
    }
  } else {
    result.errors.push('Manifest not found');
  }

  // Check assets
  const assetsDir = join(templateDir, 'assets');
  if (existsSync(assetsDir)) {
    // Check HDRI
    const hdriDir = join(assetsDir, 'hdri');
    if (existsSync(hdriDir)) {
      const hdriFiles = readdirSync(hdriDir).filter((f) => f.endsWith('.hdr'));
      if (hdriFiles.length > 0) {
        result.stats.hasHDRI = true;
        result.stats.assetCount += hdriFiles.length;
      } else {
        result.warnings.push('HDRI directory exists but no HDRI files found');
      }
    }

    // Check models
    const modelsDir = join(assetsDir, 'models');
    if (existsSync(modelsDir)) {
      const modelFiles = readdirSync(modelsDir).filter(
        (f) => f.endsWith('.glb') || f.endsWith('.gltf') || f.endsWith('.fbx')
      );
      if (modelFiles.length > 0) {
        result.stats.hasModels = true;
        result.stats.assetCount += modelFiles.length;
      } else {
        result.warnings.push('Models directory exists but no model files found');
      }
    }
  } else {
    result.warnings.push('Assets directory not found');
  }

  if (result.errors.length > 0) {
    result.valid = false;
  }

  return result;
}

/**
 * Validate all templates
 */
function validateAllTemplates(): ValidationResult[] {
  const templatesDir = join(rootDir, 'packages', 'assets', 'templates');

  if (!existsSync(templatesDir)) {
    console.error('Templates directory not found');
    return [];
  }

  const templates = readdirSync(templatesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  console.log(`🔍 Validating ${templates.length} templates...\n`);

  const results = templates.map((templateId) => validateTemplate(templateId));

  return results;
}

/**
 * Generate validation report
 */
function generateReport(results: ValidationResult[]): void {
  console.log('\n📋 Validation Report\n');
  console.log('='.repeat(70));

  const valid = results.filter((r) => r.valid);
  const invalid = results.filter((r) => !r.valid);

  console.log(`Total Templates: ${results.length}`);
  console.log(`✅ Valid: ${valid.length}`);
  console.log(`❌ Invalid: ${invalid.length}`);

  if (valid.length > 0) {
    console.log('\n✅ Valid Templates:');
    valid.forEach((r) => {
      console.log(`  - ${r.templateId}`);
      console.log(`    Manifest: ${r.stats.hasManifest ? '✅' : '❌'}`);
      console.log(`    HDRI: ${r.stats.hasHDRI ? '✅' : '⚠️'}`);
      console.log(`    Models: ${r.stats.hasModels ? '✅' : '⚠️'}`);
      console.log(`    Assets: ${r.stats.assetCount}`);
      if (r.warnings.length > 0) {
        r.warnings.forEach((w) => console.log(`    ⚠️  ${w}`));
      }
    });
  }

  if (invalid.length > 0) {
    console.log('\n❌ Invalid Templates:');
    invalid.forEach((r) => {
      console.log(`  - ${r.templateId}`);
      r.errors.forEach((e) => console.log(`    ❌ ${e}`));
      if (r.warnings.length > 0) {
        r.warnings.forEach((w) => console.log(`    ⚠️  ${w}`));
      }
    });
  }

  console.log('='.repeat(70));
}

/**
 * Main validation function
 */
async function main(): Promise<void> {
  console.log('🔍 Starting Template Validation...\n');

  const results = validateAllTemplates();
  generateReport(results);

  const allValid = results.every((r) => r.valid);
  if (allValid) {
    console.log('\n🎉 All templates are valid!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some templates have issues. Please review the report above.');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { validateTemplate, validateAllTemplates };
