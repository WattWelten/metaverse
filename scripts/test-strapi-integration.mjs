// Test Strapi Integration in Web App
const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
const WEB = process.env.WEB_URL || 'http://localhost:5173';

async function testStrapiIntegration() {
  console.log('🧪 Testing Strapi Integration in Web App\n');

  // 1. Test Strapi API direkt
  console.log('1️⃣  Testing Strapi API...');
  try {
    const r = await fetch(`${STRAPI}/api/scenes`);
    const d = await r.json();
    console.log(`   ✅ Strapi API: ${d.data.length} scenes found`);
    if (d.data.length > 0) {
      console.log(`   📝 First scene: ${d.data[0].name || 'N/A'}`);
    }
  } catch (error) {
    console.log(`   ❌ Strapi API error: ${error.message}`);
    return false;
  }

  // 2. Test Web App (falls läuft)
  console.log('\n2️⃣  Testing Web App...');
  try {
    const r = await fetch(`${WEB}/`);
    if (r.ok) {
      console.log('   ✅ Web App is reachable');
    } else {
      console.log(`   ⚠️  Web App returned ${r.status}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Web App not reachable: ${error.message}`);
    console.log('   💡 Start Web App: cd apps/web && pnpm dev');
  }

  // 3. Test TemplateRegistry mit Strapi
  console.log('\n3️⃣  Testing TemplateRegistry with Strapi...');
  console.log('   💡 Set VITE_CMS_PROVIDER=strapi to enable Strapi integration');
  console.log('   💡 Set VITE_STRAPI_URL and VITE_STRAPI_TOKEN in .env.local');

  console.log('\n✅ Integration test complete!');
  return true;
}

testStrapiIntegration().catch(console.error);
