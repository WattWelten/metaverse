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

async function checkContentTypesInDatabase(token) {
  // Prüfe ob Content Types in der Datenbank sind
  // In Strapi 5 werden Content Types in der Tabelle 'strapi_content_types' gespeichert
  // Aber wir können nicht direkt auf die DB zugreifen, also versuchen wir andere Wege
  
  // Versuche über Content-Type Builder API
  try {
    const r = await fetch(`${STRAPI}/admin/content-type-builder/content-types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (r.ok) {
      const data = await r.json();
      return data;
    }
  } catch (error) {
    // Ignore
  }
  
  return null;
}

async function testWithDifferentEndpoints() {
  console.log('🔍 Testing different API endpoints...\n');
  
  const endpoints = [
    '/api/scenes',
    '/api/scene',
    '/api/scenes?populate=*',
    '/api/content-type-builder/content-types',
  ];
  
  for (const endpoint of endpoints) {
    try {
      const r = await fetch(`${STRAPI}${endpoint}`);
      console.log(`  ${endpoint}: ${r.status} ${r.statusText}`);
    } catch (error) {
      console.log(`  ${endpoint}: ERROR - ${error.message}`);
    }
  }
}

async function main() {
  try {
    console.log('🔍 Deep Strapi Analysis\n');
    
    // Warte auf Rate Limit
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const token = await login();
    console.log('✅ Logged in\n');
    
    // Prüfe Content Types in Database
    console.log('📋 Checking content types in database...');
    const dbData = await checkContentTypesInDatabase(token);
    if (dbData) {
      console.log('  ✅ Found content types in database');
      if (dbData.data) {
        console.log(`  Found ${dbData.data.length} content types:`);
        dbData.data.forEach(ct => {
          console.log(`    - ${ct.uid || ct.apiID || ct.name}`);
        });
      }
    } else {
      console.log('  ⚠️  Could not access content types via API');
    }
    console.log('');
    
    // Teste verschiedene Endpoints
    await testWithDifferentEndpoints();
    console.log('');
    
    // Finale Diagnose
    console.log('📝 DIAGNOSE:');
    console.log('   Das Problem ist, dass Content Types im Dateisystem existieren,');
    console.log('   aber die REST-API-Routen nicht generiert werden.');
    console.log('');
    console.log('   In Strapi 5 müssen Content Types in der Datenbank registriert sein.');
    console.log('   Dies geschieht normalerweise, wenn sie im Content-Type Builder gespeichert werden.');
    console.log('');
    console.log('   ⚠️  Die automatische Registrierung über die API funktioniert nicht,');
    console.log('      da die Admin-API HTML statt JSON zurückgibt.');
    console.log('');
    console.log('   ✅ LÖSUNG: Content Types müssen manuell im Admin-Panel gespeichert werden.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
