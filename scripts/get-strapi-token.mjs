const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || 'henning@wattweiser.com';
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'WattWelten180424.';

async function main() {
  try {
    // Login
    const loginRes = await fetch(`${STRAPI}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    
    // Get API Tokens
    const tokensRes = await fetch(`${STRAPI}/admin/api-tokens`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const tokensData = await tokensRes.json();
    
    console.log('API Tokens:');
    if (tokensData.data && tokensData.data.length > 0) {
      tokensData.data.forEach((t) => {
        console.log(`\nName: ${t.name}`);
        console.log(`Token: ${t.accessKey}`);
        console.log(`Type: ${t.type}`);
      });
    } else {
      console.log('No API tokens found.');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
