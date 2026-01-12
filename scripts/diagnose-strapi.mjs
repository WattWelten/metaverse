const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';

async function testEndpoint(path, method = 'GET', token = null) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const r = await fetch(`${STRAPI}${path}`, {
      method,
      headers,
    });

    return {
      status: r.status,
      ok: r.ok,
      contentType: r.headers.get('content-type'),
      text: await r.text().catch(() => ''),
    };
  } catch (error) {
    return {
      error: error.message,
    };
  }
}

async function main() {
  console.log('🔍 Strapi Diagnosis\n');
  console.log(`📍 Strapi URL: ${STRAPI}\n`);

  // 1. Health Check
  console.log('1️⃣  Health Check...');
  const health = await testEndpoint('/_health');
  console.log(`   Status: ${health.status || 'ERROR'}`);
  if (health.ok) {
    console.log('   ✅ Strapi is running\n');
  } else {
    console.log('   ❌ Strapi is not responding\n');
    return;
  }

  // 2. Test Content Type Endpoints
  console.log('2️⃣  Testing Content Type Endpoints...');
  const endpoints = [
    '/api/scenes',
    '/api/assets',
    '/api/zones',
    '/api/portals',
    '/api/audio-beacons',
  ];

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    const icon = result.status === 404 ? '❌' : result.status === 200 ? '✅' : '⚠️';
    console.log(`   ${icon} ${endpoint}: ${result.status || result.error}`);
  }
  console.log('');

  // 3. Diagnosis
  console.log('3️⃣  Diagnosis:\n');
  
  const all404 = endpoints.every(async (ep) => {
    const r = await testEndpoint(ep);
    return r.status === 404;
  });

  if (all404) {
    console.log('   ❌ PROBLEM: All endpoints return 404');
    console.log('   \n   📝 ROOT CAUSE:');
    console.log('      Content Types exist in Content-Type Builder but REST API routes are not generated.');
    console.log('   \n   ✅ SOLUTION:');
    console.log('      1. Open Strapi Admin: http://localhost:1337/admin');
    console.log('      2. Go to: Content-Type Builder');
    console.log('      3. For EACH content type (Scene, Asset, Zone, Portal, Audio-Beacon):');
    console.log('         - Click on the content type');
    console.log('         - Click "Save" button (top right)');
    console.log('         - Wait for confirmation');
    console.log('      4. Restart Strapi completely:');
    console.log('         - Stop: Ctrl+C in Strapi terminal');
    console.log('         - Start: cd strapi/app && npm run develop');
    console.log('      5. Wait for Strapi to fully start (check logs for "✅ Public API permissions")');
    console.log('      6. Set permissions manually if needed:');
    console.log('         Settings → Users & Permissions → Roles → Public');
    console.log('         Enable "find" and "findOne" for all content types');
    console.log('      7. Test: curl http://localhost:1337/api/scenes');
  } else {
    console.log('   ✅ Some endpoints are working!');
  }

  console.log('\n✅ Diagnosis complete\n');
}

main();
