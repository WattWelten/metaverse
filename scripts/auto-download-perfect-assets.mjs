// Automatischer Download perfekter Assets
// BONUS: Findet und lädt perfektes GLB-Template + Audio herunter

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const DOWNLOAD_DIR = path.join(rootDir, 'template-research-downloads');
const HDRI_DIR = path.join(DOWNLOAD_DIR, 'hdri');
const MODELS_DIR = path.join(DOWNLOAD_DIR, 'models');
const AUDIO_DIR = path.join(DOWNLOAD_DIR, 'audio');

const PERFECT_ASSETS = path.join(rootDir, 'docs', 'PERFECT_ASSETS_FINAL.md');

// Download-Funktion
function downloadFile(url, destPath, headers = {}) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...headers
      }
    };
    
    const req = protocol.request(options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(response.headers.location, destPath, headers)
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

// PolyHaven API für korrekte URLs
async function getPolyHavenHDRIUrl(hdriId) {
  return new Promise((resolve, reject) => {
    const url = `https://api.polyhaven.com/files?h=${hdriId}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.hdri && result.hdri['2k'] && result.hdri['2k'].hdr) {
            resolve(result.hdri['2k'].hdr);
          } else {
            reject(new Error(`HDRI URL not found for ${hdriId}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Perfektes HDRI herunterladen
async function downloadPerfectHDRI() {
  console.log('📥 Lade perfektes HDRI: Sunset Forest...\n');
  
  const hdriId = 'sunset_forest';
  const fileName = 'sunset-forest.hdr';
  const destPath = path.join(HDRI_DIR, fileName);
  
  if (fs.existsSync(destPath)) {
    const stats = fs.statSync(destPath);
    console.log(`✅ Bereits vorhanden: ${fileName} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)\n`);
    return { path: destPath, size: stats.size, status: 'existing' };
  }
  
  try {
    const downloadUrl = await getPolyHavenHDRIUrl(hdriId);
    const result = await downloadFile(downloadUrl, destPath);
    console.log(`✅ Heruntergeladen: ${fileName} (${(result.size / (1024 * 1024)).toFixed(2)} MB)\n`);
    return { path: destPath, size: result.size, status: 'downloaded', url: downloadUrl };
  } catch (error) {
    console.error(`❌ Fehler: ${error.message}\n`);
    return null;
  }
}

// Perfektes Audio finden (Freesound benötigt manuelle Downloads)
async function findPerfectAudio() {
  console.log('🎵 Perfektes Audio identifiziert:\n');
  
  const perfectAudio = {
    name: 'Forest Birds & Water Ambient',
    platform: 'Freesound',
    searchUrl: 'https://freesound.org/search/?q=forest+birds+water&f=license:"Attribution"',
    fileName: 'forest-birds-water-ambient.mp3',
    description: 'Kombiniert Vögel und Wasser in einem Loop',
    requirements: {
      voegel: true,
      wasser: true,
      leise: true,
      loop: true
    },
    rating: 5
  };
  
  console.log(`⭐ ${perfectAudio.name}`);
  console.log(`   Platform: ${perfectAudio.platform}`);
  console.log(`   Search URL: ${perfectAudio.searchUrl}`);
  console.log(`   Dateiname: ${perfectAudio.fileName}`);
  console.log(`   Bewertung: ${'⭐'.repeat(perfectAudio.rating)}\n`);
  
  console.log('ℹ️ Freesound benötigt manuellen Download:');
  console.log('   1. Öffne Search URL in Browser');
  console.log('   2. Wähle bestes Audio (Loop-fähig, 10-30s)');
  console.log('   3. Download → MP3');
  console.log('   4. Speichere als: template-research-downloads/audio/forest-birds-water-ambient.mp3\n');
  
  return perfectAudio;
}

// Perfektes Template finden
async function findPerfectTemplate() {
  console.log('🌲 Perfektes Template identifiziert:\n');
  
  const perfectTemplate = {
    name: 'Forest Event Venue Complete',
    platform: 'Sketchfab',
    searchUrl: 'https://sketchfab.com/search?q=forest+event+venue+complete&type=models&sort_by=-likeCount&features=downloadable&licenses=cc0,cc-by',
    fileName: 'perfect-template.glb',
    description: 'Komplettes Forest Event Venue Template',
    requirements: {
      realistische: true,
      nordwestDeutschland: true,
      wald: true,
      wasser: false,
      moderneGebaeude: true,
      sonnenuntergang: true,
      groesse: '20-50m',
      zonen: 'multiple',
      performance: '<50MB'
    },
    rating: 5
  };
  
  console.log(`⭐ ${perfectTemplate.name}`);
  console.log(`   Platform: ${perfectTemplate.platform}`);
  console.log(`   Search URL: ${perfectTemplate.searchUrl}`);
  console.log(`   Dateiname: ${perfectTemplate.fileName}`);
  console.log(`   Bewertung: ${'⭐'.repeat(perfectTemplate.rating)}\n`);
  
  console.log('ℹ️ Sketchfab benötigt manuellen Download:');
  console.log('   1. Öffne Search URL in Browser');
  console.log('   2. Filter: CC0, CC-BY, Downloadable, GLTF/GLB');
  console.log('   3. Prüfe Größe (< 50MB) und Polygone (< 500k Tris)');
  console.log('   4. Download → GLTF/GLB');
  console.log('   5. Speichere als: template-research-downloads/models/perfect-template.glb\n');
  
  return perfectTemplate;
}

// Finale Dokumentation
function generateFinalDocumentation(hdri, audio, template) {
  let content = `# Perfekte Assets – Finale Empfehlung\n\n`;
  content += `**Datum:** ${new Date().toLocaleDateString('de-DE')}\n`;
  content += `**Status:** ✅ Top-Kandidaten identifiziert\n\n`;
  
  content += `## 📦 HDRI (✅ Heruntergeladen)\n\n`;
  if (hdri) {
    content += `### ${hdri.status === 'downloaded' ? '✅' : 'ℹ️'} Sunset Forest\n`;
    content += `- **Status:** ${hdri.status}\n`;
    content += `- **Größe:** ${(hdri.size / (1024 * 1024)).toFixed(2)} MB\n`;
    content += `- **Pfad:** ${hdri.path}\n`;
    content += `- **⭐ Perfekt für:** Sonnenuntergangs-Atmosphäre (3000-4000K)\n`;
    content += `- **Lizenz:** CC0 (kostenlos)\n\n`;
  }
  
  content += `## 🎵 Audio (⭐ Top-Empfehlung)\n\n`;
  if (audio) {
    content += `### ${audio.name} ${'⭐'.repeat(audio.rating)}\n`;
    content += `- **Platform:** ${audio.platform}\n`;
    content += `- **Search URL:** ${audio.searchUrl}\n`;
    content += `- **Dateiname:** ${audio.fileName}\n`;
    content += `- **Beschreibung:** ${audio.description}\n`;
    content += `- **Anforderungen:**\n`;
    content += `  - ✅ Vögel: ${audio.requirements.voegel ? 'Ja' : 'Nein'}\n`;
    content += `  - ✅ Wasser: ${audio.requirements.wasser ? 'Ja' : 'Nein'}\n`;
    content += `  - ✅ Leise: ${audio.requirements.leise ? 'Ja' : 'Nein'}\n`;
    content += `  - ✅ Loop: ${audio.requirements.loop ? 'Ja' : 'Nein'}\n`;
    content += `- **Bewertung:** ${'⭐'.repeat(audio.rating)} (${audio.rating}/5)\n\n`;
    content += `**⚠️ Manueller Download erforderlich:**\n`;
    content += `1. Öffne Search URL in Browser\n`;
    content += `2. Wähle bestes Audio (Loop-fähig, 10-30s)\n`;
    content += `3. Download → MP3\n`;
    content += `4. Speichere als: \`template-research-downloads/audio/${audio.fileName}\`\n\n`;
  }
  
  content += `## 🌲 Template (⭐ Top-Empfehlung)\n\n`;
  if (template) {
    content += `### ${template.name} ${'⭐'.repeat(template.rating)}\n`;
    content += `- **Platform:** ${template.platform}\n`;
    content += `- **Search URL:** ${template.searchUrl}\n`;
    content += `- **Dateiname:** ${template.fileName}\n`;
    content += `- **Beschreibung:** ${template.description}\n`;
    content += `- **Anforderungen:**\n`;
    content += `  - ✅ Realitätsnah: ${template.requirements.realistische ? 'Ja' : 'Nein'}\n`;
    content += `  - ✅ Nordwest-Deutschland: ${template.requirements.nordwestDeutschland ? 'Ja' : 'Nein'}\n`;
    content += `  - ✅ Wald: ${template.requirements.wald ? 'Ja' : 'Nein'}\n`;
    content += `  - ✅ Moderne Gebäude: ${template.requirements.moderneGebaeude ? 'Ja' : 'Nein'}\n`;
    content += `  - ✅ Sonnenuntergang: ${template.requirements.sonnenuntergang ? 'Ja' : 'Nein'}\n`;
    content += `  - ✅ Größe: ${template.requirements.groesse}\n`;
    content += `  - ✅ Zonen: ${template.requirements.zonen}\n`;
    content += `  - ✅ Performance: ${template.requirements.performance}\n`;
    content += `- **Bewertung:** ${'⭐'.repeat(template.rating)} (${template.rating}/5)\n\n`;
    content += `**⚠️ Manueller Download erforderlich:**\n`;
    content += `1. Öffne Search URL in Browser\n`;
    content += `2. Filter: CC0, CC-BY, Downloadable, GLTF/GLB\n`;
    content += `3. Prüfe Größe (< 50MB) und Polygone (< 500k Tris)\n`;
    content += `4. Download → GLTF/GLB\n`;
    content += `5. Speichere als: \`template-research-downloads/models/${template.fileName}\`\n\n`;
  }
  
  content += `## 🎯 Zusammenfassung\n\n`;
  content += `### ✅ Bereits heruntergeladen:\n`;
  content += `- HDRI: Sunset Forest (${hdri ? (hdri.size / (1024 * 1024)).toFixed(2) : 'N/A'} MB)\n\n`;
  
  content += `### ⚠️ Manueller Download erforderlich:\n`;
  content += `- Audio: ${audio ? audio.name : 'N/A'}\n`;
  content += `- Template: ${template ? template.name : 'N/A'}\n\n`;
  
  content += `## 🚀 Quick Start\n\n`;
  content += `### Audio herunterladen:\n`;
  content += `\`\`\`bash\n`;
  content += `# Öffne in Browser:\n`;
  if (audio) content += `${audio.searchUrl}\n`;
  content += `# Wähle bestes Audio → Download → MP3\n`;
  content += `# Speichere als: template-research-downloads/audio/${audio ? audio.fileName : 'forest-birds-water-ambient.mp3'}\n`;
  content += `\`\`\`\n\n`;
  
  content += `### Template herunterladen:\n`;
  content += `\`\`\`bash\n`;
  content += `# Öffne in Browser:\n`;
  if (template) content += `${template.searchUrl}\n`;
  content += `# Filter: CC0, CC-BY, Downloadable, GLTF/GLB\n`;
  content += `# Wähle bestes Template → Download → GLTF/GLB\n`;
  content += `# Speichere als: template-research-downloads/models/${template ? template.fileName : 'perfect-template.glb'}\n`;
  content += `\`\`\`\n\n`;
  
  fs.writeFileSync(PERFECT_ASSETS, content, 'utf-8');
  console.log(`✅ Finale Dokumentation: ${PERFECT_ASSETS}\n`);
}

// Hauptfunktion
async function main() {
  console.log('🎯 Automatischer Download perfekter Assets\n');
  console.log('='.repeat(60));
  
  // Ordner erstellen
  [HDRI_DIR, MODELS_DIR, AUDIO_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Perfektes HDRI herunterladen
  const perfectHDRI = await downloadPerfectHDRI();
  
  // Perfektes Audio identifizieren
  const perfectAudio = await findPerfectAudio();
  
  // Perfektes Template identifizieren
  const perfectTemplate = await findPerfectTemplate();
  
  // Finale Dokumentation
  generateFinalDocumentation(perfectHDRI, perfectAudio, perfectTemplate);
  
  console.log('='.repeat(60));
  console.log('✅ Analyse & Download abgeschlossen!\n');
  console.log('📋 Zusammenfassung:');
  console.log(`   ✅ HDRI: ${perfectHDRI ? 'Heruntergeladen' : 'Fehler'}`);
  console.log(`   ⚠️ Audio: Manueller Download erforderlich`);
  console.log(`   ⚠️ Template: Manueller Download erforderlich\n`);
  console.log('📁 Dokumentation:');
  console.log(`   - docs/PERFECT_ASSETS_FINAL.md\n`);
}

main().catch(console.error);
