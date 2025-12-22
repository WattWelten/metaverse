#!/usr/bin/env tsx

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const decoderPaths = [
  join(rootDir, 'apps/web/public/draco'),
  join(rootDir, 'apps/web/public/ktx2'),
];

console.log('Setting up decoder directories...');

decoderPaths.forEach((path) => {
  try {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
      console.log(`✅ Created directory: ${path}`);
    } else {
      console.log(`ℹ️  Directory already exists: ${path}`);
    }

    const gitkeepPath = join(path, '.gitkeep');
    if (!existsSync(gitkeepPath)) {
      writeFileSync(gitkeepPath, '');
      console.log(`✅ Created .gitkeep: ${gitkeepPath}`);
    }
  } catch (error) {
    console.error(`❌ Failed to setup ${path}:`, error);
    process.exit(1);
  }
});

console.log('\n✅ Decoder folders prepared.');
console.log('\n📝 Next steps:');
console.log('  1. Add Draco decoder files to apps/web/public/draco/');
console.log('  2. Add KTX2/Basis transcoder files to apps/web/public/ktx2/');
console.log('  3. Or configure CDN paths in the loader utilities');
console.log('\n💡 Recommended sources:');
console.log('  - Draco: https://github.com/google/draco/tree/master/javascript/draco_decoder');
console.log('  - KTX2: https://github.com/BinomialLLC/basis_universal/tree/master/webgl');
