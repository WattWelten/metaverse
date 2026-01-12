import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

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
    throw new Error(`Login failed: ${r.status}`);
  }

  const data = await r.json();
  return data.data.token;
}

async function main() {
  try {
    console.log('🚀 Force Register Content Types\n');
    
    // Warte auf Rate Limit
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const token = await login();
    console.log('✅ Logged in\n');

    // Prüfe Content Types
    console.log('📋 Checking content types in database...');
    const r = await fetch(`${STRAPI}/admin/content-type-builder/content-types`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (r.ok) {
      const data = await r.json();
      console.log(`  Found ${data.data?.length || 0} content types\n`);
      
      if (data.data && data.data.length > 0) {
        console.log('Content Types:');
        data.data.forEach(ct => {
          console.log(`  - ${ct.uid}: ${ct.apiID}`);
        });
      }
    }

    console.log('\n💡 The issue is that Content Types exist in the builder but REST routes are not generated.');
    console.log('   This usually means:');
    console.log('   1. Content Types are not properly saved in the database');
    console.log('   2. Strapi needs to be restarted to generate routes');
    console.log('   3. Permissions need to be set for the routes to work');
    console.log('\n📝 Solution:');
    console.log('   1. Go to Strapi Admin → Content-Type Builder');
    console.log('   2. For EACH content type: Click on it → Click "Save" (even if no changes)');
    console.log('   3. Restart Strapi completely');
    console.log('   4. Check bootstrap logs for permission setup');
    console.log('   5. Set permissions manually if needed: Settings → Users & Permissions → Roles → Public');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
