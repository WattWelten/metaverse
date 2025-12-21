#!/usr/bin/env tsx
/**
 * Test Runner mit Progress-Updates
 * Gibt alle 5-10 Minuten ein Update aus, um zu zeigen, dass Tests noch laufen
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Konfiguration
const UPDATE_INTERVAL_MIN = process.env.TEST_UPDATE_INTERVAL
  ? parseInt(process.env.TEST_UPDATE_INTERVAL, 10)
  : 5; // Minuten zwischen Updates (Standard: 5, kann über TEST_UPDATE_INTERVAL geändert werden)
const UPDATE_INTERVAL_MS = UPDATE_INTERVAL_MIN * 60 * 1000;
const OUTPUT_CHECK_INTERVAL_MS = 10000; // Alle 10 Sekunden auf Output prüfen

// Test-Befehl (kann als Argument übergeben werden)
const testCommand = process.argv[2] || 'test';
const testArgs = process.argv.slice(3);

// Farben für Terminal-Output (ANSI)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

function log(message: string, color: keyof typeof colors = 'reset'): void {
  const timestamp = new Date().toLocaleTimeString('de-DE');
  const colorCode = colors[color] || colors.reset;
  console.log(`${colorCode}[${timestamp}] ${message}${colors.reset}`);
}

function main(): void {
  const startTime = Date.now();
  let lastUpdateTime = startTime;
  let updateInterval: NodeJS.Timeout | null = null;
  let outputCheckInterval: NodeJS.Timeout | null = null;
  let testProcess: ReturnType<typeof spawn> | null = null;
  let hasOutput = false;
  let lastOutputTime = startTime;

  // Progress-Update-Funktion
  const showProgress = (): void => {
    const elapsed = Date.now() - startTime;
    const elapsedFormatted = formatTime(elapsed);
    const timeSinceLastUpdate = Date.now() - lastUpdateTime;
    const timeSinceLastUpdateFormatted = formatTime(timeSinceLastUpdate);
    const timeSinceLastOutput = Date.now() - lastOutputTime;
    const timeSinceLastOutputFormatted = formatTime(timeSinceLastOutput);

    // Wenn es lange keinen Output gab, warnen
    if (timeSinceLastOutput > UPDATE_INTERVAL_MS * 2) {
      log(
        `⚠️ Kein Test-Output seit ${timeSinceLastOutputFormatted} - Tests könnten hängen`,
        'yellow'
      );
    }

    log(
      `⏳ Tests laufen noch... (Laufzeit: ${elapsedFormatted}, letztes Update vor: ${timeSinceLastUpdateFormatted})`,
      'cyan'
    );
    log(`   Befehl: pnpm ${testCommand} ${testArgs.join(' ') || ''}`, 'blue');

    // Detaillierter Status
    if (testProcess && testProcess.killed) {
      log(`   Status: ❌ Prozess beendet`, 'yellow');
    } else if (testProcess) {
      const timeSinceLastOutput = Date.now() - lastOutputTime;
      if (hasOutput && timeSinceLastOutput < UPDATE_INTERVAL_MS) {
        log(`   Status: ✅ Aktiv - letzter Output vor ${timeSinceLastOutputFormatted}`, 'green');
      } else if (hasOutput) {
        log(
          `   Status: ⚠️ Aktiv - aber kein Output seit ${timeSinceLastOutputFormatted}`,
          'yellow'
        );
      } else {
        log(`   Status: ⏳ Aktiv - warte auf Test-Output...`, 'yellow');
      }
      log(`   Prozess-ID: ${testProcess.pid}`, 'blue');
    }

    lastUpdateTime = Date.now();
  };

  // Test-Prozess starten
  log(`🚀 Starte Tests: pnpm ${testCommand} ${testArgs.join(' ') || ''}`, 'bright');
  log(`📊 Progress-Updates alle ${UPDATE_INTERVAL_MIN} Minuten`, 'cyan');

  // Turbo-Befehl für Root-Tests, sonst direkt vitest/playwright
  const isRootTest = testCommand === 'test' || testCommand === 'e2e';
  const command = isRootTest ? 'pnpm' : 'pnpm';
  const args = isRootTest ? ['turbo', 'run', testCommand, ...testArgs] : [testCommand, ...testArgs];

  // Output-Intercepting für Progress-Tracking
  // Wir verwenden 'pipe' statt 'inherit', um Output zu überwachen
  // und geben es dann weiter, damit der User es sieht
  testProcess = spawn(command, args, {
    cwd: rootDir,
    stdio: ['inherit', 'pipe', 'pipe'], // stdin: inherit, stdout/stderr: pipe für Monitoring
    shell: process.platform === 'win32',
  });

  // Output-Streams weiterleiten und überwachen
  if (testProcess.stdout) {
    testProcess.stdout.on('data', (data: Buffer) => {
      process.stdout.write(data); // Weiterleiten an Terminal
      hasOutput = true;
      lastOutputTime = Date.now();
    });
  }

  if (testProcess.stderr) {
    testProcess.stderr.on('data', (data: Buffer) => {
      process.stderr.write(data); // Weiterleiten an Terminal
      hasOutput = true;
      lastOutputTime = Date.now();
    });
  }

  // Output-Detection: Prüfe regelmäßig, ob Prozess noch aktiv ist
  outputCheckInterval = setInterval(() => {
    if (testProcess && !testProcess.killed) {
      // Wenn Prozess läuft, nehmen wir an, dass es Output gibt
      // (auch wenn wir es nicht direkt sehen können)
      const timeSinceLastOutput = Date.now() - lastOutputTime;
      if (timeSinceLastOutput < OUTPUT_CHECK_INTERVAL_MS * 2) {
        hasOutput = true;
      }
    }
  }, OUTPUT_CHECK_INTERVAL_MS);

  // Progress-Updates starten (alle 5 Minuten)
  updateInterval = setInterval(() => {
    if (testProcess && !testProcess.killed) {
      showProgress();
    }
  }, UPDATE_INTERVAL_MS);

  // Erste Update-Nachricht nach 30 Sekunden (falls Tests sehr schnell sind)
  setTimeout(() => {
    if (testProcess && !testProcess.killed) {
      if (hasOutput) {
        log('✅ Tests laufen - Output erkannt', 'green');
      } else {
        log('⏳ Tests werden ausgeführt... (noch kein Output)', 'cyan');
      }
    }
  }, 30000);

  // Zusätzliche Heartbeat-Nachricht nach 2 Minuten (falls Tests sehr lange dauern)
  setTimeout(
    () => {
      if (testProcess && !testProcess.killed) {
        const elapsed = Date.now() - startTime;
        log(`💓 Heartbeat: Tests laufen seit ${formatTime(elapsed)}`, 'cyan');
      }
    },
    2 * 60 * 1000
  );

  // Process-Events
  testProcess.on('spawn', () => {
    log('✅ Test-Prozess gestartet', 'green');
  });

  testProcess.on('error', (error) => {
    log(`❌ Fehler beim Starten der Tests: ${error.message}`, 'yellow');
    if (updateInterval) clearInterval(updateInterval);
    process.exit(1);
  });

  testProcess.on('exit', (code, signal) => {
    const elapsed = Date.now() - startTime;
    const elapsedFormatted = formatTime(elapsed);

    if (updateInterval) {
      clearInterval(updateInterval);
    }
    if (outputCheckInterval) {
      clearInterval(outputCheckInterval);
    }

    if (code === 0) {
      log(`✅ Tests erfolgreich abgeschlossen (Laufzeit: ${elapsedFormatted})`, 'green');
      process.exit(0);
    } else if (signal) {
      log(`⚠️ Tests beendet durch Signal: ${signal} (Laufzeit: ${elapsedFormatted})`, 'yellow');
      process.exit(1);
    } else {
      log(`❌ Tests fehlgeschlagen mit Code ${code} (Laufzeit: ${elapsedFormatted})`, 'yellow');
      process.exit(code ?? 1);
    }
  });

  // Graceful Shutdown
  process.on('SIGINT', () => {
    log('🛑 Empfange SIGINT - beende Tests...', 'yellow');
    if (updateInterval) clearInterval(updateInterval);
    if (outputCheckInterval) clearInterval(outputCheckInterval);
    if (testProcess && !testProcess.killed) {
      testProcess.kill('SIGINT');
    }
  });

  process.on('SIGTERM', () => {
    log('🛑 Empfange SIGTERM - beende Tests...', 'yellow');
    if (updateInterval) clearInterval(updateInterval);
    if (outputCheckInterval) clearInterval(outputCheckInterval);
    if (testProcess && !testProcess.killed) {
      testProcess.kill('SIGTERM');
    }
  });
}

main();
