const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';

async function checkContentTypes() {
  try {
    // Prüfe ob Strapi läuft
    const health = await fetch(`${STRAPI}/_health`);
    if (!health.ok) {
      console.log('❌ Strapi is not running');
      return;
    }
    console.log('✅ Strapi is running');

    // Prüfe Content Types
    const contentTypes = ['scenes', 'assets', 'zones', 'portals', 'audio-beacons'];
    
    for (const type of contentTypes) {
      try {
        const r = await fetch(`${STRAPI}/api/${type}`);
        const status = r.status;
        if (status === 200 || status === 401 || status === 403) {
          console.log(`✅ ${type}: API endpoint exists (status: ${status})`);
        } else if (status === 404) {
          console.log(`⚠️  ${type}: Not found (404) - Content Type may not be registered`);
        } else {
          console.log(`❓ ${type}: Unexpected status ${status}`);
        }
      } catch (error) {
        console.log(`❌ ${type}: Error - ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkContentTypes();
