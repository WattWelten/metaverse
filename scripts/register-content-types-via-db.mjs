import { readFileSync } from 'fs';
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

async function registerContentTypeViaBuilder(token, schema, apiName) {
  // Versuche Content Type über Content-Type Builder API zu registrieren
  // In Strapi 5 muss das über den Builder-Endpoint gemacht werden
  
  const endpoints = [
    `${STRAPI}/content-type-builder/content-types`,
    `${STRAPI}/admin/content-type-builder/content-types`,
  ];

  for (const endpoint of endpoints) {
    try {
      // Versuche POST
      const postR = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contentType: schema,
          apiID: apiName,
        }),
      });

      if (postR.ok) {
        const data = await postR.json();
        return { success: true, data };
      }

      // Versuche PUT falls bereits existiert
      const putR = await fetch(`${endpoint}/${apiName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contentType: schema,
        }),
      });

      if (putR.ok) {
        const data = await putR.json();
        return { success: true, data };
      }
    } catch (error) {
      // Continue
    }
  }

  return { success: false };
}

async function main() {
  try {
    console.log('🚀 Register Content Types via Database\n');
    
    // Warte auf Rate Limit
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const token = await login();
    console.log('✅ Logged in\n');

    let registered = 0;
    for (const { name, path } of CONTENT_TYPES) {
      try {
        const fullPath = join(rootDir, path);
        const schema = JSON.parse(readFileSync(fullPath, 'utf-8'));
        const apiName = `api::${name}.${name}`;

        console.log(`📝 Registering ${apiName}...`);
        const result = await registerContentTypeViaBuilder(token, schema, apiName);

        if (result.success) {
          console.log(`  ✅ Registered ${apiName}\n`);
          registered++;
        } else {
          console.log(`  ⚠️  Could not register ${apiName} via API\n`);
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}\n`);
      }
    }

    console.log(`\n✅ Registered ${registered}/${CONTENT_TYPES.length} content types`);
    console.log('\n📝 Next steps:');
    console.log('   1. Restart Strapi: cd strapi/app && npm run develop');
    console.log('   2. Check if routes are generated');
    console.log('   3. If still 404, Content Types must be saved manually in Admin Panel');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
