import { readFileSync } from 'fs';
import { join } from 'path';

// Versuche direkt über PostgreSQL zu prüfen
// Aber wir haben keine direkte DB-Verbindung, also müssen wir einen anderen Weg finden

const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
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

async function checkViaGraphQL(token) {
  // Versuche GraphQL Endpoint
  try {
    const query = `
      query {
        __schema {
          types {
            name
          }
        }
      }
    `;
    
    const r = await fetch(`${STRAPI}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });
    
    if (r.ok) {
      const data = await r.json();
      return data;
    }
  } catch (error) {
    // GraphQL might not be enabled
  }
  return null;
}

async function main() {
  try {
    console.log('🔍 Checking Strapi Database Status\n');
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const token = await login();
    console.log('✅ Logged in\n');
    
    // Prüfe GraphQL
    console.log('📋 Checking GraphQL...');
    const graphqlData = await checkViaGraphQL(token);
    if (graphqlData) {
      console.log('  ✅ GraphQL is available');
      if (graphqlData.data?.__schema?.types) {
        const sceneType = graphqlData.data.__schema.types.find((t) => t.name?.includes('Scene'));
        console.log(`  Scene type found: ${sceneType ? 'YES' : 'NO'}`);
      }
    } else {
      console.log('  ⚠️  GraphQL not available or not enabled');
    }
    console.log('');
    
    // Finale Diagnose
    console.log('📝 FINALE DIAGNOSE:');
    console.log('');
    console.log('   Das Problem ist klar: Content Types existieren im Dateisystem,');
    console.log('   aber die REST-API-Routen werden nicht generiert.');
    console.log('');
    console.log('   ⚠️  MÖGLICHE URSACHEN:');
    console.log('   1. Content Types wurden im Builder gespeichert, aber nicht in der DB');
    console.log('   2. Strapi wurde nicht vollständig neu gestartet');
    console.log('   3. Es gibt ein Problem mit der Strapi-Konfiguration');
    console.log('   4. Content Types müssen möglicherweise anders strukturiert sein');
    console.log('');
    console.log('   ✅ LÖSUNG:');
    console.log('   1. Prüfe Strapi-Logs im Terminal (wo Strapi läuft)');
    console.log('   2. Suche nach Bootstrap-Logs: "✅ ... is registered" oder "⚠️  ... is NOT registered"');
    console.log('   3. Falls "NOT registered": Content Types müssen erneut gespeichert werden');
    console.log('   4. Falls "registered" aber API gibt 404: Problem liegt bei Permissions oder API-Konfiguration');
    console.log('');
    console.log('   💡 TIPP: Öffne das Strapi-Terminal und prüfe die Logs beim Start!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
