// Optimiertes Template Research Script
// Basierend auf Interview-Ergebnissen

const PLATFORMS = {
  sketchfab: {
    name: 'Sketchfab',
    url: 'https://sketchfab.com',
    search: 'https://sketchfab.com/search?q={query}&type=models&sort_by=-likeCount&features=downloadable&licenses=cc0,cc-by',
    license: 'CC0, CC-BY',
    format: 'GLTF/GLB',
    notes: 'Viele kostenlose Modelle, gute Qualität',
    priority: 1 // Höchste Priorität
  },
  polyhaven: {
    name: 'PolyHaven',
    url: 'https://polyhaven.com',
    search: 'https://polyhaven.com/models?q={query}',
    license: 'CC0',
    format: 'GLTF/GLB',
    notes: 'Hochwertige CC0-Modelle, auch HDRI verfügbar',
    priority: 1 // Höchste Priorität
  },
  cgtrader: {
    name: 'CGTrader',
    url: 'https://www.cgtrader.com',
    search: 'https://www.cgtrader.com/free-3d-models?keywords={query}',
    license: 'Kostenpflichtig, teilweise kostenlos',
    format: 'GLTF/GLB, FBX, OBJ',
    notes: 'Professionelle Modelle, Preise variieren',
    priority: 2 // Zweite Priorität (falls Budget erlaubt)
  },
  opengameart: {
    name: 'OpenGameArt',
    url: 'https://opengameart.org',
    search: 'https://opengameart.org/art-search-advanced?keys={query}&field_art_type_tid[]=3',
    license: 'CC0, CC-BY, GPL',
    format: 'GLTF/GLB, FBX, OBJ',
    notes: 'Kostenlose Spiele-Assets',
    priority: 2
  }
};

// Optimierte Suchbegriffe basierend auf Interview
const PRIORITY_SEARCH_TERMS = [
  // Höchste Priorität (direkt relevant)
  'outdoor meeting space',
  'forest event venue',
  'modern architecture nature',
  'outdoor conference area',
  'natural environment modern building',
  'forest landscape modern',
  'outdoor presentation space',
  
  // Zweite Priorität (verwandt)
  'nature environment',
  'forest landscape',
  'outdoor space',
  'modern building nature',
  'event venue outdoor',
  'conference outdoor',
  'meeting space nature',
  
  // Dritte Priorität (allgemein)
  'nature',
  'forest',
  'landscape',
  'outdoor',
  'environment',
  'garden',
  'park'
];

const TEMPLATE_REQUIREMENTS = {
  style: 'stylized', // Stylized mit photorealistischen Elementen
  theme: 'nature', // Natur + moderne Gebäude
  location: 'northwest germany', // Nordwest-Deutschland
  atmosphere: 'sunset', // Sonnenuntergang
  size: '< 50MB', // MVP-Größe
  format: 'GLTF/GLB',
  license: ['CC0', 'CC-BY'], // Kostenlos bevorzugt
  polygons: '< 500k Tris', // MVP-Performance
  textures: '< 100MB',
  budget: 'max 250€', // Gesamtes Template
  time: '1 week', // Sofort
  mustHave: [
    'natural landscape (forest, water, rocks)',
    'sunset atmosphere',
    'navigation mesh',
    'multiple zones',
    'interactive elements (benches, signs, screens)'
  ],
  mustNotHave: [
    'futuristic elements',
    'too many details',
    'large files (> 50MB)',
    'complex animations'
  ]
};

