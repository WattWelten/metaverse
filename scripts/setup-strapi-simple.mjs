import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || 'henning@wattweiser.com';
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'WattWelten180424.';

async function login() {
  console.log('🔐 Logging in...');
  const r = await fetch(`${STRAPI}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Login failed: ${r.status} ${text}`);
  }

  const data = await r.json();
  return data.data.token;
}

async function getOrCreateApiToken(token) {
  console.log('🔑 Getting/Creating API Token...');
  
  // Prüfe existierende Tokens
  const listR = await fetch(`${STRAPI}/admin/api-tokens`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (listR.ok) {
    const listData = await listR.json();
    const existing = listData.data?.find((t) => t.name.includes('Seed Script'));
    
    if (existing) {
      console.log(`  ✅ Found existing token: ${existing.name}`);
      console.log('  ⚠️  Cannot retrieve existing token value. Creating new one...');
    }
  }

  // Erstelle neuen Token
  const createR = await fetch(`${STRAPI}/admin/api-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: `Seed Script Token ${new Date().toISOString().split('T')[0]}`,
      type: 'full-access',
      lifespan: null,
    }),
  });

  if (!createR.ok) {
    const text = await createR.text();
    if (text.includes('already taken')) {
      console.log('  ⚠️  Token name taken, trying with timestamp...');
      const timestamp = Date.now();
      const createR2 = await fetch(`${STRAPI}/admin/api-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `Seed Script Token ${timestamp}`,
          type: 'full-access',
          lifespan: null,
        }),
      });
      
      if (!createR2.ok) {
        throw new Error(`Failed to create API token: ${createR2.status}`);
      }
      
      const createData2 = await createR2.json();
      return createData2.data.accessKey;
    }
    throw new Error(`Failed to create API token: ${createR.status} ${text}`);
  }

  const createData = await createR.json();
  return createData.data.accessKey;
}

function saveToEnvLocal(token) {
  const envLocalPath = join(process.cwd(), '.env.local');
  let envContent = '';

  if (existsSync(envLocalPath)) {
    envContent = readFileSync(envLocalPath, 'utf-8');
  }

  // Entferne alte STRAPI_TOKEN Zeilen
  envContent = envContent
    .split('\n')
    .filter((line) => !line.trim().startsWith('STRAPI_TOKEN='))
    .join('\n')
    .trim();

  // Füge neuen Token hinzu
  if (envContent && !envContent.endsWith('\n')) {
    envContent += '\n';
  }
  envContent += `STRAPI_TOKEN=${token}\n`;

  writeFileSync(envLocalPath, envContent, 'utf-8');
  console.log(`✅ Token saved to .env.local`);
}

async function main() {
  try {
    console.log('🚀 Strapi Auto-Setup\n');

    // 1. Login
    const adminToken = await login();
    console.log('✅ Logged in\n');

    // 2. Get/Create API Token
    const apiToken = await getOrCreateApiToken(adminToken);
    console.log(`✅ API Token created: ${apiToken.substring(0, 50)}...\n`);

    // 3. Save to .env.local
    saveToEnvLocal(apiToken);

    console.log('\n✅ Setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Restart Strapi to trigger bootstrap script (sets permissions automatically)');
    console.log('2. Register Content Types: Open http://localhost:1337/admin → Content-Type Builder → Save each type');
    console.log('3. Run seeds: node scripts/seed-strapi.mjs');
    console.log('4. Test API: curl http://localhost:1337/api/scenes');
    console.log('5. Setup webhook: node scripts/setup-strapi-webhook.mjs');
    console.log('\n💡 The bootstrap script in strapi/app/src/index.ts will automatically');
    console.log('   set Public API permissions when Strapi restarts.');
    console.log('\n📚 Full documentation: docs/STRAPI_SETUP.md');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main();
