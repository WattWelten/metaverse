const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || 'henning@wattweiser.com';
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'WattWelten180424.';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3001/api/content/refresh';

async function login() {
  const r = await fetch(`${STRAPI}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Login failed: ${r.status} ${text}`);
  }

  const data = await r.json();
  return data.data.token;
}

async function getWebhooks(token) {
  const r = await fetch(`${STRAPI}/admin/webhooks`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Failed to get webhooks: ${r.status} ${text.substring(0, 200)}`);
  }

  const data = await r.json();
  return Array.isArray(data) ? data : data.data || [];
}

async function createWebhook(token) {
  console.log('🔗 Creating Content Refresh Webhook...');

  // Prüfe ob Webhook bereits existiert
  const existing = await getWebhooks(token);
  const existingWebhook = existing.find((w) => w.name === 'Content Refresh' || w.url === WEBHOOK_URL);

  if (existingWebhook) {
    console.log(`✅ Webhook already exists (ID: ${existingWebhook.id})`);
    console.log(`   Name: ${existingWebhook.name}`);
    console.log(`   URL: ${existingWebhook.url}`);
    console.log(`   Events: ${existingWebhook.events?.join(', ') || 'N/A'}`);
    return existingWebhook;
  }

  const webhookData = {
    name: 'Content Refresh',
    url: WEBHOOK_URL,
    events: ['entry.publish', 'entry.unpublish', 'entry.update'],
    headers: {},
  };

  const r = await fetch(`${STRAPI}/admin/webhooks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(webhookData),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Failed to create webhook: ${r.status} ${text.substring(0, 200)}`);
  }

  const data = await r.json();
  console.log('✅ Webhook created successfully');
  console.log(`   ID: ${data.data?.id || data.id}`);
  console.log(`   Name: ${webhookData.name}`);
  console.log(`   URL: ${webhookData.url}`);
  console.log(`   Events: ${webhookData.events.join(', ')}`);
  
  return data.data || data;
}

async function testWebhook() {
  console.log('\n🧪 Testing webhook endpoint...');
  try {
    const r = await fetch(WEBHOOK_URL, {
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
    } else {
      console.log(`⚠️  Webhook endpoint returned ${r.status}`);
      console.log('   Make sure the server is running on port 3001');
    }
  } catch (error) {
    console.log(`⚠️  Could not reach webhook endpoint: ${error.message}`);
    console.log('   Make sure the server is running: cd apps/server && pnpm dev');
  }
}

async function main() {
  try {
    console.log(`🔍 Setting up Strapi webhook at ${STRAPI}...`);
    console.log(`   Target URL: ${WEBHOOK_URL}\n`);

    console.log(`🔐 Logging in as ${ADMIN_EMAIL}...`);
    const token = await login();
    console.log('✅ Logged in\n');

    const webhook = await createWebhook(token);

    await testWebhook();

    console.log('\n✅ Webhook setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Make sure the server is running: cd apps/server && pnpm dev');
    console.log('   2. Test by updating content in Strapi Admin');
    console.log('   3. Check server logs for webhook events');

  } catch (error) {
    console.error('❌ Failed:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main();
