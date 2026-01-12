const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || 'henning@wattweiser.com';
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'WattWelten180424.';

const CONTENT_TYPES = [
  { api: 'api::scene.scene', plural: 'scenes' },
  { api: 'api::asset.asset', plural: 'assets' },
  { api: 'api::zone.zone', plural: 'zones' },
  { api: 'api::portal.portal', plural: 'portals' },
  { api: 'api::audio-beacon.audio-beacon', plural: 'audio-beacons' },
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

async function testEndpoint(plural, token = null) {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const r = await fetch(`${STRAPI}/api/${plural}`, { headers });
    return {
      status: r.status,
      ok: r.ok || r.status === 401 || r.status === 403,
      text: (await r.text()).substring(0, 200),
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function main() {
  console.log('🔍 Final Strapi Check\n');

  try {
    // 1. Health Check
    const health = await fetch(`${STRAPI}/_health`);
    if (!health.ok) {
      console.log('❌ Strapi is not running\n');
      return;
    }
    console.log('✅ Strapi is running\n');

    // 2. Login
    await new Promise(resolve => setTimeout(resolve, 5000)); // Rate limit
    const token = await login();
    console.log('✅ Logged in\n');

    // 3. Test alle Endpoints
    console.log('📋 Testing API Endpoints:\n');
    const results = [];
    
    for (const { api, plural } of CONTENT_TYPES) {
      // Test ohne Token
      const resultNoToken = await testEndpoint(plural);
      
      // Test mit Token
      const resultWithToken = await testEndpoint(plural, token);
      
      results.push({ api, plural, resultNoToken, resultWithToken });
      
      const icon = resultNoToken.ok ? '✅' : resultWithToken.ok ? '🔒' : '❌';
      const status = resultNoToken.ok ? resultNoToken.status : resultWithToken.ok ? resultWithToken.status : resultNoToken.status;
      
      console.log(`  ${icon} /api/${plural}: ${status}`);
      
      if (resultNoToken.ok || resultWithToken.ok) {
        console.log(`     ✅ ENDPOINT FUNKTIONIERT!`);
      } else {
        console.log(`     ❌ Endpoint gibt 404 zurück`);
      }
    }

    console.log('');

    // 4. Zusammenfassung
    const working = results.filter(r => r.resultNoToken.ok || r.resultWithToken.ok).length;
    const total = results.length;

    if (working === total) {
      console.log('✅ ALLE Content Types funktionieren!\n');
      console.log('📝 Nächste Schritte:');
      console.log('   1. Permissions sollten automatisch gesetzt sein');
      console.log('   2. Seeds ausführen: node scripts/seed-strapi.mjs\n');
      return;
    } else if (working > 0) {
      console.log(`⚠️  ${working}/${total} Content Types funktionieren\n`);
      console.log('📝 Fehlende Content Types müssen im Admin-Panel gespeichert werden\n');
    } else {
      console.log('❌ KEINE Content Types funktionieren\n');
      console.log('📝 PROBLEM:');
      console.log('   Content Types sind nicht in der Datenbank registriert.');
      console.log('   In Strapi 5 müssen Content Types im Content-Type Builder gespeichert werden,');
      console.log('   damit die REST-API-Routen generiert werden.\n');
      console.log('📝 LÖSUNG:');
      console.log('   1. Öffne: http://localhost:1337/admin');
      console.log('   2. Gehe zu: Content-Type Builder');
      console.log('   3. Für JEDEN Content Type:');
      console.log('      - Klicke auf den Content Type');
      console.log('      - Klicke oben rechts auf "Save"');
      console.log('      - Warte auf Bestätigung');
      console.log('   4. Starte Strapi neu');
      console.log('   5. Führe dieses Script erneut aus\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
