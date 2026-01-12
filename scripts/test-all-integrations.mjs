// Comprehensive Integration Test: Strapi + Web App + Performance
const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
const SERVER = process.env.SERVER_URL || 'http://localhost:3001';
const WEB = process.env.WEB_URL || 'http://localhost:5173';

async function testStrapi() {
  console.log('1️⃣  Testing Strapi API...');
  try {
    const r = await fetch(`${STRAPI}/api/scenes`);
    const d = await r.json();
    console.log(`   ✅ Strapi: ${d.data.length} scenes`);
    return { ok: true, scenes: d.data.length };
  } catch (error) {
    console.log(`   ❌ Strapi error: ${error.message}`);
    return { ok: false };
  }
}

async function testServer() {
  console.log('\n2️⃣  Testing Server...');
  try {
    const r = await fetch(`${SERVER}/`);
    if (r.ok) {
      console.log('   ✅ Server is reachable');
      return { ok: true };
    } else {
      console.log(`   ⚠️  Server returned ${r.status}`);
      return { ok: false };
    }
  } catch (error) {
    console.log(`   ⚠️  Server not reachable: ${error.message}`);
    return { ok: false };
  }
}

async function testWebhook() {
  console.log('\n3️⃣  Testing Webhook...');
  try {
    const r = await fetch(`${SERVER}/api/content/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'entry.update', model: 'scene', entry: { id: 1 } }),
    });
    if (r.ok) {
      const d = await r.json();
      console.log('   ✅ Webhook endpoint works');
      return { ok: true };
    } else {
      console.log(`   ⚠️  Webhook returned ${r.status}`);
      return { ok: false };
    }
  } catch (error) {
    console.log(`   ⚠️  Webhook error: ${error.message}`);
    return { ok: false };
  }
}

async function testWebApp() {
  console.log('\n4️⃣  Testing Web App...');
  try {
    const r = await fetch(`${WEB}/`);
    if (r.ok || r.status === 426) {
      console.log('   ✅ Web App is reachable');
      return { ok: true };
    } else {
      console.log(`   ⚠️  Web App returned ${r.status}`);
      return { ok: false };
    }
  } catch (error) {
    console.log(`   ⚠️  Web App not reachable: ${error.message}`);
    console.log('   💡 Start Web App: cd apps/web && pnpm dev');
    return { ok: false };
  }
}

async function main() {
  console.log('🚀 Comprehensive Integration Test\n');
  console.log('='.repeat(50));
  
  const results = {
    strapi: await testStrapi(),
    server: await testServer(),
    webhook: await testWebhook(),
    webApp: await testWebApp(),
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  console.log('='.repeat(50));
  console.log(`   Strapi API:     ${results.strapi.ok ? '✅' : '❌'}`);
  console.log(`   Server:         ${results.server.ok ? '✅' : '⚠️'}`);
  console.log(`   Webhook:        ${results.webhook.ok ? '✅' : '⚠️'}`);
  console.log(`   Web App:        ${results.webApp.ok ? '✅' : '⚠️'}`);
  console.log('='.repeat(50));
  
  if (results.strapi.ok && results.server.ok && results.webhook.ok) {
    console.log('\n✅ Core integration working!');
    console.log('\n📝 Next steps:');
    console.log('   1. Set VITE_CMS_PROVIDER=strapi in .env.local');
    console.log('   2. Set VITE_STRAPI_URL and VITE_STRAPI_TOKEN');
    console.log('   3. Start Web App: cd apps/web && pnpm dev');
    console.log('   4. Test in browser: http://localhost:5173');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some services are not running');
    process.exit(1);
  }
}

main().catch(console.error);
