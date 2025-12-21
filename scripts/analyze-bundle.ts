#!/usr/bin/env tsx
/**
 * Bundle-Size-Analyse
 * Analysiert die Build-Artefakte und gibt eine Übersicht über Chunk-Größen
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'apps/web/dist');

interface ChunkInfo {
  name: string;
  size: number;
  gzipSize?: number;
  type: 'js' | 'css' | 'html' | 'other';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function analyzeBundle(): void {
  if (!existsSync(distDir)) {
    console.error('❌ Dist-Ordner nicht gefunden. Führen Sie zuerst "pnpm build" aus.');
    process.exit(1);
  }

  const chunks: ChunkInfo[] = [];

  // Analysiere alle Dateien im dist-Ordner
  function analyzeDirectory(dir: string, prefix = ''): void {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = join(prefix, entry.name);

      if (entry.isDirectory()) {
        analyzeDirectory(fullPath, relativePath);
      } else {
        const stats = statSync(fullPath);
        const ext = entry.name.split('.').pop()?.toLowerCase() || 'other';
        const type =
          ext === 'js' ? 'js' : ext === 'css' ? 'css' : ext === 'html' ? 'html' : 'other';

        chunks.push({
          name: relativePath,
          size: stats.size,
          type,
        });
      }
    }
  }

  analyzeDirectory(distDir);

  // Sortiere nach Größe
  chunks.sort((a, b) => b.size - a.size);

  // Gruppiere nach Typ
  const byType = {
    js: chunks.filter((c) => c.type === 'js'),
    css: chunks.filter((c) => c.type === 'css'),
    html: chunks.filter((c) => c.type === 'html'),
    other: chunks.filter((c) => c.type === 'other'),
  };

  // Berechne Gesamtgrößen
  const totalSize = chunks.reduce((sum, c) => sum + c.size, 0);
  const jsSize = byType.js.reduce((sum, c) => sum + c.size, 0);
  const cssSize = byType.css.reduce((sum, c) => sum + c.size, 0);

  // Ausgabe
  console.log('\n📦 Bundle-Size-Analyse\n');
  console.log('='.repeat(60));
  console.log(`Gesamtgröße: ${formatBytes(totalSize)}`);
  console.log(`  JavaScript: ${formatBytes(jsSize)} (${((jsSize / totalSize) * 100).toFixed(1)}%)`);
  console.log(`  CSS: ${formatBytes(cssSize)} (${((cssSize / totalSize) * 100).toFixed(1)}%)`);
  console.log('='.repeat(60));

  console.log('\n🔍 Top 10 größte Chunks:\n');
  chunks.slice(0, 10).forEach((chunk, index) => {
    const percentage = ((chunk.size / totalSize) * 100).toFixed(1);
    console.log(
      `${(index + 1).toString().padStart(2)}. ${chunk.name.padEnd(50)} ${formatBytes(chunk.size).padStart(10)} (${percentage}%)`
    );
  });

  console.log('\n📊 Chunks nach Typ:\n');
  console.log(`JavaScript (${byType.js.length} Dateien):`);
  byType.js.slice(0, 5).forEach((chunk) => {
    console.log(`  - ${chunk.name}: ${formatBytes(chunk.size)}`);
  });

  console.log(`\nCSS (${byType.css.length} Dateien):`);
  byType.css.forEach((chunk) => {
    console.log(`  - ${chunk.name}: ${formatBytes(chunk.size)}`);
  });

  // Warnungen
  console.log('\n⚠️  Warnungen:\n');
  const largeChunks = chunks.filter((c) => c.size > 500 * 1024); // >500KB
  if (largeChunks.length > 0) {
    console.log('Chunks >500KB (könnten optimiert werden):');
    largeChunks.forEach((chunk) => {
      console.log(`  - ${chunk.name}: ${formatBytes(chunk.size)}`);
    });
  } else {
    console.log('✅ Keine Chunks >500KB gefunden');
  }

  // Empfehlungen
  console.log('\n💡 Empfehlungen:\n');
  if (jsSize > 1000 * 1024) {
    console.log('  - JavaScript-Bundle ist >1MB - Code-Splitting prüfen');
  }
  if (chunks.length > 20) {
    console.log('  - Viele kleine Chunks - möglicherweise zu viel Code-Splitting');
  }
  console.log('  - Verwenden Sie Lazy-Loading für Feature-Packages (AI, Voice, XR)');
  console.log('  - Prüfen Sie Tree-Shaking für ungenutzte Imports');
}

analyzeBundle();
