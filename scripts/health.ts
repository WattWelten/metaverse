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
  rendering: {
    toneMapping: string;
    colorSpace: string;
    physicallyCorrect: boolean;
    exposure: boolean;
  };
  flags: Record<string, boolean | string>;
  ci: { workflows: string[]; status: 'ok' | 'missing' };
  docs: { files: string[]; coverage: number };
  env?: { exampleExists: boolean };
  scripts?: { importAssets: boolean; generateAttribution: boolean };
  features?: {
    lodSupport: boolean;
    usesCreateGLTFLoader: boolean;
    decoders: { draco: boolean; ktx2: boolean };
    xrAdapter: { exists: boolean; type: 'three' | 'verse' | 'none' };
  };
  collaboration?: {
    voiceProvider: boolean;
    liveKitProvider: boolean;
    whiteboardClient: boolean;
    pinboard: boolean;
    roomUtils: boolean;
    serverTokenEndpoint: boolean;
  };
  templates?: {
    wattEco: boolean;
    wattDefault: boolean;
    fallbackLogic: boolean;
  };
  envLocal?: {
    exists: boolean;
    templateId: string | null;
  };
  decoders?: {
    dracoFiles: boolean;
    ktx2Files: boolean;
  };
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

async function checkRendering(): Promise<{
  toneMapping: string;
  colorSpace: string;
  physicallyCorrect: boolean;
  exposure: boolean;
}> {
  // Check World.ts for rendering config using TypeScript Compiler API for property-based checks
  const worldPath = join(rootDir, 'apps/web/src/World.ts');
  if (!existsSync(worldPath)) {
    return {
      toneMapping: 'unknown',
      colorSpace: 'unknown',
      physicallyCorrect: false,
      exposure: false,
    };
  }

  try {
    // Use TypeScript Compiler API for property-based analysis
    // Dynamic import for ES modules
    const ts = await import('typescript').then((m) => m.default || m);
    const worldContent = readFileSync(worldPath, 'utf-8');
    const sourceFile = ts.createSourceFile(worldPath, worldContent, ts.ScriptTarget.Latest, true);

    let hasACES = false;
    let hasSRGB = false;
    let hasPhysicallyCorrect = false;
    let hasExposure = false;

    // Traverse AST to find property assignments
    function visit(node: any): void {
      // Check for property assignments: this.renderer.toneMapping = ACESFilmicToneMapping
      // or renderer.toneMapping = ACESFilmicToneMapping
      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isPropertyAccessExpression(node.left)
      ) {
        const propName = node.left.name?.text;
        const rightText = sourceFile.text.substring(node.right.pos, node.right.end);

        // Check if left side is this.renderer.property or renderer.property
        const leftText = sourceFile.text.substring(node.left.pos, node.left.end);
        const isRendererProperty =
          leftText.includes('renderer.') || leftText.includes('this.renderer.');

        if (isRendererProperty) {
          if (propName === 'toneMapping') {
            if (rightText.includes('ACESFilmicToneMapping')) {
              hasACES = true;
            }
          } else if (propName === 'outputColorSpace') {
            if (
              rightText.includes("'srgb'") ||
              rightText.includes('"srgb"') ||
              rightText.includes('SRGBColorSpace')
            ) {
              hasSRGB = true;
            }
          } else if (propName === 'toneMappingExposure') {
            // Check for exposure = 1.0 or exposure = 1
            // rightText contains the right-hand side expression (e.g., "1.0" or "1")
            const trimmed = rightText.trim();
            const value = parseFloat(trimmed);
            if (!isNaN(value) && (value === 1.0 || value === 1)) {
              hasExposure = true;
            }
          }
        }
      }

      // Check for function calls: setPhysicallyCorrectLights(renderer)
      if (ts.isCallExpression(node)) {
        const callText = sourceFile.text.substring(node.pos, node.end);
        if (callText.includes('setPhysicallyCorrectLights')) {
          hasPhysicallyCorrect = true;
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    return {
      toneMapping: hasACES ? 'ACESFilmic' : 'unknown',
      colorSpace: hasSRGB ? 'srgb' : 'unknown',
      physicallyCorrect: hasPhysicallyCorrect,
      exposure: hasExposure,
    };
  } catch (error) {
    // Fallback to regex-based checks if TypeScript API fails
    console.warn('TypeScript API check failed, falling back to regex:', error);
    const worldContent = readFileSync(worldPath, 'utf-8');

    const hasACES = /toneMapping\s*=\s*ACESFilmicToneMapping/.test(worldContent);
    const hasSRGB = /outputColorSpace\s*=\s*(SRGBColorSpace|'srgb'|"srgb")/.test(worldContent);
    const hasPhysicallyCorrect =
      /setPhysicallyCorrectLights\s*\(/.test(worldContent) ||
      /useLegacyLights\s*=\s*false/.test(worldContent) ||
      /physicallyCorrectLights\s*=\s*true/.test(worldContent);
    const hasExposure = /toneMappingExposure\s*=\s*1(\.0)?/.test(worldContent);

    return {
      toneMapping: hasACES ? 'ACESFilmic' : 'unknown',
      colorSpace: hasSRGB ? 'srgb' : 'unknown',
      physicallyCorrect: hasPhysicallyCorrect,
      exposure: hasExposure,
    };
  }
}

function checkFlags(): Record<string, boolean | string> {
  const envExamplePath = join(rootDir, '.env.example');
  const envLocalPath = join(rootDir, '.env.local');
  const flags: Record<string, boolean | string> = {};

  // Check .env.local first (takes precedence), fallback to .env.example
  const envPath = existsSync(envLocalPath) ? envLocalPath : envExamplePath;

  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    const matches = content.matchAll(/VITE_(\w+)=(.*)/g);
    for (const match of matches) {
      const key = match[1];
      const value = match[2].trim();
      flags[key] = value === 'true' ? true : value === 'false' ? false : value;
    }
  }

  // Explicitly check for collab flags
  const collabFlags = ['VOICE_ENABLED', 'LIVEKIT_URL', 'WHITEBOARD_ENABLED', 'YWS_URL'];
  for (const flag of collabFlags) {
    if (!(flag in flags)) {
      flags[flag] = false;
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

function checkCollaboration(): {
  voiceProvider: boolean;
  liveKitProvider: boolean;
  whiteboardClient: boolean;
  pinboard: boolean;
  roomUtils: boolean;
  serverTokenEndpoint: boolean;
} {
  const voiceProviderPath = join(rootDir, 'packages/voice/src/providers/IVoiceProvider.ts');
  const liveKitProviderPath = join(rootDir, 'packages/voice/src/providers/LiveKitProvider.ts');
  const whiteboardClientPath = join(rootDir, 'packages/whiteboard/src/WhiteboardClient.ts');
  const pinboardPath = join(rootDir, 'apps/web/src/ui/Pinboard.tsx');
  const roomUtilsPath = join(rootDir, 'apps/web/src/rooms.ts');
  const serverPath = join(rootDir, 'apps/server/src/server.ts');

  let serverTokenEndpoint = false;
  if (existsSync(serverPath)) {
    const serverContent = readFileSync(serverPath, 'utf-8');
    serverTokenEndpoint = /\/voice\/token/.test(serverContent);
  }

  return {
    voiceProvider: existsSync(voiceProviderPath),
    liveKitProvider: existsSync(liveKitProviderPath),
    whiteboardClient: existsSync(whiteboardClientPath),
    pinboard: existsSync(pinboardPath),
    roomUtils: existsSync(roomUtilsPath),
    serverTokenEndpoint,
  };
}

function checkTemplates(): {
  wattEco: boolean;
  wattDefault: boolean;
  fallbackLogic: boolean;
} {
  const wattEcoPath = join(rootDir, 'packages/assets/templates/watt-eco/manifest.json');
  const wattDefaultPath = join(rootDir, 'packages/assets/templates/watt-default/manifest.json');
  const templateHostPath = join(rootDir, 'apps/web/src/TemplateHost.ts');
  const templateRegistryPath = join(rootDir, 'packages/core/src/scene/TemplateRegistry.ts');

  let wattEco = false;
  let wattDefault = false;

  if (existsSync(wattEcoPath)) {
    try {
      const manifest = JSON.parse(readFileSync(wattEcoPath, 'utf-8'));
      wattEco = manifest.id === 'watt-eco' && typeof manifest.name === 'string';
    } catch {
      wattEco = false;
    }
  }

  if (existsSync(wattDefaultPath)) {
    try {
      const manifest = JSON.parse(readFileSync(wattDefaultPath, 'utf-8'));
      wattDefault = manifest.id === 'watt-default' && typeof manifest.name === 'string';
    } catch {
      wattDefault = false;
    }
  }

  let fallbackLogic = false;
  if (existsSync(templateHostPath)) {
    const content = readFileSync(templateHostPath, 'utf-8');
    fallbackLogic = /watt-default/.test(content) && /fallback/i.test(content);
  }
  if (!fallbackLogic && existsSync(templateRegistryPath)) {
    const content = readFileSync(templateRegistryPath, 'utf-8');
    fallbackLogic = /watt-default/.test(content) && /fallback/i.test(content);
  }

  return {
    wattEco,
    wattDefault,
    fallbackLogic,
  };
}

function checkEnvLocal(): {
  exists: boolean;
  templateId: string | null;
} {
  const envLocalPath = join(rootDir, '.env.local');
  if (!existsSync(envLocalPath)) {
    return { exists: false, templateId: null };
  }

  const content = readFileSync(envLocalPath, 'utf-8');
  const templateIdMatch = content.match(/VITE_TEMPLATE_ID=(.+)/);
  const templateId = templateIdMatch ? templateIdMatch[1].trim() : null;

  return {
    exists: true,
    templateId,
  };
}

function checkDecoderFiles(): {
  dracoFiles: boolean;
  ktx2Files: boolean;
} {
  const dracoDir = join(rootDir, 'apps/web/public/draco');
  const ktx2Dir = join(rootDir, 'apps/web/public/ktx2');

  let dracoFiles = false;
  let ktx2Files = false;

  if (existsSync(dracoDir)) {
    const files = readdirSync(dracoDir);
    dracoFiles = files.some((f) => f.endsWith('.js') || f.endsWith('.wasm'));
  }

  if (existsSync(ktx2Dir)) {
    const files = readdirSync(ktx2Dir);
    ktx2Files = files.some((f) => f.endsWith('.js') || f.endsWith('.wasm'));
  }

  return {
    dracoFiles,
    ktx2Files,
  };
}

async function main(): Promise<void> {
  const rootPackageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'));
  const webPackageJson = JSON.parse(readFileSync(join(rootDir, 'apps/web/package.json'), 'utf-8'));

  const renderingCheck = await checkRendering();

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
    rendering: renderingCheck,
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
- Tone Mapping: ${report.rendering.toneMapping} ${report.rendering.toneMapping === 'ACESFilmic' ? '✅' : '❌'}
- Color Space: ${report.rendering.colorSpace} ${report.rendering.colorSpace === 'srgb' ? '✅' : '❌'}
- Tone Mapping Exposure: ${report.rendering.exposure ? '1.0 ✅' : 'unknown ❌'}
- Physically Correct Lights: ${report.rendering.physicallyCorrect ? '✅' : '❌'}

**Note:** Rendering checks use TypeScript Compiler API for property-based analysis instead of regex.

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

  // Check for decoder directories
  const dracoDir = join(rootDir, 'apps', 'web', 'public', 'draco');
  const ktx2Dir = join(rootDir, 'apps', 'web', 'public', 'ktx2');
  const dracoExists = existsSync(dracoDir);
  const ktx2Exists = existsSync(ktx2Dir);

  // Check for XR adapter and determine type
  const xrAdapterPath = join(rootDir, 'packages', 'xr', 'src', 'createXR.ts');
  const xrAdapterExists = existsSync(xrAdapterPath);
  let xrAdapterType: 'three' | 'verse' | 'none' = 'none';
  if (xrAdapterExists) {
    const threeXRPath = join(rootDir, 'packages', 'xr', 'src', 'ThreeXRAdapter.ts');
    const verseXRPath = join(rootDir, 'packages', 'xr', 'src', 'VerseXRAdapter.ts');
    if (existsSync(threeXRPath) && existsSync(verseXRPath)) {
      xrAdapterType = 'three'; // Default, Verse is stub
    } else if (existsSync(threeXRPath)) {
      xrAdapterType = 'three';
    }
  }

  report.features = {
    lodSupport,
    usesCreateGLTFLoader,
    decoders: {
      draco: dracoExists,
      ktx2: ktx2Exists,
    },
    xrAdapter: {
      exists: xrAdapterExists,
      type: xrAdapterType,
    },
  };

  // Check collaboration components
  report.collaboration = checkCollaboration();

  // Check templates
  report.templates = checkTemplates();

  // Check .env.local
  report.envLocal = checkEnvLocal();

  // Check decoder files
  report.decoders = checkDecoderFiles();

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
- LOD Support: ${report.features?.lodSupport ? '✅' : '❌'}
- Uses createGLTFLoader: ${report.features?.usesCreateGLTFLoader ? '✅' : '❌'}
- Decoder Directories:
  - Draco: ${report.features?.decoders.draco ? '✅' : '❌'}
  - KTX2: ${report.features?.decoders.ktx2 ? '✅' : '❌'}
- XR Adapter: ${report.features?.xrAdapter.exists ? `✅ (${report.features.xrAdapter.type})` : '❌'}

## Collaboration
- Voice Provider Interface: ${report.collaboration?.voiceProvider ? '✅' : '❌'}
- LiveKit Provider: ${report.collaboration?.liveKitProvider ? '✅' : '❌'}
- Whiteboard Client: ${report.collaboration?.whiteboardClient ? '✅' : '❌'}
- Pinboard: ${report.collaboration?.pinboard ? '✅' : '❌'}
- Room Utils: ${report.collaboration?.roomUtils ? '✅' : '❌'}
- Server Token Endpoint: ${report.collaboration?.serverTokenEndpoint ? '✅' : '❌'}

## Templates
- watt-eco: ${report.templates?.wattEco ? '✅' : '❌'}
- watt-default: ${report.templates?.wattDefault ? '✅' : '❌'}
- Fallback Logic: ${report.templates?.fallbackLogic ? '✅' : '❌'}

## Environment (.env.local)
- Exists: ${report.envLocal?.exists ? '✅' : '❌'}
- VITE_TEMPLATE_ID: ${report.envLocal?.templateId || 'not set'}

## Decoder Files
- Draco Files: ${report.decoders?.dracoFiles ? '✅' : '❌'}
- KTX2 Files: ${report.decoders?.ktx2Files ? '✅' : '❌'}
`;

  writeFileSync(reportPath, updatedReportContent, 'utf-8');
  console.log('✅ Health report written to docs/health-report.md');
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error('Health check failed:', error);
  process.exit(1);
});
