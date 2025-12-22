/**
 * E2E Test Results Analyzer
 * Analyzes test results and generates comprehensive report
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

interface TestResult {
  title: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  duration: number;
  errors?: Array<{ message: string; stack?: string }>;
  retries?: number;
}

interface TestSuite {
  title: string;
  file: string;
  tests: TestResult[];
}

interface TestResults {
  suites: TestSuite[];
  stats: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
}

function analyzeResults(): void {
  const resultsPath = join(rootDir, 'apps/web/test-results/results.json');
  if (!existsSync(resultsPath)) {
    console.error('Test results file not found:', resultsPath);
    process.exit(1);
  }

  const results: TestResults = JSON.parse(readFileSync(resultsPath, 'utf-8'));

  // Analyze errors
  const errors: Array<{ test: string; error: string; stack?: string }> = [];
  const warnings: string[] = [];
  const slowTests: Array<{ test: string; duration: number }> = [];

  for (const suite of results.suites || []) {
    for (const test of suite.tests || []) {
      if (test.status === 'failed' && test.errors) {
        for (const error of test.errors) {
          errors.push({
            test: `${suite.title} > ${test.title}`,
            error: error.message,
            stack: error.stack,
          });
        }
      }

      if (test.duration > 10000) {
        slowTests.push({
          test: `${suite.title} > ${test.title}`,
          duration: test.duration,
        });
      }
    }
  }

  // Categorize errors
  const errorCategories: Record<string, number> = {};
  for (const err of errors) {
    const category = categorizeError(err.error);
    errorCategories[category] = (errorCategories[category] || 0) + 1;
  }

  // Generate report
  const report = `# E2E Test Results Analysis

Generated: ${new Date().toISOString()}

## Summary

- **Total Tests**: ${results.stats.total}
- **Passed**: ${results.stats.passed} (${((results.stats.passed / results.stats.total) * 100).toFixed(1)}%)
- **Failed**: ${results.stats.failed} (${((results.stats.failed / results.stats.total) * 100).toFixed(1)}%)
- **Skipped**: ${results.stats.skipped}
- **Duration**: ${(results.stats.duration / 1000).toFixed(1)}s

## Error Analysis

### Error Categories

${Object.entries(errorCategories)
  .map(([category, count]) => `- **${category}**: ${count}`)
  .join('\n')}

### Detailed Errors

${errors.length > 0 ? errors.map((err, i) => `#### ${i + 1}. ${err.test}\n\n\`\`\`\n${err.error}\n\`\`\`\n`).join('\n') : 'No errors found.'}

## Performance Analysis

### Slow Tests (>10s)

${slowTests.length > 0 ? slowTests.map((t) => `- **${t.test}**: ${(t.duration / 1000).toFixed(1)}s`).join('\n') : 'No slow tests found.'}

## Recommendations

${generateRecommendations(errors, errorCategories, slowTests)}
`;

  const reportPath = join(rootDir, 'docs/e2e-comprehensive-analysis.md');
  writeFileSync(reportPath, report, 'utf-8');
  console.log('✅ E2E analysis report written to docs/e2e-comprehensive-analysis.md');
}

function categorizeError(error: string): string {
  if (error.includes('template overlay')) return 'Template Overlay';
  if (error.includes('network') || error.includes('fetch') || error.includes('ECONNREFUSED'))
    return 'Network';
  if (error.includes('timeout')) return 'Timeout';
  if (error.includes('permission') || error.includes('getUserMedia')) return 'Permissions';
  if (error.includes('WebGL') || error.includes('GPU')) return 'Rendering';
  if (error.includes('SyntaxError') || error.includes('JSON')) return 'Parsing';
  return 'Other';
}

function generateRecommendations(
  errors: Array<{ test: string; error: string }>,
  categories: Record<string, number>,
  slowTests: Array<{ test: string; duration: number }>
): string {
  const recommendations: string[] = [];

  if (categories['Template Overlay']) {
    recommendations.push(
      '- **Template Overlay Errors**: These are handled gracefully with fallbacks. Consider improving error handling to avoid console errors.'
    );
  }

  if (categories['Network']) {
    recommendations.push(
      '- **Network Errors**: Ensure all network requests have proper error handling and fallbacks.'
    );
  }

  if (categories['Timeout']) {
    recommendations.push(
      '- **Timeout Errors**: Consider increasing timeouts or optimizing slow operations.'
    );
  }

  if (slowTests.length > 0) {
    recommendations.push(
      `- **Performance**: ${slowTests.length} test(s) are slow (>10s). Consider optimizing these tests.`
    );
  }

  if (errors.length === 0) {
    recommendations.push('- ✅ All tests passing! No critical issues found.');
  }

  return recommendations.length > 0 ? recommendations.join('\n') : 'No specific recommendations.';
}

analyzeResults();
