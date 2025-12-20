#!/usr/bin/env node

/**
 * Automatisches Dependency-Update-Script
 * Prüft und aktualisiert alle Dependencies auf die neuesten Versionen
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔄 Starte automatisches Dependency-Update...\n');

try {
  // 1. Prüfe veraltete Packages
  console.log('📊 Prüfe veraltete Packages...');
  try {
    const outdated = execSync('pnpm outdated --json', {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    const outdatedData = JSON.parse(outdated);
    if (Object.keys(outdatedData).length > 0) {
      console.log('⚠️  Veraltete Packages gefunden:');
      console.log(JSON.stringify(outdatedData, null, 2));
    } else {
      console.log('✅ Alle Packages sind aktuell!');
    }
  } catch (error) {
    // pnpm outdated gibt Exit Code 1 zurück, wenn veraltete Packages gefunden werden
    // Das ist normal, wir ignorieren es
  }

  // 2. Update auf neueste Versionen
  console.log('\n⬆️  Aktualisiere alle Dependencies...');
  execSync('pnpm update --latest', {
    cwd: rootDir,
    stdio: 'inherit',
  });

  // 3. Installiere aktualisierte Dependencies
  console.log('\n📦 Installiere aktualisierte Dependencies...');
  execSync('pnpm install', {
    cwd: rootDir,
    stdio: 'inherit',
  });

  console.log('\n✅ Dependency-Update abgeschlossen!');
  console.log('\n⚠️  Bitte teste die Anwendung nach dem Update:');
  console.log('   - pnpm build');
  console.log('   - pnpm test');
  console.log('   - pnpm dev');
} catch (error) {
  console.error('\n❌ Fehler beim Update:', error.message);
  process.exit(1);
}



