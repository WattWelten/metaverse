import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || 'henning@wattweiser.com';
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'WattWelten180424.';

// Lade .env.local für API Token
const envLocalPath = join(process.cwd(), '.env.local');
let API_TOKEN = process.env.STRAPI_TOKEN;
if (!API_TOKEN && existsSync(envLocalPath)) {
  const envContent = readFileSync(envLocalPath, 'utf-8');
  const match = envContent.match(/STRAPI_TOKEN=(.+)/);
  if (match) {
    API_TOKEN = match[1].trim();
  }
}

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

async function testApiEndpoint(plural, useToken = false) {
  try {
    const headers = {};
    if (useToken && API_TOKEN) {
      headers['Authorization'] = `Bearer ${API_TOKEN}`;
    }

    const r = await fetch(`${STRAPI}/api/${plural}`, { headers });
    const status = r.status;
    const text = await r.text();
    
    return { status, text: text.substring(0, 200), ok: r.ok };
  } catch (error) {
    return { error: error.message };
  }
}

async function main() {
  console.log('🚀 Strapi Step-by-Step Check\n');

  // Schritt 1: Strapi Health
  console.log('📋 Schritt 1: Strapi Health Check');
  try {
    const health = await fetch(`${STRAPI}/_health`);
    if (health.ok) {
      console.log('   ✅ Strapi läuft\n');
    } else {
      console.log('   ❌ Strapi antwortet nicht\n');
      return;
    }
  } catch (error) {
    console.log('   ❌ Strapi ist nicht erreichbar\n');
    return;
  }

  // Schritt 2: API Endpoints ohne Token
  console.log('📋 Schritt 2: API Endpoints testen (ohne Token)');
  let all404 = true;
  for (const { plural } of CONTENT_TYPES) {
    const result = await testApiEndpoint(plural, false);
    const icon = result.status === 404 ? '❌' : result.status === 200 ? '✅' : result.status === 401 || result.status === 403 ? '🔒' : '⚠️';
    console.log(`   ${icon} /api/${plural}: ${result.status || result.error}`);
    if (result.status !== 404) {
      all404 = false;
    }
  }
  console.log('');

  if (all404) {
    console.log('❌ PROBLEM: Alle Endpoints geben 404 zurück');
    console.log('   Das bedeutet: Content Types sind nicht in der Datenbank registriert.\n');
    console.log('📝 LÖSUNG:');
    console.log('   1. Öffne Strapi Admin: http://localhost:1337/admin');
    console.log('   2. Gehe zu: Content-Type Builder');
    console.log('   3. Für JEDEN Content Type (Scene, Asset, Zone, Portal, Audio-Beacon):');
    console.log('      - Klicke auf den Content Type');
    console.log('      - Klicke oben rechts auf "Save"');
    console.log('      - Warte auf Bestätigung');
    console.log('   4. Starte Strapi neu');
    console.log('   5. Führe dieses Script erneut aus\n');
    return;
  }

  // Schritt 3: API Endpoints mit Token
  console.log('📋 Schritt 3: API Endpoints testen (mit Token)');
  if (!API_TOKEN) {
    console.log('   ⚠️  Kein API Token gefunden in .env.local');
    console.log('   ℹ️  Token wird nicht benötigt, wenn Permissions gesetzt sind\n');
  } else {
    console.log('   ✅ API Token gefunden\n');
    for (const { plural } of CONTENT_TYPES) {
      const result = await testApiEndpoint(plural, true);
      const icon = result.status === 200 ? '✅' : result.status === 401 || result.status === 403 ? '🔒' : result.status === 404 ? '❌' : '⚠️';
      console.log(`   ${icon} /api/${plural}: ${result.status || result.error}`);
    }
    console.log('');
  }

  // Schritt 4: Permissions prüfen
  console.log('📋 Schritt 4: Permissions Status');
  console.log('   ℹ️  Bootstrap-Script sollte Permissions automatisch setzen');
  console.log('   ℹ️  Prüfe Strapi-Logs für: "✅ Public API permissions configured"');
  console.log('   ℹ️  Falls nicht: Settings → Users & Permissions → Roles → Public\n');

  // Schritt 5: Seeds ausführen
  console.log('📋 Schritt 5: Seeds ausführen');
  const workingEndpoints = CONTENT_TYPES.filter(async (ct) => {
    const r = await testApiEndpoint(ct.plural, true);
    return r.status === 200 || r.status === 401 || r.status === 403;
  });

  if (workingEndpoints.length > 0 || !all404) {
    console.log('   ✅ API Endpoints funktionieren - Seeds können ausgeführt werden');
    console.log('   💡 Führe aus: node scripts/seed-strapi.mjs\n');
  } else {
    console.log('   ⚠️  API Endpoints funktionieren noch nicht');
    console.log('   ⚠️  Seeds können noch nicht ausgeführt werden\n');
  }

  console.log('✅ Step-by-Step Check abgeschlossen\n');
}

main();
