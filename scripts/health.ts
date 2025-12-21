import { readFileSync, existsSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

interface HealthReport {
  runtimes: { node: string; pnpm: string; three: string };
  packages: { total: number; warnings: string[] };
  structure: { valid: boolean; missing: string[] };
  rendering: { toneMapping: string; colorSpace: string; physicallyCorrect: boolean };
  flags: Record<string, boolean | string>;
  ci: { workflows: string[]; status: 'ok' | 'missing' };
  docs: { files: string[]; coverage: number };
  env?: { exampleExists: boolean };
  scripts?: { importAssets: boolean; generateAttribution: boolean };
  features?: { lodSupport: boolean };
}

function getPackageVersion(packageJson: Record<string, unknown>, name: string): string {
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies } as Record<
    string,
    string
  >;
  return deps[name] || 'not found';
}

function checkStructure(): { valid: boolean; missing: string[] } {
  const required = [
    'package.json',
    'tsconfig.base.json',
    'apps/web',
    'apps/server',
    'packages/core',
    'packages/assets/templates',
  ];
  const missing: string[] = [];

  for (const path of required) {
    if (!existsSync(join(rootDir, path))) {
      missing.push(path);
    }
  }

  return { valid: missing.length === 0, missing };
}

function checkRendering(): { toneMapping: string; colorSpace: string; physicallyCorrect: boolean } {
  // Check World.ts for rendering config
  const worldPath = join(rootDir, 'apps/web/src/World.ts');
  if (!existsSync(worldPath)) {
    return { toneMapping: 'unknown', colorSpace: 'unknown', physicallyCorrect: false };
  }

  const worldContent = readFileSync(worldPath, 'utf-8');

  // Check for ACES tone mapping
  const hasACES = /toneMapping\s*=\s*ACESFilmicToneMapping/.test(worldContent);

  // Check for sRGB color space (supports both 'srgb' string and SRGBColorSpace enum)
  const hasSRGB = /outputColorSpace\s*=\s*(SRGBColorSpace|'srgb'|"srgb")/.test(worldContent);

  // Check for physically correct lights
  // Look for setPhysicallyCorrectLights call or explicit useLegacyLights = false
  const hasPhysicallyCorrect =
    /setPhysicallyCorrectLights\s*\(/.test(worldContent) ||
    /useLegacyLights\s*=\s*false/.test(worldContent) ||
    /physicallyCorrectLights\s*=\s*true/.test(worldContent);

  // Also check exposure
  const hasExposure = /toneMappingExposure\s*=\s*1(\.0)?/.test(worldContent);

  return {
    toneMapping: hasACES ? 'ACESFilmic' : 'unknown',
    colorSpace: hasSRGB ? 'srgb' : 'unknown',
    physicallyCorrect: hasPhysicallyCorrect,
  };
}

function checkFlags(): Record<string, boolean | string> {
  const envExamplePath = join(rootDir, '.env.example');
  const flags: Record<string, boolean | string> = {};

  if (existsSync(envExamplePath)) {
    const content = readFileSync(envExamplePath, 'utf-8');
    const matches = content.matchAll(/VITE_(\w+)=(.*)/g);
    for (const match of matches) {
      const key = match[1];
      const value = match[2].trim();
      flags[key] = value === 'true' ? true : value === 'false' ? false : value;
    }
  }

  return flags;
}

function checkCI(): { workflows: string[]; status: 'ok' | 'missing' } {
  const workflowsDir = join(rootDir, '.github/workflows');
  const workflows: string[] = [];

  if (existsSync(workflowsDir)) {
    const files = readdirSync(workflowsDir);
    workflows.push(...files.filter((f) => f.endsWith('.yml') || f.endsWith('.yaml')));
  }

  return {
    workflows,
    status: workflows.length > 0 ? 'ok' : 'missing',
  };
}

function checkDocs(): { files: string[]; coverage: number } {
  const docsDir = join(rootDir, 'docs');
  const expectedDocs = [
    'README.md',
    'templates.md',
    'architecture.md',
    'template-watt-eco.md',
    'assets-shopping.md',
    'TASK_LOG.md',
    'health-report.md',
  ];

  const files: string[] = [];
  if (existsSync(docsDir)) {
    const existing = readdirSync(docsDir);
    files.push(...existing.filter((f) => f.endsWith('.md')));
  }

  const coverage = (files.length / expectedDocs.length) * 100;

  return { files, coverage: Math.round(coverage) };
}

function main(): void {
  const rootPackageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'));
  const webPackageJson = JSON.parse(readFileSync(join(rootDir, 'apps/web/package.json'), 'utf-8'));

  const report: HealthReport = {
    runtimes: {
      node: process.version,
      pnpm: rootPackageJson.packageManager || 'unknown',
      three: getPackageVersion(webPackageJson, 'three'),
    },
    packages: {
      total: Object.keys({ ...rootPackageJson.dependencies, ...rootPackageJson.devDependencies })
        .length,
      warnings: [],
    },
    structure: checkStructure(),
    rendering: checkRendering(),
    flags: checkFlags(),
    ci: checkCI(),
    docs: checkDocs(),
  };

  // Additional checks - will be used later in report

  // Write report
  const reportPath = join(rootDir, 'docs/health-report.md');
  const reportContent = `# Health Report

Generated: ${new Date().toISOString()}

## Runtimes
- Node: ${report.runtimes.node}
- pnpm: ${report.runtimes.pnpm}
- Three.js: ${report.runtimes.three}

## Packages
- Total dependencies: ${report.packages.total}
- Warnings: ${report.packages.warnings.length > 0 ? report.packages.warnings.join(', ') : 'none'}

## Structure
- Valid: ${report.structure.valid ? '✅' : '❌'}
- Missing: ${report.structure.missing.length > 0 ? report.structure.missing.join(', ') : 'none'}

## Rendering
- Tone Mapping: ${report.rendering.toneMapping}
- Color Space: ${report.rendering.colorSpace}
- Physically Correct Lights: ${report.rendering.physicallyCorrect ? '✅' : '❌'}

## Feature Flags
${
  Object.entries(report.flags)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n') || '- No flags found'
}

## CI/CD
- Status: ${report.ci.status === 'ok' ? '✅' : '❌'}
- Workflows: ${report.ci.workflows.length > 0 ? report.ci.workflows.join(', ') : 'none'}

## Documentation
- Files: ${report.docs.files.length}
- Coverage: ${report.docs.coverage}%
- Files: ${report.docs.files.join(', ') || 'none'}
`;

  // Check for .env.example
  const envExampleExists = existsSync(join(rootDir, '.env.example'));
  report.env = { exampleExists: envExampleExists };

  // Check for asset import scripts
  const importAssetsExists = existsSync(join(rootDir, 'scripts', 'import-assets.ts'));
  const generateAttrExists = existsSync(join(rootDir, 'scripts', 'generate-attribution.ts'));
  report.scripts = {
    importAssets: importAssetsExists,
    generateAttribution: generateAttrExists,
  };

  // Check for LOD support in TemplateHost
  const templateHostPath = join(rootDir, 'apps', 'web', 'src', 'TemplateHost.ts');
  let lodSupport = false;
  let usesCreateGLTFLoader = false;
  if (existsSync(templateHostPath)) {
    const templateHostContent = readFileSync(templateHostPath, 'utf-8');
    lodSupport = templateHostContent.includes('LOD') || templateHostContent.includes('lod');
    usesCreateGLTFLoader = templateHostContent.includes('createGLTFLoader');
  }
  report.features = { lodSupport };

  // Check for decoder directories
  const dracoDir = join(rootDir, 'apps', 'web', 'public', 'draco');
  const ktx2Dir = join(rootDir, 'apps', 'web', 'public', 'ktx2');
  const decoderDirsExist = existsSync(dracoDir) && existsSync(ktx2Dir);

  // Check for XR adapter
  const xrAdapterPath = join(rootDir, 'packages', 'xr', 'src', 'createXR.ts');
  const xrAdapterExists = existsSync(xrAdapterPath);

  // Update report content with new sections
  const updatedReportContent =
    reportContent +
    `

## Environment
- .env.example: ${envExampleExists ? '✅' : '❌'}

## Asset Scripts
- import-assets.ts: ${importAssetsExists ? '✅' : '❌'}
- generate-attribution.ts: ${generateAttrExists ? '✅' : '❌'}

## Features
- LOD Support: ${lodSupport ? '✅' : '❌'}
- Uses createGLTFLoader: ${usesCreateGLTFLoader ? '✅' : '❌'}
- Decoder Directories: ${decoderDirsExist ? '✅' : '❌'}
- XR Adapter: ${xrAdapterExists ? '✅' : '❌'}
`;

  writeFileSync(reportPath, updatedReportContent, 'utf-8');
  console.log('✅ Health report written to docs/health-report.md');
  console.log(JSON.stringify(report, null, 2));
}

main();
