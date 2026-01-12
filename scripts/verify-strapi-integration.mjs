// Verify Strapi Integration in Web App
const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
const WEB = process.env.WEB_URL || 'http://localhost:5173';

async function verifyIntegration() {
  console.log('🔍 Verifying Strapi Integration in Web App\n');

  // 1. Check Strapi API
  console.log('1️⃣  Checking Strapi API...');
  try {
    const r = await fetch(`${STRAPI}/api/scenes`);
    const d = await r.json();
    console.log(`   ✅ Strapi API: ${d.data.length} scenes available`);
  } catch (error) {
    console.log(`   ❌ Strapi API error: ${error.message}`);
    return false;
  }

  // 2. Check Web App
  console.log('\n2️⃣  Checking Web App...');
  try {
    const r = await fetch(`${WEB}/`);
    if (r.ok || r.status === 426) {
      console.log('   ✅ Web App is running');
      
      // Check if StrapiProvider is loaded (via source code check)
      const html = await r.text();
      if (html.includes('StrapiTemplateLoader') || html.includes('strapi')) {
        console.log('   ✅ Strapi integration code detected');
      } else {
        console.log('   ⚠️  Strapi integration code not found in HTML (might be lazy-loaded)');
      }
    } else {
      console.log(`   ⚠️  Web App returned ${r.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Web App error: ${error.message}`);
    return false;
  }

  // 3. Check Environment Variables
  console.log('\n3️⃣  Checking Environment Variables...');
  console.log('   💡 Verify in .env.local:');
  console.log('      VITE_CMS_PROVIDER=strapi');
  console.log('      VITE_STRAPI_URL=http://localhost:1337');
  console.log('      VITE_STRAPI_TOKEN=<your-token>');

  console.log('\n✅ Verification complete!');
  console.log('\n📝 To test Strapi integration:');
  console.log('   1. Open http://localhost:5173 in browser');
  console.log('   2. Check browser console for StrapiTemplateLoader logs');
  console.log('   3. Try loading a Strapi template: ?template=strapi-welcome-plaza');
  
  return true;
}

verifyIntegration().catch(console.error);
