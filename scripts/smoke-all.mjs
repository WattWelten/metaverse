import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const run = (script) =>
  new Promise((res, rej) => {
    const p = spawn(process.execPath, [join(__dirname, script)], {
      stdio: 'inherit',
    });
    p.on('exit', (c) => (c === 0 ? res() : rej(new Error('exit ' + c))));
  });

try {
  await run('smoke-rtc.mjs');
  await run('smoke-yws.mjs');
  await run('smoke-strapi.mjs');
  console.log('✅ All smokes passed');
} catch (error) {
  console.error('❌ Smoke test failed:', error.message);
  process.exit(1);
}
