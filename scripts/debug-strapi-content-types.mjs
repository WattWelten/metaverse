const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || 'henning@wattweiser.com';
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'WattWelten180424.';

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

async function checkContentTypeBuilder(token) {
  // Prüfe Content-Type Builder direkt
  try {
    const r = await fetch(`${STRAPI}/admin/content-type-builder/content-types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (r.ok) {
      const data = await r.json();
      return data;
    } else {
      const text = await r.text();
      return { error: `Status ${r.status}: ${text.substring(0, 200)}` };
    }
  } catch (error) {
    return { error: error.message };
  }
}

async function testAllVariations() {
  console.log('🔍 Testing all API variations...\n');
  
  const variations = [
    '/api/scenes',
    '/api/scene',
    '/api/Scene',
    '/api/Scenes',
    '/api/content-types/scenes',
    '/api/content-types/scene',
  ];
  
  for (const path of variations) {
    try {
      const r = await fetch(`${STRAPI}${path}`);
      console.log(`  ${path}: ${r.status} ${r.statusText}`);
      if (r.status !== 404) {
        const text = await r.text();
        console.log(`    Response: ${text.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`  ${path}: ERROR - ${error.message}`);
    }
  }
}

async function main() {
  try {
    console.log('🔍 Deep Debug: Strapi Content Types\n');
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const token = await login();
    console.log('✅ Logged in\n');
    
    // Prüfe Content-Type Builder
    console.log('📋 Checking Content-Type Builder...');
    const builderData = await checkContentTypeBuilder(token);
    if (builderData.error) {
      console.log(`  ❌ Error: ${builderData.error}\n`);
    } else if (builderData.data) {
      console.log(`  ✅ Found ${builderData.data.length} content types in builder:`);
      builderData.data.forEach(ct => {
        console.log(`    - ${ct.uid || ct.apiID || ct.name || JSON.stringify(ct).substring(0, 50)}`);
      });
      console.log('');
    } else {
      console.log('  ⚠️  No data returned\n');
    }
    
    // Teste alle Variationen
    await testAllVariations();
    console.log('');
    
    // Prüfe ob es ein Problem mit der API-Konfiguration gibt
    console.log('📋 Checking API configuration...');
    try {
      const apiConfig = await fetch(`${STRAPI}/api`, { headers: { Authorization: `Bearer ${token}` } });
      console.log(`  /api: ${apiConfig.status}`);
    } catch (error) {
      console.log(`  /api: ERROR - ${error.message}`);
    }
    console.log('');
    
    console.log('💡 Mögliche Ursachen:');
    console.log('   1. Content Types wurden gespeichert, aber Strapi wurde nicht vollständig neu gestartet');
    console.log('   2. Content Types sind in der Datenbank, aber Routen wurden nicht generiert');
    console.log('   3. Es gibt ein Problem mit der Strapi-Konfiguration');
    console.log('   4. Content Types müssen möglicherweise veröffentlicht werden');
    console.log('');
    console.log('📝 Nächste Schritte:');
    console.log('   1. Prüfe Strapi-Logs (im Terminal wo Strapi läuft)');
    console.log('   2. Suche nach: "✅ ... is registered" oder "⚠️  ... is NOT registered"');
    console.log('   3. Falls "NOT registered": Content Types müssen erneut gespeichert werden');
    console.log('   4. Falls "registered": Problem liegt woanders (Permissions oder API-Konfiguration)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
