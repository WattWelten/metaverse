import assert from 'node:assert/strict';

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

async function getApiToken(token) {
  const r = await fetch(`${STRAPI}/admin/api-tokens`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!r.ok) {
    throw new Error(`Failed to get API tokens: ${r.status}`);
  }

  const data = await r.json();
  const existing = data.data?.find((t) => t.name === 'Seed Script Token');
  return existing?.accessKey || null;
}

async function setPermissionsViaBootstrap() {
  console.log('📝 Note: Permissions should be set automatically via bootstrap script.');
  console.log('   If they are not working, please set them manually in Strapi Admin:');
  console.log('   Settings → Users & Permissions plugin → Roles → Public');
  console.log('   Enable "find" and "findOne" for all content types.');
}

async function main() {
  try {
    console.log(`🔍 Checking Strapi at ${STRAPI}...`);
    
    console.log(`🔐 Logging in as ${ADMIN_EMAIL}...`);
    const adminToken = await login();
    console.log('✅ Logged in');

    console.log('🔑 Getting API Token...');
    const apiToken = await getApiToken(adminToken);
    
    if (apiToken) {
      console.log('✅ Found API Token:', apiToken.substring(0, 50) + '...');
      console.log('\n📝 Add this to your .env.local:');
      console.log(`STRAPI_TOKEN=${apiToken}`);
    } else {
      console.log('⚠️  No API Token found. Please create one in Strapi Admin:');
      console.log('   Settings → API Tokens → Create new API Token');
    }

    console.log('\n🔓 Setting Permissions...');
    await setPermissionsViaBootstrap();
    
    console.log('\n✅ Setup instructions:');
    console.log('1. Permissions are set automatically via bootstrap script');
    console.log('2. If API returns 404, check Strapi Admin → Content-Type Builder');
    console.log('3. Make sure all content types are registered');
    console.log('4. Test API: curl http://localhost:1337/api/scenes');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main();
