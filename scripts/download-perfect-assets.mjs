// Download perfekter Assets basierend auf Analyse
// Lädt das beste HDRI, Audio und Template herunter

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const DOWNLOAD_DIR = path.join(rootDir, 'template-research-downloads');
const HDRI_DIR = path.join(DOWNLOAD_DIR, 'hdri');
const MODELS_DIR = path.join(DOWNLOAD_DIR, 'models');
const AUDIO_DIR = path.join(DOWNLOAD_DIR, 'audio');

// Download-Funktion
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    const req = protocol.request(options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`Download failed: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(destPath);
        resolve({ path: destPath, size: stats.size });
      });
    });
    
    req.on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
    
    req.end();
  });
}

// Perfektes HDRI (bereits heruntergeladen)
async function checkPerfectHDRI() {
  const hdriPath = path.join(HDRI_DIR, 'sunset-forest.hdr');
  
  if (fs.existsSync(hdriPath)) {
    const stats = fs.statSync(hdriPath);
    console.log(`✅ Perfektes HDRI gefunden: sunset-forest.hdr (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
    return {
      name: 'Sunset Forest',
      path: hdriPath,
      size: stats.size,
      status: 'downloaded'
    };
  }
  
  return null;
}

// Perfektes Audio finden und herunterladen
async function downloadPerfectAudio() {
  console.log('\n🎵 Suche perfektes Audio...\n');
  
  // Freesound benötigt manuelle Downloads, aber wir können direkte Links versuchen
  // Oder wir nutzen eine alternative Quelle
  
  // Alternative: Zapsplat oder andere kostenlose Quellen
  const audioCandidates = [
    {
      name: 'Forest Birds Water Ambient',
      description: 'Kombiniert Vögel und Wasser',
      url: null, // Wird manuell gefunden
      fileName: 'forest-birds-water-ambient.mp3',
      source: 'Freesound (manuell)',
      searchUrl: 'https://freesound.org/search/?q=forest+birds+water&f=license:"Attribution"'
    }
  ];
  
  console.log('ℹ️ Audio-Downloads benötigen manuelle Schritte:');
  audioCandidates.forEach(audio => {
    console.log(`   - ${audio.name}`);
    console.log(`     Search: ${audio.searchUrl}`);
    console.log(`     Speichere als: ${audio.fileName}\n`);
  });
  
  return audioCandidates;
}

// Perfektes Template finden
async function findPerfectTemplate() {
  console.log('\n🌲 Suche perfektes Template...\n');
  
  // Sketchfab-Such-URLs für perfekte Templates
  const templateCandidates = [
    {
      name: 'Forest Event Venue Complete',
      platform: 'Sketchfab',
      searchUrl: 'https://sketchfab.com/search?q=forest+event+venue+complete&type=models&sort_by=-likeCount&features=downloadable&licenses=cc0,cc-by',
      description: 'Komplettes Forest Event Venue',
      rating: 5,
      requirements: 'Realitätsnah, Wald, moderne Gebäude, mehrere Zonen'
    },
    {
      name: 'Outdoor Meeting Space Nature',
      platform: 'Sketchfab',
      searchUrl: 'https://sketchfab.com/search?q=outdoor+meeting+space+nature&type=models&sort_by=-likeCount&features=downloadable&licenses=cc0,cc-by',
      description: 'Outdoor Meeting Space in Natur',
      rating: 5,
      requirements: 'Wald, Wasser, moderne Gebäude, Event-Bereiche'
    },
    {
      name: 'Modern Architecture Forest',
      platform: 'Sketchfab',
      searchUrl: 'https://sketchfab.com/search?q=modern+architecture+forest&type=models&sort_by=-likeCount&features=downloadable&licenses=cc0,cc-by',
      description: 'Moderne Architektur im Wald',
      rating: 4,
      requirements: 'Wald, moderne Gebäude, realitätsnah'
    }
  ];
  
  console.log('⭐ Top Template-Kandidaten:\n');
  templateCandidates.forEach((template, index) => {
    console.log(`${index + 1}. ${template.name} (${'⭐'.repeat(template.rating)})`);
    console.log(`   Platform: ${template.platform}`);
    console.log(`   URL: ${template.searchUrl}`);
    console.log(`   Beschreibung: ${template.description}`);
    console.log(`   Anforderungen: ${template.requirements}\n`);
  });
  
  return templateCandidates;
}

// Hauptfunktion
async function main() {
  console.log('🎯 Download perfekter Assets\n');
  console.log('='.repeat(60));
  
  // Ordner erstellen
  [HDRI_DIR, MODELS_DIR, AUDIO_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Perfektes HDRI prüfen
  const perfectHDRI = await checkPerfectHDRI();
  if (perfectHDRI) {
    console.log(`\n✅ Perfektes HDRI bereits vorhanden!\n`);
  }
  
  // Perfektes Audio
  const perfectAudio = await downloadPerfectAudio();
  
  // Perfektes Template
  const perfectTemplates = await findPerfectTemplate();
  
  // Dokumentation
  let doc = `# Perfekte Assets – Download-Status\n\n`;
  doc += `**Datum:** ${new Date().toLocaleDateString('de-DE')}\n\n`;
  
  doc += `## ✅ HDRI\n\n`;
  if (perfectHDRI) {
    doc += `### ${perfectHDRI.name}\n`;
    doc += `- **Status:** ${perfectHDRI.status}\n`;
    doc += `- **Größe:** ${(perfectHDRI.size / (1024 * 1024)).toFixed(2)} MB\n`;
    doc += `- **Pfad:** ${perfectHDRI.path}\n`;
    doc += `- **⭐ Perfekt für:** Sonnenuntergangs-Atmosphäre (3000-4000K)\n\n`;
  }
  
  doc += `## 🎵 Audio\n\n`;
  perfectAudio.forEach(audio => {
    doc += `### ${audio.name}\n`;
    doc += `- **Status:** ${audio.source}\n`;
    doc += `- **Search URL:** ${audio.searchUrl}\n`;
    doc += `- **Dateiname:** ${audio.fileName}\n\n`;
  });
  
  doc += `## 🌲 Templates\n\n`;
  perfectTemplates.forEach((template, index) => {
    doc += `### ${index + 1}. ${template.name} ${'⭐'.repeat(template.rating)}\n`;
    doc += `- **Platform:** ${template.platform}\n`;
    doc += `- **Search URL:** ${template.searchUrl}\n`;
    doc += `- **Beschreibung:** ${template.description}\n`;
    doc += `- **Anforderungen:** ${template.requirements}\n\n`;
  });
  
  const docPath = path.join(rootDir, 'docs', 'PERFECT_ASSETS_DOWNLOAD.md');
  fs.writeFileSync(docPath, doc, 'utf-8');
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Analyse abgeschlossen!\n');
  console.log('📋 Dokumentation:');
  console.log(`   - docs/PERFECT_ASSETS_DOWNLOAD.md`);
  console.log(`   - Öffne Search URLs in Browser`);
  console.log(`   - Lade beste Assets manuell herunter\n`);
}

main().catch(console.error);
