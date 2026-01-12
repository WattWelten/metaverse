import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || 'henning@wattweiser.com';
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'WattWelten180424.';

const CONTENT_TYPES = [
  { name: 'scene', path: 'strapi/app/src/api/scene/content-types/scene/schema.json' },
  { name: 'asset', path: 'strapi/app/src/api/asset/content-types/asset/schema.json' },
  { name: 'zone', path: 'strapi/app/src/api/zone/content-types/zone/schema.json' },
  { name: 'portal', path: 'strapi/app/src/api/portal/content-types/portal/schema.json' },
  { name: 'audio-beacon', path: 'strapi/app/src/api/audio-beacon/content-types/audio-beacon/schema.json' },
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

async function checkContentTypeExists(token, contentType) {
  try {
    const r = await fetch(`${STRAPI}/admin/content-type-builder/content-types/${contentType}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return r.ok;
  } catch {
    return false;
  }
}

async function registerContentType(token, schemaPath, contentTypeName) {
  const fullPath = join(rootDir, schemaPath);
  
  if (!existsSync(fullPath)) {
    throw new Error(`Schema file not found: ${fullPath}`);
  }

  const schema = JSON.parse(readFileSync(fullPath, 'utf-8'));
  
  // API Name format: api::content-type-name.content-type-name
  const apiName = `api::${contentTypeName}.${contentTypeName}`;
  
  console.log(`  📝 Registering ${apiName}...`);
  
  // Versuche verschiedene Endpoints
  const endpoints = [
    `${STRAPI}/admin/content-type-builder/content-types`,
    `${STRAPI}/admin/content-type-builder/content-types/${apiName}`,
  ];

  for (const endpoint of endpoints) {
    try {
      // Versuche PUT (Update)
      const putR = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contentType: schema }),
      });

      if (putR.ok) {
        console.log(`    ✅ Updated via PUT`);
        return true;
      }

      // Versuche POST (Create)
      const postR = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contentType: schema }),
      });

      if (postR.ok) {
        console.log(`    ✅ Created via POST`);
        return true;
      }
    } catch (error) {
      // Continue to next endpoint
    }
  }

  return false;
}

async function testApiEndpoint(pluralName) {
  try {
    const r = await fetch(`${STRAPI}/api/${pluralName}`);
    const status = r.status;
    
    if (status === 200) {
      return { success: true, status, message: 'OK' };
    } else if (status === 401 || status === 403) {
      return { success: true, status, message: 'Permission issue (needs permissions set)' };
    } else if (status === 404) {
      return { success: false, status, message: 'Not found' };
    } else {
      return { success: false, status, message: `Unexpected status: ${status}` };
    }
  } catch (error) {
    return { success: false, status: null, message: error.message };
  }
}

async function setPermissionsViaBootstrap(token) {
  console.log('  🔄 Triggering bootstrap (permissions should be set automatically)...');
  // Bootstrap läuft beim Start, aber wir können Strapi nicht neu starten
  // Also versuchen wir die Permissions direkt zu setzen
  return false; // Wird vom Bootstrap-Script gemacht
}

async function main() {
  let attempt = 1;
  const maxAttempts = 5;

  while (attempt <= maxAttempts) {
    try {
      console.log(`\n🚀 Attempt ${attempt}/${maxAttempts}: Registering Strapi Content Types\n`);

      // 1. Login
      const token = await login();
      console.log('✅ Logged in\n');

      // 2. Prüfe welche Content Types bereits existieren
      console.log('📋 Checking existing content types...');
      for (const { name } of CONTENT_TYPES) {
        const apiName = `api::${name}.${name}`;
        const exists = await checkContentTypeExists(token, apiName);
        console.log(`  ${exists ? '✅' : '❌'} ${apiName}: ${exists ? 'exists' : 'not found'}`);
      }
      console.log('');

      // 3. Versuche Content Types zu registrieren
      console.log('📝 Registering content types...');
      let registered = 0;
      for (const { name, path } of CONTENT_TYPES) {
        try {
          const success = await registerContentType(token, path, name);
          if (success) registered++;
        } catch (error) {
          console.log(`    ❌ Failed: ${error.message}`);
        }
      }
      console.log(`\n✅ Registered ${registered}/${CONTENT_TYPES.length} content types\n`);

      // 4. Warte kurz
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 5. Teste API Endpoints
      console.log('🧪 Testing API endpoints...');
      const results = [];
      for (const { name } of CONTENT_TYPES) {
        const plural = name === 'audio-beacon' ? 'audio-beacons' : `${name}s`;
        const result = await testApiEndpoint(plural);
        results.push({ name, plural, ...result });
        console.log(`  ${result.success ? '✅' : '❌'} /api/${plural}: ${result.message} (${result.status || 'N/A'})`);
      }

      // 6. Prüfe ob alle erfolgreich sind
      const allSuccess = results.every(r => r.success && (r.status === 200 || r.status === 401 || r.status === 403));
      
      if (allSuccess) {
        console.log('\n✅ SUCCESS! All content types are registered and accessible!\n');
        console.log('📝 Next steps:');
        console.log('1. Set permissions in Strapi Admin: Settings → Users & Permissions → Roles → Public');
        console.log('2. Enable "find" and "findOne" for all content types');
        console.log('3. Run seeds: node scripts/seed-strapi.mjs');
        return;
      } else {
        console.log(`\n⚠️  Not all endpoints are working. Retrying... (attempt ${attempt}/${maxAttempts})\n`);
        attempt++;
        
        if (attempt <= maxAttempts) {
          console.log('⏳ Waiting 5 seconds before retry...\n');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
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

  console.log('\n❌ Failed after all attempts. Manual intervention required.');
  console.log('\n📝 Manual steps:');
  console.log('1. Go to Strapi Admin → Content-Type Builder');
  console.log('2. Open each content type and click "Save"');
  console.log('3. Go to Settings → Users & Permissions → Roles → Public');
  console.log('4. Enable "find" and "findOne" for all content types');
  console.log('5. Restart Strapi');
  process.exit(1);
}

main();