function generateOptimizedSearchUrls() {
  console.log('🔍 Optimierte Template-Recherche URLs\n');
  console.log('='.repeat(80));
  console.log('📋 Anforderungen:');
  console.log('='.repeat(80));
  console.log(`Stil: ${TEMPLATE_REQUIREMENTS.style}`);
  console.log(`Thema: ${TEMPLATE_REQUIREMENTS.theme}`);
  console.log(`Lokation: ${TEMPLATE_REQUIREMENTS.location}`);
  console.log(`Atmosphäre: ${TEMPLATE_REQUIREMENTS.atmosphere}`);
  console.log(`Größe: ${TEMPLATE_REQUIREMENTS.size}`);
  console.log(`Budget: ${TEMPLATE_REQUIREMENTS.budget}`);
  console.log(`Zeitplan: ${TEMPLATE_REQUIREMENTS.time}\n`);

  console.log('='.repeat(80));
  console.log('🔗 Direkte Search URLs (Priorisiert):');
  console.log('='.repeat(80));

  // Höchste Priorität: Sketchfab & PolyHaven
  console.log('\n⭐ HÖCHSTE PRIORITÄT (Kostenlos, CC0/CC-BY):\n');
  
  PRIORITY_SEARCH_TERMS.slice(0, 7).forEach((term, index) => {
    console.log(`\n${index + 1}. "${term}":`);
    console.log(`   Sketchfab: ${PLATFORMS.sketchfab.search.replace('{query}', encodeURIComponent(term))}`);
    console.log(`   PolyHaven: ${PLATFORMS.polyhaven.search.replace('{query}', encodeURIComponent(term))}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('📝 Recherche-Checkliste:');
  console.log('='.repeat(80));
  console.log('Für jeden Kandidaten prüfen:');
  console.log('  [ ] Realitätsnah (nicht futuristisch)');
  console.log('  [ ] Nordwest-Deutschland-Stil (Wald, Wasser, moderne Gebäude)');
  console.log('  [ ] Sonnenuntergangs-Atmosphäre möglich');
  console.log('  [ ] Klein bis Mittel (20-50m)');
  console.log('  [ ] Mehrere Zonen möglich');
  console.log('  [ ] Performance-optimiert (< 50MB, < 500k Tris)');
  console.log('  [ ] Lizenz: CC0/CC-BY (kostenlos)');
  console.log('  [ ] Format: GLTF/GLB');
  console.log('  [ ] Download-Link speichern');
  console.log('  [ ] Screenshot speichern');
  console.log('  [ ] Bewertung (1-5 Sterne)');
  console.log('  [ ] Pro/Contra notieren');

  console.log('\n' + '='.repeat(80));
  console.log('💰 Budget-Hinweis:');
  console.log('='.repeat(80));
  console.log('Maximal 250€ für gesamtes Template (inkl. Assets & Erstellung)');
  console.log('Fokus auf kostenlose Assets (CC0/CC-BY)');
  console.log('Falls kostenpflichtig: Preis notieren und Budget prüfen');

  console.log('\n' + '='.repeat(80));
  console.log('⏰ Zeitplan:');
  console.log('='.repeat(80));
  console.log('Sofort (innerhalb 1 Woche)');
  console.log('Designer: Extern über Fiverr');
}

function generateAssetDownloadLinks() {
  console.log('\n' + '='.repeat(80));
  console.log('📦 Asset-Download-Strategie:');
  console.log('='.repeat(80));
  console.log('\n1. HDRI (Sonnenuntergang):');
  console.log('   PolyHaven: https://polyhaven.com/hdris?q=sunset');
  console.log('   Empfohlene: "Sunset Forest", "Evening Road", "Spruit Sunrise"');
  
  console.log('\n2. 3D-Modelle (Wald, Gebäude, Bänke, Schilder):');
  console.log('   Sketchfab: https://sketchfab.com/search?q=forest+building&type=models&licenses=cc0,cc-by');
  console.log('   PolyHaven: https://polyhaven.com/models?q=forest');
  
  console.log('\n3. Ambient-Audio (Vögel, Wasser):');
  console.log('   Freesound: https://freesound.org/search/?q=birds+water&f=license:"Attribution"');
  console.log('   Zapsplat: https://www.zapsplat.com/category/nature/');
  
  console.log('\n4. Download-Ordner:');
  console.log('   Erstelle: ./template-research-downloads/');
  console.log('   Unterordner: hdri/, models/, audio/');
}

// Main
console.log('🚀 Optimierte Template-Recherche\n');
generateOptimizedSearchUrls();
generateAssetDownloadLinks();

console.log('\n' + '='.repeat(80));
console.log('📋 Nächste Schritte:');
console.log('='.repeat(80));
console.log('1. Öffne die Search URLs in Browser (Sketchfab & PolyHaven zuerst)');
console.log('2. Recherchiere Templates mit höchster Priorität');
console.log('3. Dokumentiere Kandidaten in docs/TEMPLATE_CANDIDATE_LIST.md');
console.log('4. Lade passende Assets herunter (HDRI, Modelle, Audio)');
console.log('5. Speichere Download-Links für spätere Verwendung');
console.log('6. Top 5 Kandidaten identifizieren');
console.log('7. Designer auf Fiverr suchen (Budget: max 250€)\n');
