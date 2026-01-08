import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface ValidationResult {
  name: string;
  success: boolean;
  error?: string;
  duration?: number;
}

const results: ValidationResult[] = [];

function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step: string, phase: string): void {
  log(`\n[${phase}] ${step}`, 'cyan');
}

function runCommand(
  command: string,
  cwd?: string
): { success: boolean; output: string; error?: string } {
  try {
    const startTime = Date.now();
    const output = execSync(command, {
      cwd: cwd || rootDir,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    const duration = Date.now() - startTime;
    return { success: true, output, duration };
  } catch (error: any) {
    return {
      success: false,
      output: error.stdout?.toString() || '',
      error: error.stderr?.toString() || error.message,
    };
  }
}

function validateTypeScript(): ValidationResult {
  logStep('TypeScript-Fehlerprüfung', 'Phase 1');
  const startTime = Date.now();

  try {
    // Check base config
    const baseConfigPath = join(rootDir, 'tsconfig.base.json');
    if (!existsSync(baseConfigPath)) {
      return {
        name: 'TypeScript Config',
        success: false,
        error: 'tsconfig.base.json not found',
      };
    }

    const baseConfig = JSON.parse(readFileSync(baseConfigPath, 'utf-8'));
    const requiredOptions = [
      'strict',
      'noUnusedLocals',
      'noUnusedParameters',
      'noImplicitReturns',
      'noUncheckedIndexedAccess',
      'noImplicitOverride',
    ];

    const missingOptions: string[] = [];
    for (const option of requiredOptions) {
      if (baseConfig.compilerOptions?.[option] !== true) {
        missingOptions.push(option);
      }
    }

    if (missingOptions.length > 0) {
      return {
        name: 'TypeScript Config',
        success: false,
        error: `Missing required options: ${missingOptions.join(', ')}`,
      };
    }

    // Run typecheck for all packages
    log('  Running typecheck for all packages...', 'blue');
    const typecheckResult = runCommand('pnpm typecheck');

    if (!typecheckResult.success) {
      return {
        name: 'TypeScript Typecheck',
        success: false,
        error: typecheckResult.error || 'Typecheck failed',
        duration: Date.now() - startTime,
      };
    }

    log('  ✓ TypeScript typecheck passed', 'green');
    return {
      name: 'TypeScript',
      success: true,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      name: 'TypeScript',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

function validateESLint(): ValidationResult {
  logStep('ESLint-Fehlerprüfung', 'Phase 2');
  const startTime = Date.now();

  try {
    // Check ESLint config exists
    const eslintConfigPath = join(rootDir, 'packages/eslint-config/eslint.config.js');
    if (!existsSync(eslintConfigPath)) {
      return {
        name: 'ESLint Config',
        success: false,
        error: 'ESLint config not found',
      };
    }

    // Run lint for all packages
    log('  Running lint for all packages...', 'blue');
    const lintResult = runCommand('pnpm lint');

    if (!lintResult.success) {
      return {
        name: 'ESLint',
        success: false,
        error: lintResult.error || 'Lint failed',
        duration: Date.now() - startTime,
      };
    }

    // Check Prettier formatting
    log('  Checking Prettier formatting...', 'blue');
    const formatResult = runCommand('pnpm format:check');

    if (!formatResult.success) {
      return {
        name: 'Prettier',
        success: false,
        error: 'Formatting check failed. Run "pnpm format" to fix.',
        duration: Date.now() - startTime,
      };
    }

    log('  ✓ ESLint and Prettier checks passed', 'green');
    return {
      name: 'ESLint',
      success: true,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      name: 'ESLint',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

function validateBuilds(): ValidationResult {
  logStep('Build-Validierung', 'Phase 3');
  const startTime = Date.now();

  try {
    // Clean first to ensure fresh build
    log('  Cleaning previous builds...', 'blue');
    runCommand('pnpm clean');

    // Build all packages
    log('  Building all packages...', 'blue');
    const buildResult = runCommand('pnpm build');

    if (!buildResult.success) {
      return {
        name: 'Build',
        success: false,
        error: buildResult.error || 'Build failed',
        duration: Date.now() - startTime,
      };
    }

    // Check build outputs
    const packages = [
      'packages/core',
      'packages/ui',
      'packages/avatars',
      'packages/voice',
      'packages/audio',
      'packages/net',
      'packages/ai',
      'packages/content',
      'packages/xr',
      'packages/environment',
      'packages/interactions',
      'packages/moderation',
      'packages/navigation',
      'packages/whiteboard',
      'packages/collab',
    ];

    const missingOutputs: string[] = [];
    for (const pkg of packages) {
      const distPath = join(rootDir, pkg, 'dist');
      if (!existsSync(distPath)) {
        missingOutputs.push(pkg);
      } else {
        const files = readdirSync(distPath);
        if (files.length === 0) {
          missingOutputs.push(pkg);
        }
      }
    }

    // Check apps
    const webDistPath = join(rootDir, 'apps/web/dist');
    const serverDistPath = join(rootDir, 'apps/server/dist');

    if (!existsSync(webDistPath)) {
      missingOutputs.push('apps/web');
    }
    if (!existsSync(serverDistPath)) {
      missingOutputs.push('apps/server');
    }

    if (missingOutputs.length > 0) {
      return {
        name: 'Build Outputs',
        success: false,
        error: `Missing build outputs: ${missingOutputs.join(', ')}`,
        duration: Date.now() - startTime,
      };
    }

    log('  ✓ All builds successful', 'green');
    return {
      name: 'Build',
      success: true,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      name: 'Build',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

function validateTests(): ValidationResult {
  logStep('Test-Validierung', 'Phase 4');
  const startTime = Date.now();

  try {
    // Run unit tests
    log('  Running unit tests...', 'blue');
    const testResult = runCommand('pnpm test');

    if (!testResult.success) {
      return {
        name: 'Unit Tests',
        success: false,
        error: testResult.error || 'Unit tests failed',
        duration: Date.now() - startTime,
      };
    }

    log('  ✓ Unit tests passed', 'green');
    return {
      name: 'Tests',
      success: true,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      name: 'Tests',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

function validateDependencies(): ValidationResult {
  logStep('Dependency-Validierung', 'Phase 5');
  const startTime = Date.now();

  try {
    // Check pnpm-lock.yaml exists
    const lockPath = join(rootDir, 'pnpm-lock.yaml');
    if (!existsSync(lockPath)) {
      return {
        name: 'Dependencies',
        success: false,
        error: 'pnpm-lock.yaml not found',
      };
    }

    // Try frozen lockfile install to check for inconsistencies
    log('  Checking dependency consistency...', 'blue');
    const installResult = runCommand('pnpm install --frozen-lockfile');

    if (!installResult.success) {
      return {
        name: 'Dependencies',
        success: false,
        error: 'Dependency lockfile is inconsistent',
        duration: Date.now() - startTime,
      };
    }

    // Check for circular dependencies (basic check)
    const packageJsonPath = join(rootDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    log('  ✓ Dependencies valid', 'green');
    return {
      name: 'Dependencies',
      success: true,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      name: 'Dependencies',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

function validateAssets(): ValidationResult {
  logStep('Asset-Validierung', 'Phase 6');
  const startTime = Date.now();

  try {
    // Check templates
    const templatesPath = join(rootDir, 'packages/assets/templates');
    if (!existsSync(templatesPath)) {
      return {
        name: 'Assets',
        success: false,
        error: 'Templates directory not found',
      };
    }

    // Check decoder files
    const dracoPath = join(rootDir, 'apps/web/public/draco');
    const ktx2Path = join(rootDir, 'apps/web/public/ktx2');

    const missingAssets: string[] = [];
    if (!existsSync(dracoPath)) {
      missingAssets.push('Draco decoders');
    }
    if (!existsSync(ktx2Path)) {
      missingAssets.push('KTX2 decoders');
    }

    if (missingAssets.length > 0) {
      log(`  Warning: Missing assets: ${missingAssets.join(', ')}`, 'yellow');
      log('  Run "pnpm setup:decoders" to fix', 'yellow');
    }

    // Validate templates if script exists
    const validateScript = join(rootDir, 'scripts/validate-templates.ts');
    if (existsSync(validateScript)) {
      log('  Validating templates...', 'blue');
      const validateResult = runCommand('pnpm templates:validate');
      if (!validateResult.success) {
        return {
          name: 'Assets',
          success: false,
          error: 'Template validation failed',
          duration: Date.now() - startTime,
        };
      }
    }

    log('  ✓ Assets validated', 'green');
    return {
      name: 'Assets',
      success: true,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      name: 'Assets',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

function validateEnvironment(): ValidationResult {
  logStep('Environment-Validierung', 'Phase 7');
  const startTime = Date.now();

  try {
    // Check .env.example exists
    const envExamplePath = join(rootDir, '.env.example');
    if (!existsSync(envExamplePath)) {
      return {
        name: 'Environment',
        success: false,
        error: '.env.example not found',
      };
    }

    // Check FeatureFlags.ts exists
    const featureFlagsPath = join(rootDir, 'apps/web/src/FeatureFlags.ts');
    if (!existsSync(featureFlagsPath)) {
      return {
        name: 'Environment',
        success: false,
        error: 'FeatureFlags.ts not found',
      };
    }

    log('  ✓ Environment configuration valid', 'green');
    return {
      name: 'Environment',
      success: true,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      name: 'Environment',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

function validateCI(): ValidationResult {
  logStep('CI/CD-Validierung', 'Phase 8');
  const startTime = Date.now();

  try {
    // Check GitHub Actions workflow
    const workflowPath = join(rootDir, '.github/workflows/ci.yml');
    if (!existsSync(workflowPath)) {
      return {
        name: 'CI/CD',
        success: false,
        error: 'CI workflow not found',
      };
    }

    const workflowContent = readFileSync(workflowPath, 'utf-8');
    // Check for job names (case-insensitive, with variations)
    const requiredJobs = [
      { name: 'lint', patterns: ['name: Lint', 'name: lint'] },
      { name: 'typecheck', patterns: ['name: TypeCheck', 'name: typecheck', 'name: Typecheck'] },
      { name: 'test', patterns: ['name: Test', 'name: test'] },
      { name: 'build', patterns: ['name: Build', 'name: build'] },
      { name: 'e2e', patterns: ['name: E2E Tests', 'name: E2E', 'name: e2e'] },
    ];
    const missingJobs: string[] = [];

    for (const job of requiredJobs) {
      const found = job.patterns.some((pattern) => workflowContent.includes(pattern));
      if (!found) {
        missingJobs.push(job.name);
      }
    }

    if (missingJobs.length > 0) {
      return {
        name: 'CI/CD',
        success: false,
        error: `Missing CI jobs: ${missingJobs.join(', ')}`,
        duration: Date.now() - startTime,
      };
    }

    log('  ✓ CI/CD workflow valid', 'green');
    return {
      name: 'CI/CD',
      success: true,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      name: 'CI/CD',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

function validateProduction(): ValidationResult {
  logStep('Production-Build-Test', 'Phase 9');
  const startTime = Date.now();

  try {
    // Check if build was successful (should be done in Phase 3)
    const webDistPath = join(rootDir, 'apps/web/dist');
    if (!existsSync(webDistPath)) {
      return {
        name: 'Production Build',
        success: false,
        error: 'Production build not found. Run build first.',
        duration: Date.now() - startTime,
      };
    }

    // Check for production-specific files
    const indexHtmlPath = join(webDistPath, 'index.html');
    if (!existsSync(indexHtmlPath)) {
      return {
        name: 'Production Build',
        success: false,
        error: 'Production build incomplete',
        duration: Date.now() - startTime,
      };
    }

    log('  ✓ Production build valid', 'green');
    return {
      name: 'Production Build',
      success: true,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      name: 'Production Build',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const phase = args[0] || 'all';

  log('\n' + '='.repeat(60), 'bright');
  log('Build-Fehlerprüfung & Validierung', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  const allPhases = [
    { name: 'typescript', fn: validateTypeScript },
    { name: 'eslint', fn: validateESLint },
    { name: 'builds', fn: validateBuilds },
    { name: 'tests', fn: validateTests },
    { name: 'dependencies', fn: validateDependencies },
    { name: 'assets', fn: validateAssets },
    { name: 'env', fn: validateEnvironment },
    { name: 'ci', fn: validateCI },
    { name: 'production', fn: validateProduction },
  ];

  let phasesToRun = allPhases;
  if (phase !== 'all') {
    const phaseMap: Record<string, (typeof allPhases)[number]> = {
      types: allPhases[0],
      lint: allPhases[1],
      build: allPhases[2],
      test: allPhases[3],
      deps: allPhases[4],
      assets: allPhases[5],
      env: allPhases[6],
      ci: allPhases[7],
      prod: allPhases[8],
    };

    const selectedPhase = phaseMap[phase];
    if (!selectedPhase) {
      log(`Unknown phase: ${phase}`, 'red');
      log('Available phases: types, lint, build, test, deps, assets, env, ci, prod, all', 'yellow');
      process.exit(1);
    }
    phasesToRun = [selectedPhase];
  }

  for (const { name, fn } of phasesToRun) {
    const result = fn();
    results.push(result);

    if (result.success) {
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      log(`✓ ${result.name} passed${duration}`, 'green');
    } else {
      log(`✗ ${result.name} failed`, 'red');
      if (result.error) {
        log(`  Error: ${result.error}`, 'red');
      }
    }
  }

  // Summary
  log('\n' + '='.repeat(60), 'bright');
  log('Zusammenfassung', 'bright');
  log('='.repeat(60), 'bright');

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  log(
    `\nErfolgreich: ${successful.length}/${results.length}`,
    successful.length === results.length ? 'green' : 'yellow'
  );
  if (failed.length > 0) {
    log(`Fehlgeschlagen: ${failed.length}`, 'red');
    failed.forEach((r) => {
      log(`  - ${r.name}: ${r.error || 'Unknown error'}`, 'red');
    });
  }

  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
  log(`\nGesamtdauer: ${totalDuration}ms`, 'cyan');

  if (failed.length > 0) {
    log('\n❌ Validierung fehlgeschlagen', 'red');
    process.exit(1);
  } else {
    log('\n✅ Alle Validierungen erfolgreich', 'green');
    process.exit(0);
  }
}

main().catch((error) => {
  log(`\n❌ Unerwarteter Fehler: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
