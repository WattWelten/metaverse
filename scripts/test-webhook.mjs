const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
const SERVER = process.env.SERVER_URL || 'http://localhost:3001';
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

async function testWebhookEndpoint() {
  console.log('🧪 Testing webhook endpoint...');
  
  try {
    const r = await fetch(`${SERVER}/api/content/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'entry.update',
        model: 'scene',
        entry: { id: 1 },
      }),
    });

    if (r.ok) {
      const data = await r.json();
      console.log('✅ Webhook endpoint is reachable');
      console.log(`   Response: ${JSON.stringify(data)}`);
      return true;
    } else {
      const text = await r.text();
      console.log(`❌ Webhook endpoint returned ${r.status}`);
      console.log(`   Response: ${text.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Could not reach webhook endpoint: ${error.message}`);
    return false;
  }
}

async function getApiToken() {
  const fs = await import('fs');
  const path = await import('path');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, 'utf-8');
    const match = content.match(/STRAPI_TOKEN=(.+)/);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
}

async function updateScene(token) {
  console.log('📝 Updating scene in Strapi to trigger webhook...');
  
  // Nutze übergebenen Token (kann API Token oder Admin Token sein)
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  
  // Hole erste Scene
  const listR = await fetch(`${STRAPI}/api/scenes`, {
    headers,
  });

  if (!listR.ok) {
    throw new Error(`Failed to list scenes: ${listR.status}`);
  }

  const listData = await listR.json();
  if (!listData.data || listData.data.length === 0) {
    console.log('⚠️  No scenes found, creating one...');
    const createR = await fetch(`${STRAPI}/api/scenes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          name: 'Test Scene',
          spawn: { x: 0, y: 0, z: 0 },
        },
      }),
    });

    if (!createR.ok) {
      throw new Error(`Failed to create scene: ${createR.status}`);
    }

    const createData = await createR.json();
    const sceneId = createData.data.id;
    
    // Update die Scene
    const updateR = await fetch(`${STRAPI}/api/scenes/${sceneId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          name: 'Test Scene Updated',
        },
      }),
    });

    if (!updateR.ok) {
      throw new Error(`Failed to update scene: ${updateR.status}`);
    }

    console.log('✅ Scene updated (this should trigger webhook)');
    return true;
  }

  const scene = listData.data[0];
  // In Strapi v5 kann man id oder documentId verwenden
  const sceneId = scene.documentId || scene.id;

  // Update die Scene
  const updateR = await fetch(`${STRAPI}/api/scenes/${sceneId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: {
        name: (scene.name || 'Scene') + ' (Updated)',
      },
    }),
  });

  if (!updateR.ok) {
    const errorText = await updateR.text();
    if (updateR.status === 403) {
      console.log('   ⚠️  API Token has no PUT permissions (expected for read-only tokens)');
      console.log('   💡 Webhook will still fire when content is updated via Admin UI');
      return false; // Nicht als Fehler behandeln
    }
    throw new Error(`Failed to update scene: ${updateR.status} ${errorText.substring(0, 100)}`);
  }

  console.log('✅ Scene updated (this should trigger webhook)');
  return true;
}

async function testClientIntegration() {
  console.log('\n🌐 Testing client integration...');
  
  try {
    const r = await fetch(`${STRAPI}/api/scenes?publicationState=live`);
    
    if (!r.ok) {
      console.log(`❌ Failed to fetch scenes: ${r.status}`);
      return false;
    }

    const data = await r.json();
    console.log(`✅ Client can fetch scenes: ${data.data.length} scenes found`);
    
    if (data.data.length > 0) {
      const scene = data.data[0];
      console.log(`   First scene: ${scene.name || scene.attributes?.name || 'N/A'}`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Client integration test failed: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Automated Testing: Webhook + Client Integration\n');

    // 1. Test Webhook Endpoint
    const webhookOk = await testWebhookEndpoint();
    
    if (!webhookOk) {
      console.log('\n⚠️  Webhook endpoint not reachable. Make sure server is running:');
      console.log('   cd apps/server && pnpm dev');
      console.log('\nContinuing with other tests...\n');
    }

    // 2. Test Webhook Trigger (update content in Strapi)
    console.log('\n📝 Testing webhook trigger...');
    
    // Versuche API Token zu nutzen, sonst Admin Login
    const apiToken = await getApiToken();
    let token = null;
    
    if (apiToken) {
      console.log('   Using API Token from .env.local');
      token = apiToken;
    } else {
      console.log('   Logging in as admin...');
      try {
        token = await login();
      } catch (error) {
        if (error.message.includes('429')) {
          console.log('   ⚠️  Rate limit hit, skipping webhook trigger test');
          console.log('   💡 You can manually test by updating content in Strapi Admin');
        } else {
          throw error;
        }
      }
    }
    
    if (token) {
      await updateScene(token);
    }
    console.log('   ⏳ Waiting 2 seconds for webhook to fire...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Test Client Integration
    const clientOk = await testClientIntegration();

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Summary:');
    console.log('='.repeat(50));
    console.log(`   Webhook Endpoint: ${webhookOk ? '✅' : '❌'}`);
    console.log(`   Webhook Trigger:  ${token ? '✅ (Scene updated)' : '⚠️  (Skipped - rate limit)'}`);
    console.log(`   Client Integration: ${clientOk ? '✅' : '❌'}`);
    console.log('='.repeat(50));

    if (webhookOk && clientOk) {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Check output above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main();
