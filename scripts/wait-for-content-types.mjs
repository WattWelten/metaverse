const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';

const CONTENT_TYPES = ['scenes', 'assets', 'zones', 'portals', 'audio-beacons'];

async function testEndpoint(plural) {
  try {
    const r = await fetch(`${STRAPI}/api/${plural}`);
    return { status: r.status, ok: r.ok || r.status === 401 || r.status === 403 };
  } catch {
    return { status: null, ok: false };
  }
}

async function checkAllEndpoints() {
  const results = [];
  for (const plural of CONTENT_TYPES) {
    const result = await testEndpoint(plural);
    results.push({ plural, ...result });
  }
  return results;
}

async function main() {
  console.log('⏳ Warte auf Content Types...\n');
  console.log('💡 Bitte speichere alle Content Types im Strapi Admin:\n');
  console.log('   1. Öffne: http://localhost:1337/admin');
  console.log('   2. Gehe zu: Content-Type Builder');
  console.log('   3. Für JEDEN Content Type: Klicke darauf → "Save"\n');
  console.log('🔄 Prüfe alle 5 Sekunden...\n');

  let attempt = 0;
  const maxAttempts = 60; // 5 Minuten

  while (attempt < maxAttempts) {
    attempt++;
    
    const results = await checkAllEndpoints();
    const working = results.filter(r => r.ok).length;
    const total = results.length;

    process.stdout.write(`\r   Versuch ${attempt}/${maxAttempts}: ${working}/${total} Endpoints funktionieren...`);

    if (working === total) {
      console.log('\n\n✅ ALLE Content Types sind jetzt registriert!\n');
      
      console.log('📋 Status:');
      results.forEach(r => {
        const icon = r.ok ? '✅' : '❌';
        console.log(`   ${icon} /api/${r.plural}: ${r.status || 'ERROR'}`);
      });
      
      console.log('\n📝 Nächste Schritte:');
      console.log('   1. Permissions sollten automatisch gesetzt sein (Bootstrap-Script)');
      console.log('   2. Falls nicht: Settings → Users & Permissions → Roles → Public');
      console.log('   3. Seeds ausführen: node scripts/seed-strapi.mjs\n');
      
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log('\n\n⏱️  Timeout erreicht. Bitte prüfe manuell:\n');
  console.log('   1. Sind alle Content Types im Admin-Panel gespeichert?');
  console.log('   2. Wurde Strapi nach dem Speichern neu gestartet?');
  console.log('   3. Prüfe Strapi-Logs für Fehler\n');
}

main();
