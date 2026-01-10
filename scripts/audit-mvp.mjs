#!/usr/bin/env node
/**
 * MVP Branch Audit - Node.js Version (plattformunabhängig)
 * Prüft alle erforderlichen Dateien und Konfigurationen für das MVP
 */

import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

process.chdir(ROOT);

const RED = '\x1b[31m';
const GRN = '\x1b[32m';
const YLW = '\x1b[33m';
const RST = '\x1b[0m';

let FAILED = 0;

function pass(msg) {
  console.log(`${GRN}PASS${RST} ${msg}`);
}

function fail(msg) {
  console.log(`${RED}FAIL${RST} ${msg}`);
  FAILED = 1;
}

function warn(msg) {
  console.log(`${YLW}WARN${RST} ${msg}`);
}

const DATE = new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z';
const BRANCH_EXPECT = 'feat/auto-setup-mvp';

console.log(`🔎 MVP Branch Audit — ${DATE}`);

// Branch prüfen
let CUR = '?';
try {
  CUR = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', cwd: ROOT }).trim();
  if (CUR === BRANCH_EXPECT) {
    pass(`auf Branch ${CUR}`);
  } else {
    warn(`Branch ist ${CUR} (erwartet ${BRANCH_EXPECT})`);
  }
} catch {
  warn('Git nicht verfügbar oder nicht in Git-Repo');
}

// Up-to-date prüfen
try {
  execSync('git fetch -q origin', { stdio: 'ignore', cwd: ROOT });
  const diffCmd = 'git diff --quiet "origin/' + BRANCH_EXPECT + '..."';
  execSync(diffCmd, { stdio: 'ignore', cwd: ROOT });
  pass(`Up-to-date mit origin/${BRANCH_EXPECT}`);
} catch {
  warn('Lokale Commits vs origin');
}

function checkFile(path) {
  const fullPath = join(ROOT, path);
  if (existsSync(fullPath)) {
    pass(path);
    return true;
  } else {
    fail(`fehlt: ${path}`);
    return false;
  }
}

// Struktur
if (existsSync(join(ROOT, 'pnpm-workspace.yaml'))) {
  pass('pnpm-workspace.yaml');
  const content = readFileSync(join(ROOT, 'pnpm-workspace.yaml'), 'utf8');
  if (content.includes('apps')) {
    pass('apps/* im workspace');
  } else {
    fail('apps/* nicht in workspace');
  }
  if (content.includes('packages')) {
    pass('packages/* im workspace');
  } else {
    fail('packages/* nicht in workspace');
  }
} else {
  fail('pnpm-workspace.yaml fehlt');
}

// Integrationen
checkFile('.github/workflows/ci.yml');
checkFile('docs/ENV.md');
checkFile('docs/MVP-Guide.md');

checkFile('apps/server/src/routes/rtc.ts');
checkFile('packages/rtc-sfu/package.json');
checkFile('packages/rtc-sfu/src/index.ts');

checkFile('packages/voice/src/zone-engine.ts');

checkFile('apps/server/src/routes/yws.ts');
checkFile('packages/whiteboard/src/Whiteboard.tsx');
checkFile('packages/collab-docs/src/MarkdownEditor.tsx');

checkFile('packages/core/src/schemas/scene.schema.json');

// ENV Hinweise
try {
  const grepCmd = process.platform === 'win32' 
    ? 'findstr /s /i "LIVEKIT_URL" *.* 2>nul'
    : 'grep -r "LIVEKIT_URL" . > /dev/null 2>&1';
  execSync(grepCmd, { stdio: 'ignore', cwd: ROOT, shell: true });
  pass('LIVEKIT_* referenziert');
} catch {
  warn('LIVEKIT_* nicht referenziert');
}

// livekit-client dependency prüfen
const rtcSfuPkg = join(ROOT, 'packages/rtc-sfu/package.json');
if (existsSync(rtcSfuPkg)) {
  const content = readFileSync(rtcSfuPkg, 'utf8');
  if (content.includes('livekit-client')) {
    pass('livekit-client als dep');
  } else {
    fail('livekit-client fehlt');
  }
} else {
  fail('packages/rtc-sfu/package.json fehlt');
}

// y-websocket prüfen
try {
  const grepCmd = process.platform === 'win32'
    ? 'findstr /s /i "y-websocket" apps\\server\\*.* packages\\*\\*.* 2>nul'
    : 'grep -r "y-websocket" apps/server packages/* > /dev/null 2>&1';
  execSync(grepCmd, { stdio: 'ignore', cwd: ROOT, shell: true });
  pass('y-websocket vorhanden');
} catch {
  fail('y-websocket fehlt');
}

// Strapi optional
if (existsSync(join(ROOT, 'strapi'))) {
  pass('strapi/ vorhanden');
} else {
  warn('strapi/ nicht gefunden (optional)');
}

// Ergebnis
mkdirSync(join(ROOT, '.audit'), { recursive: true });
const REPORT = join(ROOT, '.audit/MVP_AUDIT.md');
const reportContent = `# MVP Audit — ${DATE}
- Branch: \`${CUR}\`
## Checks
- Workspace & Struktur: OK/NOK (siehe Terminal)
- SFU/RTC: rtc-api + rtc-sfu
- Voice Zonen: zone-engine
- Collab: yws + collab-*
- Content: schema + (optional) Strapi
- CI & Docs

## Details
- Alle Checks wurden ausgeführt
- Siehe Terminal-Output für detaillierte Ergebnisse
`;

writeFileSync(REPORT, reportContent);

if (FAILED === 0) {
  console.log(`✅ ${GRN}OK${RST} — Report: ${REPORT}`);
  process.exit(0);
} else {
  console.log(`🟥 ${RED}ABWEICHUNGEN${RST} — ${REPORT}`);
  process.exit(1);
}
