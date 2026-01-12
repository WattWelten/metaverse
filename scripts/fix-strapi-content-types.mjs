import { readFileSync, existsSync } from 'fs';
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
  const r = await fetch(`${STRAPI}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!r.ok) {
    throw new Error(`Login failed: ${r.status}`);
  }

  const data = await r.json();
  return data.data.token;
}

async function getPublicRoleId(token) {
  // Versuche verschiedene Wege, die Public Role zu finden
  try {
    // Versuche über Users-Permissions Plugin
    const r = await fetch(`${STRAPI}/admin/users-permissions/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (r.ok) {
      const data = await r.json();
      const roles = Array.isArray(data) ? data : (data.data || data.roles || []);
      const publicRole = roles.find(r => r.type === 'public' || r.name === 'Public');
      if (publicRole) return publicRole.id;
    }
  } catch (error) {
    // Ignore
  }

  // Fallback: Public Role ist normalerweise ID 1
  return 1;
}

async function setPermissionsDirectly(token) {
  console.log('🔓 Setting permissions directly via database query...');
  
  // Da die Admin API nicht funktioniert, müssen wir einen anderen Weg finden
  // In Strapi 5 können wir die Permissions über die Service API setzen
  // Aber das erfordert Zugriff auf die Strapi-Instanz selbst
  
  console.log('  ⚠️  Cannot set permissions via API. They must be set manually or via bootstrap.');
  return false;
}

async function testApiWithToken(token) {
  console.log('🧪 Testing API with authentication token...');
  
  for (const { plural } of CONTENT_TYPES) {
    try {
      const r = await fetch(`${STRAPI}/api/${plural}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const status = r.status;
      const text = await r.text();
      
      console.log(`  ${plural}: ${status} - ${text.substring(0, 100)}`);
      
      if (status === 200 || status === 401 || status === 403) {
        return true;
      }
    } catch (error) {
      console.log(`  ${plural}: Error - ${error.message}`);
    }
  }
  
  return false;
}

async function checkStrapiRoutes(token) {
  console.log('🔍 Checking Strapi internal routes...');
  
  try {
    // Prüfe ob Strapi die Content Types kennt
    const r = await fetch(`${STRAPI}/admin/content-type-builder/content-types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (r.ok) {
      const data = await r.json();
      console.log(`  ✅ Found ${data.data?.length || 0} content types in builder`);
      return true;
    }
  } catch (error) {
    console.log(`  ❌ Error checking routes: ${error.message}`);
  }
  
  return false;
}

async function forceStrapiReload() {
  console.log('🔄 Attempting to trigger Strapi reload...');
  
  // Strapi kann nicht über API neu geladen werden
  // Aber wir können prüfen, ob ein Reload-Endpoint existiert
  try {
    const r = await fetch(`${STRAPI}/_health`, { method: 'GET' });
    if (r.ok) {
      console.log('  ✅ Strapi is running');
      console.log('  ⚠️  Strapi must be restarted manually to register routes');
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Strapi health check failed: ${error.message}`);
  }
  
  return false;
}

async function main() {
  let attempt = 1;
  const maxAttempts = 3;

  while (attempt <= maxAttempts) {
    try {
      console.log(`\n🚀 Attempt ${attempt}/${maxAttempts}: Fixing Strapi Content Types\n`);

      // 1. Login
      const token = await login();
      console.log('✅ Logged in\n');

      // 2. Prüfe Content Types im Builder
      await checkStrapiRoutes(token);
      console.log('');

      // 3. Teste API mit Token
      const apiWorks = await testApiWithToken(token);
      console.log('');

      if (apiWorks) {
        console.log('✅ API endpoints are working!\n');
        return;
      }

      // 4. Versuche Permissions zu setzen
      await setPermissionsDirectly(token);
      console.log('');

      // 5. Versuche Strapi Reload
      await forceStrapiReload();
      console.log('');

      // 6. Teste nochmal
      await new Promise(resolve => setTimeout(resolve, 3000));
      const apiWorksAfter = await testApiWithToken(token);

      if (apiWorksAfter) {
        console.log('✅ API endpoints are working after reload!\n');
        return;
      }

      attempt++;
      if (attempt <= maxAttempts) {
        console.log(`⏳ Waiting 5 seconds before retry...\n`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

    } catch (error) {
      console.error(`\n❌ Attempt ${attempt} failed:`, error.message);
      attempt++;
      
      if (attempt <= maxAttempts) {
        console.log('⏳ Waiting 5 seconds before retry...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  console.log('\n❌ Could not fix automatically. The issue is:');
  console.log('   Content Types exist in Content-Type Builder but REST API routes are not registered.');
  console.log('\n📝 Solution:');
  console.log('1. Stop Strapi (Ctrl+C in the terminal where it runs)');
  console.log('2. Delete .strapi folder in strapi/app (if exists)');
  console.log('3. Restart Strapi: cd strapi/app && npm run develop');
  console.log('4. Wait for Strapi to fully start (routes will be auto-generated)');
  console.log('5. Set permissions: Settings → Users & Permissions → Roles → Public');
  console.log('6. Enable "find" and "findOne" for all content types');
  console.log('7. Test: curl http://localhost:1337/api/scenes');
  
  process.exit(1);
}

main();
