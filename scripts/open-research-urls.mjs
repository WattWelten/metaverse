// Script zum Öffnen aller Recherche-URLs im Browser
// Für Windows: startet Standard-Browser

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const RESEARCH_URLS = {
  sketchfab: [
    {
      name: 'Outdoor Meeting Space',
      url: 'https://sketchfab.com/search?q=outdoor+meeting+space&type=models&sort_by=-likeCount&features=downloadable&licenses=cc0,cc-by'
    },
    {
      name: 'Forest Event Venue',
      url: 'https://sketchfab.com/search?q=forest+event+venue&type=models&sort_by=-likeCount&features=downloadable&licenses=cc0,cc-by'
    },
    {
      name: 'Modern Architecture Nature',
      url: 'https://sketchfab.com/search?q=modern+architecture+nature&type=models&sort_by=-likeCount&features=downloadable&licenses=cc0,cc-by'
    },
    {
      name: 'Outdoor Conference Area',
      url: 'https://sketchfab.com/search?q=outdoor+conference+area&type=models&sort_by=-likeCount&features=downloadable&licenses=cc0,cc-by'
    },
    {
      name: 'Natural Environment Modern Building',
      url: 'https://sketchfab.com/search?q=natural+environment+modern+building&type=models&sort_by=-likeCount&features=downloadable&licenses=cc0,cc-by'
    },
    {
      name: 'Forest Landscape Modern',
      url: 'https://sketchfab.com/search?q=forest+landscape+modern&type=models&sort_by=-likeCount&features=downloadable&licenses=cc0,cc-by'
    },
    {
      name: 'Outdoor Presentation Space',
      url: 'https://sketchfab.com/search?q=outdoor+presentation+space&type=models&sort_by=-likeCount&features=downloadable&licenses=cc0,cc-by'
    }
  ],
  polyhaven: [
    {
      name: 'Forest Models',
      url: 'https://polyhaven.com/models?q=forest'
    },
    {
      name: 'Outdoor Models',
      url: 'https://polyhaven.com/models?q=outdoor'
    },
    {
      name: 'Nature Models',
      url: 'https://polyhaven.com/models?q=nature'
    },
    {
      name: 'Sunset HDRI',
      url: 'https://polyhaven.com/hdris?q=sunset'
    },
    {
      name: 'Evening HDRI',
      url: 'https://polyhaven.com/hdris?q=evening'
    }
  ],
  freesound: [
    {
      name: 'Birds Forest',
      url: 'https://freesound.org/search/?q=birds+forest&f=license:"Attribution"'
    },
    {
      name: 'Water Nature',
      url: 'https://freesound.org/search/?q=water+nature&f=license:"Attribution"'
    },
    {
      name: 'Forest Ambient',
      url: 'https://freesound.org/search/?q=forest+ambient&f=license:"Attribution"'
    }
  ]
};

async function openUrls(platform) {
  const urls = RESEARCH_URLS[platform];
  if (!urls) {
    console.error(`❌ Unbekannte Plattform: ${platform}`);
    return;
  }

  console.log(`\n🌐 Öffne ${urls.length} URLs für ${platform}...\n`);

  for (const item of urls) {
    try {
      // Windows: start-Befehl öffnet Standard-Browser
      await execAsync(`start "" "${item.url}"`);
      console.log(`✅ ${item.name}`);
      // Kurze Pause zwischen Öffnungen
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Fehler beim Öffnen von ${item.name}:`, error.message);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const platform = args[0] || 'all';

  console.log('🚀 Template-Recherche URLs öffnen\n');
  console.log('='.repeat(60));

  if (platform === 'all') {
    console.log('📋 Öffne alle URLs (Sketchfab, PolyHaven, Freesound)...\n');
    await openUrls('sketchfab');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await openUrls('polyhaven');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await openUrls('freesound');
  } else if (platform === 'sketchfab' || platform === 'polyhaven' || platform === 'freesound') {
    await openUrls(platform);
  } else {
    console.log('❌ Unbekannte Plattform. Verfügbar: sketchfab, polyhaven, freesound, all');
    console.log('\n📋 Verwendung:');
    console.log('  node scripts/open-research-urls.mjs sketchfab');
    console.log('  node scripts/open-research-urls.mjs polyhaven');
    console.log('  node scripts/open-research-urls.mjs freesound');
    console.log('  node scripts/open-research-urls.mjs all');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ URLs geöffnet!');
  console.log('\n📋 Nächste Schritte:');
  console.log('1. Durchsuche die geöffneten Tabs');
  console.log('2. Dokumentiere Kandidaten in docs/TEMPLATE_CANDIDATE_LIST.md');
  console.log('3. Lade passende Assets herunter');
  console.log('4. Speichere Links in template-research-downloads/links.md\n');
}

main().catch(console.error);
