// Automatisiertes Asset-Collection-Script
// Sammelt, lädt herunter, prüft und dokumentiert Assets

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

const DOCS_DIR = path.join(rootDir, 'docs');
const LINKS_FILE = path.join(DOWNLOAD_DIR, 'links.md');
const COLLECTION_LOG = path.join(DOCS_DIR, 'TEMPLATE_COLLECTION_LOG.md');
const TOP_ASSETS = path.join(DOCS_DIR, 'TEMPLATE_TOP_ASSETS.md');

// Collection-Log
const collectionLog = {
  timestamp: new Date().toISOString(),
  hdri: [],
  models: [],
  audio: [],
  errors: [],
  downloaded: [],
  recommendations: []
};

// Utility: HTTP/HTTPS Download
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
      // Redirect folgen
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
        reject(new Error(`Download failed: ${response.statusCode} ${response.statusMessage}`));
        return;
      }
      
      const totalSize = parseInt(response.headers['content-length'] || '0', 10);
      let downloadedSize = 0;
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        file.write(chunk);
      });
      
      response.on('end', () => {
        file.end();
        resolve({ path: destPath, size: downloadedSize });
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

// Utility: Datei-Info prüfen
function checkFileInfo(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { exists: false };
    }
    
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    return {
      exists: true,
      size: stats.size,
      sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
      format: ext,
      path: filePath,
      modified: stats.mtime.toISOString()
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
}

// PolyHaven HDRI Download (direkte URLs)
async function downloadPolyHavenHDRI(id, name, url) {
  const fileName = `${id}.hdr`;
  const destPath = path.join(HDRI_DIR, fileName);
  
  console.log(`📥 Lade HDRI: ${name}...`);
  
  try {
    // Prüfe ob bereits vorhanden
    const existing = checkFileInfo(destPath);
    if (existing.exists) {
      console.log(`   ℹ️ Bereits vorhanden: ${fileName} (${existing.sizeMB} MB)`);
      collectionLog.hdri.push({
        id,
        name,
        ...existing,
        license: 'CC0',
        source: 'PolyHaven',
        status: 'existing',
        url
      });
      return existing;
    }
    
    // Download
    const result = await downloadFile(url, destPath);
    const fileInfo = checkFileInfo(destPath);
    
    if (fileInfo.exists) {
      console.log(`   ✅ Heruntergeladen: ${fileName} (${fileInfo.sizeMB} MB)`);
      
      collectionLog.hdri.push({
        id,
        name,
        ...fileInfo,
        license: 'CC0',
        source: 'PolyHaven',
        status: 'downloaded',
        url
      });
      
      collectionLog.downloaded.push({
        type: 'hdri',
        id,
        name,
        path: destPath
      });
      
      return fileInfo;
    } else {
      throw new Error('Download completed but file not found');
    }
  } catch (error) {
    console.error(`   ❌ Fehler: ${error.message}`);
    collectionLog.errors.push({
      type: 'hdri',
      id,
      name,
      error: error.message
    });
    return null;
  }
}

// PolyHaven Models API (kostenlos, keine API-Key)
async function searchPolyHavenModels(query) {
  return new Promise((resolve, reject) => {
    const url = `https://api.polyhaven.com/files?q=${encodeURIComponent(query)}&categories=models`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Freesound Audio (manuelle Links, da API-Key benötigt)
async function downloadFreesoundAudio(name, url, fileName) {
  const destPath = path.join(AUDIO_DIR, fileName);
  
  console.log(`📋 Audio-Info: ${name}`);
  console.log(`   ⚠️ Manueller Download erforderlich: ${url}`);
  
  collectionLog.audio.push({
    name,
    url,
    fileName,
    source: 'Freesound',
    status: 'manual_download_required',
    recommended: true
  });
  
  return null;
}

// Sketchfab Model Info sammeln (vereinfacht)
function collectSketchfabModel(name, url, info = {}) {
  console.log(`📋 Model-Info: ${name}`);
  console.log(`   URL: ${url}`);
  
  collectionLog.models.push({
    name,
    url,
    platform: 'Sketchfab',
    license: info.license || 'CC0/CC-BY',
    format: info.format || 'GLTF/GLB',
    size: info.size || 'unknown',
    polygons: info.polygons || 'unknown',
    status: 'info_collected',
    recommended: info.recommended || false,
    ...info
  });
  
  return collectionLog.models[collectionLog.models.length - 1];
}

// Top Assets identifizieren
function identifyTopAssets() {
  console.log('\n🎯 Identifiziere Top Assets...\n');
  
  // Top HDRI
  const topHDRI = collectionLog.hdri
    .filter(h => h.status === 'downloaded' || h.status === 'existing')
    .sort((a, b) => {
      // Priorisiere "sunset" und "forest"
      const aScore = (a.name.toLowerCase().includes('sunset') ? 10 : 0) +
                     (a.name.toLowerCase().includes('forest') ? 10 : 0);
      const bScore = (b.name.toLowerCase().includes('sunset') ? 10 : 0) +
                     (b.name.toLowerCase().includes('forest') ? 10 : 0);
      return bScore - aScore;
    })[0];
  
  if (topHDRI) {
    collectionLog.recommendations.push({
      type: 'hdri',
      asset: topHDRI,
      reason: 'Perfekt für Sonnenuntergangs-Atmosphäre'
    });
    console.log(`⭐ Top HDRI: ${topHDRI.name} (${topHDRI.sizeMB} MB)`);
  }
  
  // Top Audio
  const topAudio = collectionLog.audio
    .filter(a => a.recommended)
    .sort((a, b) => {
      const aScore = (a.name.toLowerCase().includes('forest') ? 10 : 0) +
                     (a.name.toLowerCase().includes('birds') ? 5 : 0) +
                     (a.name.toLowerCase().includes('water') ? 5 : 0);
      const bScore = (b.name.toLowerCase().includes('forest') ? 10 : 0) +
                     (b.name.toLowerCase().includes('birds') ? 5 : 0) +
                     (b.name.toLowerCase().includes('water') ? 5 : 0);
      return bScore - aScore;
    })[0];
  
  if (topAudio) {
    collectionLog.recommendations.push({
      type: 'audio',
      asset: topAudio,
      reason: 'Perfekt für Natur-Ambient (Vögel, Wasser)'
    });
    console.log(`⭐ Top Audio: ${topAudio.name}`);
  }
  
  // Top Models
  const topModels = collectionLog.models
    .filter(m => m.recommended)
    .slice(0, 3);
  
  topModels.forEach((model, index) => {
    collectionLog.recommendations.push({
      type: 'model',
      asset: model,
      reason: `Empfohlenes Template #${index + 1}`
    });
    console.log(`⭐ Top Model ${index + 1}: ${model.name}`);
  });
}

// Dokumentation generieren
function generateDocumentation() {
  console.log('\n📝 Generiere Dokumentation...\n');
  
  // Links.md aktualisieren
  let linksContent = `# Asset Download Links – Automatisch gesammelt\n\n`;
  linksContent += `**Datum:** ${new Date().toLocaleDateString('de-DE')}\n`;
  linksContent += `**Status:** Automatische Sammlung\n\n`;
  
  linksContent += `## 📦 HDRI (${collectionLog.hdri.length} gefunden)\n\n`;
  collectionLog.hdri.forEach((hdri, index) => {
    linksContent += `### ${index + 1}. ${hdri.name}\n`;
    linksContent += `- **Status:** ${hdri.status}\n`;
    if (hdri.sizeMB) linksContent += `- **Größe:** ${hdri.sizeMB} MB\n`;
    linksContent += `- **Lizenz:** ${hdri.license}\n`;
    if (hdri.path) linksContent += `- **Pfad:** ${hdri.path}\n`;
    if (hdri.url) linksContent += `- **URL:** ${hdri.url}\n`;
    linksContent += `\n`;
  });
  
  linksContent += `## 🎵 Audio (${collectionLog.audio.length} gefunden)\n\n`;
  collectionLog.audio.forEach((audio, index) => {
    linksContent += `### ${index + 1}. ${audio.name}\n`;
    linksContent += `- **Status:** ${audio.status}\n`;
    if (audio.url) linksContent += `- **URL:** ${audio.url}\n`;
    if (audio.fileName) linksContent += `- **Dateiname:** ${audio.fileName}\n`;
    if (audio.recommended) linksContent += `- **⭐ Empfohlen:** Ja\n`;
    linksContent += `\n`;
  });
  
  linksContent += `## 🌲 3D-Modelle (${collectionLog.models.length} gefunden)\n\n`;
  collectionLog.models.forEach((model, index) => {
    linksContent += `### ${index + 1}. ${model.name}\n`;
    linksContent += `- **Plattform:** ${model.platform}\n`;
    linksContent += `- **URL:** ${model.url}\n`;
    linksContent += `- **Lizenz:** ${model.license}\n`;
    linksContent += `- **Format:** ${model.format}\n`;
    if (model.size !== 'unknown') linksContent += `- **Größe:** ${model.size}\n`;
    if (model.recommended) linksContent += `- **⭐ Empfohlen:** Ja\n`;
    linksContent += `\n`;
  });
  
  fs.writeFileSync(LINKS_FILE, linksContent, 'utf-8');
  console.log(`✅ Links dokumentiert: ${LINKS_FILE}`);
  
  // Top Assets Dokumentation
  let topContent = `# Top Assets – Empfehlungen\n\n`;
  topContent += `**Datum:** ${new Date().toLocaleDateString('de-DE')}\n`;
  topContent += `**Basierend auf:** Interview-Anforderungen\n\n`;
  
  topContent += `## ⭐ Top HDRI\n\n`;
  const topHDRI = collectionLog.recommendations.find(r => r.type === 'hdri');
  if (topHDRI) {
    topContent += `### ${topHDRI.asset.name}\n`;
    topContent += `- **Status:** ${topHDRI.asset.status}\n`;
    topContent += `- **Größe:** ${topHDRI.asset.sizeMB} MB\n`;
    topContent += `- **Lizenz:** ${topHDRI.asset.license}\n`;
    topContent += `- **Pfad:** ${topHDRI.asset.path}\n`;
    topContent += `- **Grund:** ${topHDRI.reason}\n\n`;
  }
  
  topContent += `## ⭐ Top Audio\n\n`;
  const topAudio = collectionLog.recommendations.find(r => r.type === 'audio');
  if (topAudio) {
    topContent += `### ${topAudio.asset.name}\n`;
    topContent += `- **URL:** ${topAudio.asset.url}\n`;
    topContent += `- **Grund:** ${topAudio.reason}\n\n`;
  }
  
  topContent += `## ⭐ Top 3D-Modelle\n\n`;
  const topModels = collectionLog.recommendations.filter(r => r.type === 'model');
  topModels.forEach((rec, index) => {
    topContent += `### ${index + 1}. ${rec.asset.name}\n`;
    topContent += `- **URL:** ${rec.asset.url}\n`;
    topContent += `- **Grund:** ${rec.reason}\n\n`;
  });
  
  fs.writeFileSync(TOP_ASSETS, topContent, 'utf-8');
  console.log(`✅ Top Assets dokumentiert: ${TOP_ASSETS}`);
  
  // Collection-Log speichern
  let logContent = `# Template Collection Log\n\n`;
  logContent += `**Datum:** ${collectionLog.timestamp}\n\n`;
  logContent += `## 📊 Zusammenfassung\n\n`;
  logContent += `- HDRI: ${collectionLog.hdri.length} (${collectionLog.hdri.filter(h => h.status === 'downloaded' || h.status === 'existing').length} heruntergeladen)\n`;
  logContent += `- Audio: ${collectionLog.audio.length}\n`;
  logContent += `- Models: ${collectionLog.models.length}\n`;
  logContent += `- Fehler: ${collectionLog.errors.length}\n`;
  logContent += `- Empfehlungen: ${collectionLog.recommendations.length}\n\n`;
  logContent += `## 📦 Details\n\n`;
  logContent += `\`\`\`json\n${JSON.stringify(collectionLog, null, 2)}\n\`\`\`\n`;
  
  fs.writeFileSync(COLLECTION_LOG, logContent, 'utf-8');
  console.log(`✅ Collection-Log gespeichert: ${COLLECTION_LOG}`);
}

// Hauptfunktion
async function main() {
  console.log('🚀 Automatische Asset-Collection\n');
  console.log('='.repeat(60));
  
  // Ordner erstellen
  [HDRI_DIR, MODELS_DIR, AUDIO_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Ordner erstellt: ${dir}`);
    }
  });
  
  console.log('\n📥 Lade HDRI herunter...\n');
  
  // PolyHaven HDRI Downloads (direkte URLs)
  const hdriDownloads = [
    {
      id: 'sunset-forest',
      name: 'Sunset Forest',
      url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/sunset_forest_2k.hdr'
    },
    {
      id: 'evening-road',
      name: 'Evening Road',
      url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/evening_road_2k.hdr'
    },
    {
      id: 'spruit-sunrise',
      name: 'Spruit Sunrise',
      url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/spruit_sunrise_2k.hdr'
    }
  ];
  
  for (const hdri of hdriDownloads) {
    await downloadPolyHavenHDRI(hdri.id, hdri.name, hdri.url);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Rate-Limiting
  }
  
  console.log('\n📋 Sammle Audio-Informationen...\n');
  
  // Freesound Audio (manuelle Links dokumentieren)
  const audioLinks = [
    {
      name: 'Forest Birds Ambient',
      url: 'https://freesound.org/search/?q=birds+forest&f=license:"Attribution"',
      fileName: 'forest-birds.mp3'
    },
    {
      name: 'Water Nature',
      url: 'https://freesound.org/search/?q=water+nature&f=license:"Attribution"',
      fileName: 'water-nature.mp3'
    },
    {
      name: 'Forest Ambient Loop',
      url: 'https://freesound.org/search/?q=forest+ambient&f=license:"Attribution"',
      fileName: 'forest-ambient.mp3'
    }
  ];
  
  for (const audio of audioLinks) {
    await downloadFreesoundAudio(audio.name, audio.url, audio.fileName);
  }
  
  console.log('\n📋 Sammle Model-Informationen...\n');
  console.log('ℹ️ Sketchfab-Modelle benötigen manuelle Eingabe');
  console.log('   Dokumentiere Links in docs/TEMPLATE_CANDIDATE_LIST.md\n');
  
  // Top Assets identifizieren
  identifyTopAssets();
  
  // Dokumentation generieren
  generateDocumentation();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Asset-Collection abgeschlossen!\n');
  console.log(`📊 Zusammenfassung:`);
  console.log(`   HDRI: ${collectionLog.hdri.length} (${collectionLog.hdri.filter(h => h.status === 'downloaded' || h.status === 'existing').length} heruntergeladen)`);
  console.log(`   Audio: ${collectionLog.audio.length} (Links dokumentiert)`);
  console.log(`   Models: ${collectionLog.models.length} (Info gesammelt)`);
  console.log(`   Empfehlungen: ${collectionLog.recommendations.length}`);
  console.log(`   Fehler: ${collectionLog.errors.length}\n`);
  
  if (collectionLog.errors.length > 0) {
    console.log('⚠️ Fehler aufgetreten:');
    collectionLog.errors.forEach(err => {
      console.log(`   - ${err.type}: ${err.error}`);
    });
  }
  
  console.log('\n📁 Dateien:');
  console.log(`   - ${LINKS_FILE}`);
  console.log(`   - ${TOP_ASSETS}`);
  console.log(`   - ${COLLECTION_LOG}\n`);
}

main().catch(console.error);
