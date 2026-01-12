import assert from 'node:assert/strict';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || 'henning@wattweiser.com';
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'WattWelten180424.';

const CONTENT_TYPES = [
  { api: 'api::scene.scene', controller: 'scene', plural: 'scenes' },
  { api: 'api::asset.asset', controller: 'asset', plural: 'assets' },
  { api: 'api::zone.zone', controller: 'zone', plural: 'zones' },
  { api: 'api::portal.portal', controller: 'portal', plural: 'portals' },
  { api: 'api::audio-beacon.audio-beacon', controller: 'audio-beacon', plural: 'audio-beacons' },
];

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

async function getPublicRole(token) {
  console.log('📋 Getting Public Role...');
  
  // Versuche verschiedene Endpoints
  const endpoints = [
    `${STRAPI}/admin/users-permissions/roles`,
    `${STRAPI}/admin/users-permissions/roles?type=public`,
  ];

  for (const endpoint of endpoints) {
    try {
      const r = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (r.ok) {
        const data = await r.json();
        console.log('  Debug: Response structure:', JSON.stringify(Object.keys(data)).substring(0, 200));
        
        // Versuche verschiedene Datenstrukturen
        let roles = [];
        if (Array.isArray(data)) {
          roles = data;
        } else if (data.data && Array.isArray(data.data)) {
          roles = data.data;
        } else if (data.roles && Array.isArray(data.roles)) {
          roles = data.roles;
        }
        
        const publicRole = roles.find((r) => r.type === 'public' || r.name === 'Public');
        
        if (publicRole) {
          console.log(`  ✅ Found Public Role (ID: ${publicRole.id}, type: ${publicRole.type || 'N/A'})`);
          return publicRole;
        } else {
          console.log(`  ⚠️  Roles found: ${roles.map(r => r.name || r.type).join(', ')}`);
        }
      } else {
        const text = await r.text();
        console.log(`  ⚠️  Endpoint ${endpoint} returned ${r.status}: ${text.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`  ⚠️  Error with ${endpoint}: ${error.message}`);
    }
  }

  // Versuche direkt über ID 1 (Public Role ist normalerweise ID 1)
  try {
    const r = await fetch(`${STRAPI}/admin/users-permissions/roles/1`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (r.ok) {
      const data = await r.json();
      if (data.type === 'public' || data.name === 'Public') {
        console.log(`  ✅ Found Public Role via ID 1`);
        return data;
      }
    }
  } catch (error) {
    // Ignore
  }

  throw new Error('Public role not found. Please check if Users & Permissions plugin is enabled.');
}

async function setPermissions(token, role) {
  console.log('🔓 Setting Public API Permissions...');
  
  // Erstelle Permissions-Struktur im Strapi 5 Format
  const permissions = { ...(role.permissions || {}) };

  for (const { api, controller } of CONTENT_TYPES) {
    if (!permissions[api]) {
      permissions[api] = {};
    }
    if (!permissions[api].controllers) {
      permissions[api].controllers = {};
    }
    if (!permissions[api].controllers[controller]) {
      permissions[api].controllers[controller] = {};
    }

    // Setze find und findOne auf enabled
    permissions[api].controllers[controller].find = { enabled: true };
    permissions[api].controllers[controller].findOne = { enabled: true };
  }

  // Update Role
  const updateR = await fetch(`${STRAPI}/admin/users-permissions/roles/${role.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...role,
      permissions,
    }),
  });

  if (!updateR.ok) {
    const text = await updateR.text();
    throw new Error(`Failed to update permissions: ${updateR.status} ${text.substring(0, 200)}`);
  }

  console.log('✅ Permissions set for all content types');
}

async function getOrCreateApiToken(token) {
  console.log('🔑 Getting API Token...');
  
  const listR = await fetch(`${STRAPI}/admin/api-tokens`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!listR.ok) {
    throw new Error(`Failed to get API tokens: ${listR.status}`);
  }

  const listData = await listR.json();
  const existing = listData.data?.find((t) => t.name === 'Seed Script Token');

  if (existing) {
    console.log('✅ Found existing API Token: Seed Script Token');
    // Token kann nicht erneut abgerufen werden, muss neu erstellt werden
    console.log('⚠️  Token exists but cannot be retrieved. Creating new one...');
    
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
      throw new Error(`Failed to create API token: ${createR.status} ${text}`);
    }

    const createData = await createR.json();
    return createData.data.accessKey;
  }

  // Erstelle neuen Token
  const createR = await fetch(`${STRAPI}/admin/api-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: 'Seed Script Token',
      type: 'full-access',
      lifespan: null,
    }),
  });

  if (!createR.ok) {
    const text = await createR.text();
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

  // Entferne alte STRAPI_TOKEN Zeile
  envContent = envContent
    .split('\n')
    .filter((line) => !line.startsWith('STRAPI_TOKEN='))
    .join('\n');

  // Füge neuen Token hinzu
  if (envContent && !envContent.endsWith('\n')) {
    envContent += '\n';
  }
  envContent += `STRAPI_TOKEN=${token}\n`;

  writeFileSync(envLocalPath, envContent, 'utf-8');
  console.log(`✅ Token saved to .env.local`);
}

async function testApi() {
  console.log('🧪 Testing API endpoints...');
  
  for (const { plural } of CONTENT_TYPES) {
    try {
      const r = await fetch(`${STRAPI}/api/${plural}`);
      const status = r.status;
      
      if (status === 200 || status === 401 || status === 403) {
        console.log(`  ✅ ${plural}: OK (status ${status})`);
      } else if (status === 404) {
        console.log(`  ⚠️  ${plural}: Not found (404) - Content Type may need to be saved in Content-Type Builder`);
      } else {
        console.log(`  ❓ ${plural}: Unexpected status ${status}`);
      }
    } catch (error) {
      console.log(`  ❌ ${plural}: Error - ${error.message}`);
    }
  }
}

async function main() {
  try {
    console.log(`🚀 Auto-Setup Strapi\n`);
    console.log(`📍 Strapi URL: ${STRAPI}`);
    console.log(`👤 Admin: ${ADMIN_EMAIL}\n`);

    // 1. Login
    const adminToken = await login();
    console.log('✅ Logged in\n');

    // 2. Get Public Role
    const publicRole = await getPublicRole(adminToken);
    console.log(`✅ Found Public Role (ID: ${publicRole.id})\n`);

    // 3. Set Permissions
    await setPermissions(adminToken, publicRole);
    console.log('');

    // 4. Get/Create API Token
    const apiToken = await getOrCreateApiToken(adminToken);
    console.log(`✅ API Token: ${apiToken.substring(0, 50)}...\n`);

    // 5. Save to .env.local
    saveToEnvLocal(apiToken);

    // 6. Test API
    await testApi();

    console.log('\n✅ Setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. If API returns 404, go to Content-Type Builder and click "Save" on each content type');
    console.log('2. Run seeds: node scripts/seed-strapi.mjs');
    console.log('3. Test API: curl http://localhost:1337/api/scenes');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main();
