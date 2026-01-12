const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';

console.log('📋 Strapi Bootstrap Logs Analysis\n');
console.log('💡 Bitte prüfe die Strapi-Logs im Terminal, wo Strapi läuft.\n');
console.log('   Suche nach folgenden Meldungen:\n');
console.log('   ✅ "✅ api::scene.scene is registered"');
console.log('   ⚠️  "⚠️  api::scene.scene is NOT registered"');
console.log('   ✅ "✅ Public API permissions configured automatically"\n');
console.log('📝 Wenn du "NOT registered" siehst:');
console.log('   → Content Types müssen im Admin-Panel gespeichert werden\n');
console.log('📝 Wenn du "registered" siehst, aber API gibt 404:');
console.log('   → Problem liegt bei Permissions oder API-Konfiguration\n');
console.log('🔍 Aktueller Status:\n');

// Teste API
const endpoints = ['scenes', 'assets', 'zones', 'portals', 'audio-beacons'];
for (const ep of endpoints) {
  try {
    const r = await fetch(`${STRAPI}/api/${ep}`);
    const icon = r.status === 404 ? '❌' : r.status === 200 ? '✅' : '⚠️';
    console.log(`   ${icon} /api/${ep}: ${r.status}`);
  } catch (error) {
    console.log(`   ❌ /api/${ep}: ERROR`);
  }
}

console.log('\n✅ Prüfe die Strapi-Logs für detaillierte Informationen!\n');
