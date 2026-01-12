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
    sceneSizeMB?: number;
    hasNavMesh: boolean;
    zoneCount: number;
    performanceScore: number; // 0-100
  };
}

/**
 * Find template directory (checks both locations)
 */
function findTemplateDir(templateId: string): string | null {
  // Neue Struktur: apps/web/public/templates
  const newDir = join(rootDir, 'apps', 'web', 'public', 'templates', templateId);
  if (existsSync(newDir)) {
    return newDir;
  }

  // Alte Struktur: packages/assets/templates
  const oldDir = join(rootDir, 'packages', 'assets', 'templates', templateId);
  if (existsSync(oldDir)) {
    return oldDir;
  }

  return null;
}

/**
 * Validate template
 */
function validateTemplate(templateId: string): ValidationResult {
  const templateDir = findTemplateDir(templateId);
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
      sceneSizeMB: 0,
      hasNavMesh: false,
      zoneCount: 0,
      performanceScore: 0,
    },
  };

  // Check if template directory exists
  if (!templateDir) {
    result.valid = false;
    result.errors.push(
      'Template directory does not exist (checked apps/web/public/templates and packages/assets/templates)'
    );
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

  // Check assets (neue Struktur: direkt im Template-Verzeichnis)
  const scenePath = join(templateDir, 'scene.glb');
  if (existsSync(scenePath)) {
    result.stats.hasModels = true;
    result.stats.assetCount++;
    const stats = statSync(scenePath);
    result.stats.sceneSizeMB = stats.size / (1024 * 1024);

    if (result.stats.sceneSizeMB > 50) {
      result.warnings.push(
        `Scene is large (${result.stats.sceneSizeMB.toFixed(2)}MB). Consider optimization.`
      );
    }
  } else {
    // Fallback: alte Struktur mit assets/ Verzeichnis
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
      result.warnings.push('Scene asset (scene.glb) not found');
    }
  }

  // Check HDRI (neue Struktur)
  const hdriPath = join(templateDir, 'hdri.hdr');
  if (existsSync(hdriPath)) {
    result.stats.hasHDRI = true;
    result.stats.assetCount++;
  }

  // Check NavMesh
  const navmeshPath = join(templateDir, 'navmesh.glb');
  if (existsSync(navmeshPath)) {
    result.stats.hasNavMesh = true;
    result.stats.assetCount++;
  } else {
    result.warnings.push('NavMesh not found (optional but recommended)');
  }

  // Check manifest für Zonen
  if (result.stats.hasManifest) {
    try {
      const manifestContent = readFileSync(join(templateDir, 'manifest.json'), 'utf-8');
      const manifest = JSON.parse(manifestContent);

      if (manifest.zones && Array.isArray(manifest.zones)) {
        result.stats.zoneCount = manifest.zones.length;
        if (manifest.zones.length === 0) {
          result.warnings.push('No zones defined in manifest');
        }
      }

      // Performance-Score berechnen
      result.stats.performanceScore = calculatePerformanceScore(manifest, result.stats);
    } catch {
      // Ignore JSON parse errors (bereits als Error erfasst)
    }
  }

  if (result.errors.length > 0) {
    result.valid = false;
  }

  return result;
}

/**
 * Berechne Performance-Score (0-100)
 */
function calculatePerformanceScore(manifest: any, stats: ValidationResult['stats']): number {
  let score = 100;

  // Scene-Größe
  if (stats.sceneSizeMB) {
    if (stats.sceneSizeMB > 50) score -= 30;
    else if (stats.sceneSizeMB > 30) score -= 15;
    else if (stats.sceneSizeMB > 20) score -= 5;
  }

  // Zonen
  if (stats.zoneCount === 0) score -= 10;

  // NavMesh
  if (!stats.hasNavMesh) score -= 5;

  // HDRI
  if (!stats.hasHDRI) score -= 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Validate all templates
 */
function validateAllTemplates(): ValidationResult[] {
  // Prüfe beide Template-Verzeichnisse
  const newTemplatesDir = join(rootDir, 'apps', 'web', 'public', 'templates');
  const oldTemplatesDir = join(rootDir, 'packages', 'assets', 'templates');

  const templateIds = new Set<string>();

  // Sammle Templates aus beiden Verzeichnissen
  if (existsSync(newTemplatesDir)) {
    const templates = readdirSync(newTemplatesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    templates.forEach((id) => templateIds.add(id));
  }

  if (existsSync(oldTemplatesDir)) {
    const templates = readdirSync(oldTemplatesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    templates.forEach((id) => templateIds.add(id));
  }

  if (templateIds.size === 0) {
    console.error('No templates found in apps/web/public/templates or packages/assets/templates');
    return [];
  }

  console.log(`🔍 Validating ${templateIds.size} templates...\n`);

  const results = Array.from(templateIds).map((templateId) => validateTemplate(templateId));

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
      console.log(`    NavMesh: ${r.stats.hasNavMesh ? '✅' : '⚠️'}`);
      console.log(`    Zones: ${r.stats.zoneCount}`);
      console.log(`    Assets: ${r.stats.assetCount}`);
      if (r.stats.sceneSizeMB) {
        console.log(`    Scene Size: ${r.stats.sceneSizeMB.toFixed(2)} MB`);
      }
      console.log(`    Performance Score: ${r.stats.performanceScore}/100`);
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
 * Validate single template (for CLI usage)
 */
function validateSingleTemplate(templateId: string): ValidationResult {
  const result = validateTemplate(templateId);

  console.log(`\n🔍 Validating template: ${templateId}\n`);
  console.log('='.repeat(70));

  if (result.valid) {
    console.log('✅ Template is valid');
  } else {
    console.log('❌ Template has errors');
  }

  console.log(`\n📊 Statistics:`);
  console.log(`  Manifest: ${result.stats.hasManifest ? '✅' : '❌'}`);
  console.log(`  HDRI: ${result.stats.hasHDRI ? '✅' : '⚠️'}`);
  console.log(`  Models: ${result.stats.hasModels ? '✅' : '⚠️'}`);
  console.log(`  NavMesh: ${result.stats.hasNavMesh ? '✅' : '⚠️'}`);
  console.log(`  Zones: ${result.stats.zoneCount}`);
  console.log(`  Assets: ${result.stats.assetCount}`);
  if (result.stats.sceneSizeMB) {
    console.log(`  Scene Size: ${result.stats.sceneSizeMB.toFixed(2)} MB`);
  }
  console.log(`  Performance Score: ${result.stats.performanceScore}/100`);

  if (result.errors.length > 0) {
    console.log(`\n❌ Errors:`);
    result.errors.forEach((e) => console.log(`  - ${e}`));
  }

  if (result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings:`);
    result.warnings.forEach((w) => console.log(`  - ${w}`));
  }

  console.log('='.repeat(70));

  return result;
}

/**
 * Main validation function
 */
async function main(): Promise<void> {
  const templateId = process.argv[2];

  if (templateId) {
    // Validate single template
    const result = validateSingleTemplate(templateId);
    process.exit(result.valid ? 0 : 1);
  } else {
    // Validate all templates
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
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { validateTemplate, validateAllTemplates };
