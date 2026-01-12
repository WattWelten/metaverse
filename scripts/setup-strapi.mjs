import assert from 'node:assert/strict';

const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'Admin123!';

// Content Types die konfiguriert werden sollen
const CONTENT_TYPES = ['scene', 'asset', 'zone', 'portal', 'audio-beacon'];

async function checkStrapi() {
  try {
    const r = await fetch(`${STRAPI}/admin`, { method: 'GET' });
    return r.ok || r.status === 200;
  } catch (error) {
    return false;
  }
}

async function login() {
  // Prüfe ob Strapi läuft
  const isRunning = await checkStrapi();
  if (!isRunning) {
    throw new Error(`Strapi is not running at ${STRAPI}. Please start it first.`);
  }

  const r = await fetch(`${STRAPI}/admin/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Login failed: ${r.status} ${text}\n\nPlease set STRAPI_ADMIN_EMAIL and STRAPI_ADMIN_PASSWORD environment variables with your admin credentials.`);
  }

  const data = await r.json();
  return data.data.token;
}

async function getOrCreateApiToken(token, name = 'Seed Script Token') {
  // Prüfe ob Token bereits existiert
  const listR = await fetch(`${STRAPI}/admin/api-tokens`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (listR.ok) {
    const listData = await listR.json();
    const existing = listData.data?.find((t) => t.name === name);
    if (existing) {
      console.log(`✅ Using existing API Token: ${existing.name}`);
      // Token kann nicht erneut abgerufen werden, muss neu erstellt werden
      // Aber wir können den Namen ändern für einen neuen
      return null; // Signalisiert, dass wir einen neuen erstellen müssen
    }
  }

  // Erstelle neuen Token
  const r = await fetch(`${STRAPI}/admin/api-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: `${name} ${new Date().toISOString().split('T')[0]}`,
      type: 'full-access',
      lifespan: null, // Unbegrenzt
    }),
  });

  if (!r.ok) {
    const text = await r.text();
    // Wenn Token existiert, versuche einen anderen Namen
    if (r.status === 400 && text.includes('already taken')) {
      const altName = `${name} ${Date.now()}`;
      console.log(`⚠️  Token name taken, trying: ${altName}`);
      return await getOrCreateApiToken(token, altName);
    }
    throw new Error(`API Token creation failed: ${r.status} ${text}`);
  }

  const data = await r.json();
  return data.data.accessKey;
}

async function getPublicRole(token) {
  // Verwende den korrekten Admin API Endpoint
  const r = await fetch(`${STRAPI}/admin/users-permissions/roles?type=public`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Failed to get roles: ${r.status} ${text.substring(0, 200)}`);
  }

  const data = await r.json();
  // In Strapi 5 ist die Struktur anders
  const publicRole = Array.isArray(data) 
    ? data.find((r) => r.type === 'public')
    : data.data?.find((r) => r.type === 'public') || data;
    
  assert.ok(publicRole, 'Public role not found');
  return publicRole;
}

async function updatePublicPermissions(token, role) {
  // Permissions für alle Content Types setzen
  const permissions = {};
  
  for (const contentType of CONTENT_TYPES) {
    const apiName = `api::${contentType.replace('-', '-')}.${contentType}`;
    permissions[apiName] = {
      controllers: {
        [contentType]: {
          find: { enabled: true },
          findOne: { enabled: true },
        },
      },
    };
  }

  // Korrigiere die API-Namen (Strapi verwendet spezifische Namen)
  const correctedPermissions = {
    'api::scene.scene': {
      controllers: {
        scene: {
          find: { enabled: true },
          findOne: { enabled: true },
        },
      },
    },
    'api::asset.asset': {
      controllers: {
        asset: {
          find: { enabled: true },
          findOne: { enabled: true },
        },
      },
    },
    'api::zone.zone': {
      controllers: {
        zone: {
          find: { enabled: true },
          findOne: { enabled: true },
        },
      },
    },
    'api::portal.portal': {
      controllers: {
        portal: {
          find: { enabled: true },
          findOne: { enabled: true },
        },
      },
    },
    'api::audio-beacon.audio-beacon': {
      controllers: {
        'audio-beacon': {
          find: { enabled: true },
          findOne: { enabled: true },
        },
      },
    },
  };

  const updatedRole = {
    ...role,
    permissions: correctedPermissions,
  };

  const r = await fetch(`${STRAPI}/admin/users-permissions/roles/${role.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedRole),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Failed to update permissions: ${r.status} ${text}`);
  }

  return await r.json();
}

async function main() {
  try {
    console.log(`🔍 Checking Strapi at ${STRAPI}...`);
    const isRunning = await checkStrapi();
    if (!isRunning) {
      throw new Error(`Strapi is not running at ${STRAPI}. Please start it with: cd strapi/app && npm run develop`);
    }
    console.log('✅ Strapi is running');

    console.log(`🔐 Logging in as ${ADMIN_EMAIL}...`);
    const adminToken = await login();
    console.log('✅ Logged in');

    console.log('🔑 Getting or creating API Token...');
    const apiToken = await getOrCreateApiToken(adminToken);
    if (apiToken) {
      console.log('✅ API Token:', apiToken.substring(0, 50) + '...');
    } else {
      console.log('⚠️  API Token already exists, please use existing token from Strapi Admin');
      console.log('   Go to: Settings → API Tokens');
    }

    console.log('📋 Getting Public Role...');
    const publicRole = await getPublicRole(adminToken);
    console.log('✅ Public Role found:', publicRole.id);

    console.log('🔓 Setting Public API Permissions...');
    await updatePublicPermissions(adminToken, publicRole);
    console.log('✅ Permissions updated');

    console.log('\n✅ Setup complete!');
    console.log('\n📝 Add this to your .env.local:');
    console.log(`STRAPI_TOKEN=${apiToken}`);

    return apiToken;
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main();
