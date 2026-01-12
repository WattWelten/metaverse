// Template Research Script
// Recherchiert passende Templates auf verschiedenen Plattformen

const PLATFORMS = {
  sketchfab: {
    name: 'Sketchfab',
    url: 'https://sketchfab.com',
    search: 'https://sketchfab.com/search?q={query}&type=models&sort_by=-likeCount&features=downloadable&licenses=cc0,cc-by',
    license: 'CC0, CC-BY',
    format: 'GLTF/GLB',
    notes: 'Viele kostenlose Modelle, gute Qualität'
  },
  polyhaven: {
    name: 'PolyHaven',
    url: 'https://polyhaven.com',
    search: 'https://polyhaven.com/models?q={query}',
    license: 'CC0',
    format: 'GLTF/GLB',
    notes: 'Hochwertige CC0-Modelle, auch HDRI verfügbar'
  },
  cgtrader: {
    name: 'CGTrader',
    url: 'https://www.cgtrader.com',
    search: 'https://www.cgtrader.com/free-3d-models?keywords={query}',
    license: 'Kostenpflichtig, teilweise kostenlos',
    format: 'GLTF/GLB, FBX, OBJ',
    notes: 'Professionelle Modelle, Preise variieren'
  },
  turbosquid: {
    name: 'TurboSquid',
    url: 'https://www.turbosquid.com',
    search: 'https://www.turbosquid.com/Search/3D-Models/{query}',
    license: 'Kostenpflichtig',
    format: 'GLTF/GLB, FBX, OBJ',
    notes: 'Hochwertige kommerzielle Modelle'
  },
  opengameart: {
    name: 'OpenGameArt',
    url: 'https://opengameart.org',
    search: 'https://opengameart.org/art-search-advanced?keys={query}&field_art_type_tid[]=3',
    license: 'CC0, CC-BY, GPL',
    format: 'GLTF/GLB, FBX, OBJ',
    notes: 'Kostenlose Spiele-Assets'
  }
};

const SEARCH_TERMS = [
  'nature',
  'forest',
  'environment',
  'landscape',
  'outdoor',
  'sustainable',
  'energy',
  'renewable',
  'eco',
  'green',
  'meeting room',
  'conference',
  'plaza',
  'outdoor space',
  'garden',
  'park'
];

const TEMPLATE_REQUIREMENTS = {
  style: ['realistic', 'stylized', 'low-poly'],
  theme: ['nature', 'urban', 'futuristic', 'minimalist'],
  size: '< 50MB',
  format: 'GLTF/GLB',
  license: ['CC0', 'CC-BY', 'commercial'],
  polygons: '< 500k Tris',
  textures: '< 100MB'
};

function generateResearchReport() {
  console.log('🔍 Template Research Report\n');
  console.log('='.repeat(60));
  console.log('📋 Search Criteria:');
  console.log('='.repeat(60));
  console.log(`Style: ${TEMPLATE_REQUIREMENTS.style.join(', ')}`);
  console.log(`Theme: ${TEMPLATE_REQUIREMENTS.theme.join(', ')}`);
  console.log(`Size: ${TEMPLATE_REQUIREMENTS.size}`);
  console.log(`Format: ${TEMPLATE_REQUIREMENTS.format}`);
  console.log(`License: ${TEMPLATE_REQUIREMENTS.license.join(', ')}`);
  console.log(`Polygons: ${TEMPLATE_REQUIREMENTS.polygons}`);
  console.log(`Textures: ${TEMPLATE_REQUIREMENTS.textures}\n`);

  console.log('='.repeat(60));
  console.log('🌐 Platforms to Research:');
  console.log('='.repeat(60));
  
  Object.entries(PLATFORMS).forEach(([key, platform]) => {
    console.log(`\n📦 ${platform.name}`);
    console.log(`   URL: ${platform.url}`);
    console.log(`   License: ${platform.license}`);
    console.log(`   Format: ${platform.format}`);
    console.log(`   Notes: ${platform.notes}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('🔎 Search Terms:');
  console.log('='.repeat(60));
  SEARCH_TERMS.forEach((term, i) => {
    console.log(`   ${i + 1}. ${term}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('📝 Research Checklist:');
  console.log('='.repeat(60));
  console.log('For each platform:');
  console.log('  [ ] Search with all search terms');
  console.log('  [ ] Filter by license (CC0, CC-BY preferred)');
  console.log('  [ ] Filter by format (GLTF/GLB preferred)');
  console.log('  [ ] Check file size (< 50MB)');
  console.log('  [ ] Check polygon count (< 500k Tris)');
  console.log('  [ ] Screenshot/Video speichern');
  console.log('  [ ] Preis notieren (falls kostenpflichtig)');
  console.log('  [ ] Lizenz-Details dokumentieren');
  console.log('  [ ] Download-Link speichern');

  console.log('\n' + '='.repeat(60));
  console.log('✅ Deliverable:');
  console.log('='.repeat(60));
  console.log('Template-Candidate-Liste mit:');
  console.log('  - Name & Beschreibung');
  console.log('  - Screenshot/Video');
  console.log('  - Preis & Lizenz');
  console.log('  - Download-Link');
  console.log('  - Bewertung (1-5 Sterne)');
  console.log('  - Pro/Contra');
}

function generateSearchUrls() {
  console.log('\n' + '='.repeat(60));
  console.log('🔗 Direct Search URLs:');
  console.log('='.repeat(60));
  
  SEARCH_TERMS.slice(0, 5).forEach(term => {
    console.log(`\n🔍 "${term}":`);
    Object.entries(PLATFORMS).forEach(([key, platform]) => {
      if (platform.search) {
        const url = platform.search.replace('{query}', term);
        console.log(`   ${platform.name}: ${url}`);
      }
    });
  });
}

// Main
console.log('🚀 Template Research Script\n');
generateResearchReport();
generateSearchUrls();

console.log('\n' + '='.repeat(60));
console.log('📋 Next Steps:');
console.log('='.repeat(60));
console.log('1. Öffne die Search URLs in Browser');
console.log('2. Recherchiere Templates auf jeder Plattform');
console.log('3. Dokumentiere Kandidaten in Template-Candidate-Liste');
console.log('4. Führe Designer-Interview durch (siehe TEMPLATE_INTERVIEW.md)');
console.log('5. Finale Template-Auswahl treffen\n');
