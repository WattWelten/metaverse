const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || 'henning@wattweiser.com';
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'WattWelten180424.';

async function login() {
  const r = await fetch(`${STRAPI}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Login failed: ${r.status} ${text}`);
  }

  const data = await r.json();
  return data.data.token;
}

async function getPublicRole(token) {
  const r = await fetch(`${STRAPI}/admin/users-permissions/roles?type=public`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Failed to get roles: ${r.status} ${text.substring(0, 200)}`);
  }

  const data = await r.json();
  const publicRole = Array.isArray(data) 
    ? data.find((r) => r.type === 'public')
    : data.data?.find((r) => r.type === 'public');

  if (!publicRole) {
    throw new Error('Public role not found');
  }

  return publicRole;
}

async function setPermissions(token, role) {
  console.log('🔓 Setting Public API Permissions...');

  const contentTypeConfigs = [
    { api: 'api::scene.scene', controller: 'scene' },
    { api: 'api::asset.asset', controller: 'asset' },
    { api: 'api::zone.zone', controller: 'zone' },
    { api: 'api::portal.portal', controller: 'portal' },
    { api: 'api::audio-beacon.audio-beacon', controller: 'audio-beacon' },
  ];

  const permissions = { ...(role.permissions || {}) };

  for (const { api, controller } of contentTypeConfigs) {
    if (!permissions[api]) {
      permissions[api] = {};
    }
    if (!permissions[api].controllers) {
      permissions[api].controllers = {};
    }
    if (!permissions[api].controllers[controller]) {
      permissions[api].controllers[controller] = {};
    }

    permissions[api].controllers[controller].find = { enabled: true };
    permissions[api].controllers[controller].findOne = { enabled: true };

    console.log(`  ✅ Set permissions for ${api}`);
  }

  const updatedRole = {
    ...role,
    permissions,
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
    throw new Error(`Failed to update permissions: ${r.status} ${text.substring(0, 200)}`);
  }

  console.log('✅ Permissions set for all content types');
  return await r.json();
}

async function main() {
  try {
    console.log(`🔍 Setting permissions at ${STRAPI}...`);
    
    console.log(`🔐 Logging in as ${ADMIN_EMAIL}...`);
    const token = await login();
    console.log('✅ Logged in');

    console.log('📋 Getting Public Role...');
    const role = await getPublicRole(token);
    console.log(`✅ Found Public Role (ID: ${role.id})`);

    await setPermissions(token, role);

    console.log('\n✅ Permissions set successfully!');
    console.log('   Test: curl http://localhost:1337/api/scenes');

  } catch (error) {
    console.error('❌ Failed:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main();
