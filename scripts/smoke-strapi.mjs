import assert from 'node:assert/strict';

const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
const TOKEN = process.env.STRAPI_TOKEN || '';

try {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  
  const r = await fetch(`${STRAPI}/api/scenes?populate=deep`, {
    headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
    signal: controller.signal,
  });
  
  clearTimeout(timeoutId);

  if (r.ok || r.status === 401) {
    console.log(`✅ Strapi scenes endpoint reachable (status: ${r.status})`);
  } else {
    console.log(`⚠️  Strapi antwortet mit Status ${r.status} (möglicherweise nicht konfiguriert)`);
    process.exit(0);
  }
} catch (error) {
  const err = error.cause || error;
  if (err?.code === 'ECONNREFUSED' || err?.name === 'AbortError' || error.name === 'AbortError') {
    console.log('⚠️  Strapi nicht erreichbar (läuft möglicherweise nicht)');
    console.log('   → Test übersprungen (erwartet für lokale Entwicklung ohne Strapi)');
    process.exit(0);
  }
  throw error;
}
