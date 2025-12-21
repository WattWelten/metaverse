#!/usr/bin/env tsx

import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function extractCCBYAssets(
  shoppingDocPath: string
): Array<{ name: string; url?: string; license: string }> {
  if (!existsSync(shoppingDocPath)) {
    console.warn(`⚠️  assets-shopping.md not found: ${shoppingDocPath}`);
    return [];
  }

  const content = readFileSync(shoppingDocPath, 'utf-8');
  const assets: Array<{ name: string; url?: string; license: string }> = [];

  // Look for CC-BY mentions
  const lines = content.split('\n');
  let currentSection = '';
  let currentAsset: { name: string; url?: string; license: string } | null = null;

  for (const line of lines) {
    // Detect headers
    if (line.startsWith('#')) {
      currentSection = line.replace(/^#+\s*/, '').trim();
      continue;
    }

    // Look for CC-BY or Attribution mentions
    if (line.includes('CC-BY') || line.includes('CC BY') || line.includes('Attribution')) {
      // Try to extract asset name from context
      const prevLine = lines[lines.indexOf(line) - 1];
      if (prevLine && !prevLine.startsWith('#')) {
        const match = prevLine.match(/\*\*([^*]+)\*\*/);
        if (match) {
          assets.push({
            name: match[1],
            license: 'CC-BY',
          });
        }
      }
    }

    // Look for URLs
    const urlMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (urlMatch && currentAsset) {
      currentAsset.url = urlMatch[2];
    }
  }

  return assets;
}

function generateAttributionForTemplate(
  templateDir: string,
  ccbyAssets: Array<{ name: string; url?: string; license: string }>
): void {
  const attributionPath = join(templateDir, 'ATTRIBUTION.md');
  const manifestPath = join(templateDir, 'manifest.json');

  let existingContent = '';
  if (existsSync(attributionPath)) {
    existingContent = readFileSync(attributionPath, 'utf-8');
  }

  // Read manifest to extract asset names
  let manifestAssets: Record<string, string> = {};
  if (existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      if (manifest.assets) {
        manifestAssets = manifest.assets as Record<string, string>;
      }
      if (manifest.audio?.ambient) {
        manifestAssets.ambient = manifest.audio.ambient as string;
      }
    } catch (error) {
      console.warn(`⚠️  Could not parse manifest.json for ${basename(templateDir)}:`, error);
    }
  }

  const header = `# Attribution

Generated: ${new Date().toISOString()}

## Files

`;

  let filesSection = '';
  if (manifestAssets.hdri) {
    filesSection += `- **HDRI**: ${manifestAssets.hdri} (PolyHaven CC0 empfohlen)\n`;
  }
  if (manifestAssets.scene) {
    filesSection += `- **Scene**: ${manifestAssets.scene}\n`;
  }
  if (manifestAssets.ambient) {
    filesSection += `- **Ambient Audio**: ${manifestAssets.ambient}\n`;
  }
  if (!filesSection) {
    filesSection = 'No assets listed in manifest.\n';
  }

  const ccbyHeader = `

## CC-BY Assets (Attribution Required)

`;
  const footer = `

## CC0 Assets (No Attribution Required)

Most assets used in this template are CC0 (Public Domain) and require no attribution.

## Sources

For detailed asset sources and links, see:
- docs/assets-shopping.md

## Notes

- CC0 assets: No attribution required
- CC-BY assets: Attribution required (see above)
- Run \`pnpm assets:attr\` to regenerate this file
`;

  let ccbySection = '';
  if (ccbyAssets.length > 0) {
    ccbySection = ccbyAssets
      .map((asset) => {
        const urlPart = asset.url ? ` - ${asset.url}` : '';
        return `- **${asset.name}** (${asset.license})${urlPart}`;
      })
      .join('\n');
  } else {
    ccbySection = 'No CC-BY assets found in this template.\n';
  }

  const newContent = header + filesSection + ccbyHeader + ccbySection + footer;

  // Append to existing if it exists and is different
  if (existingContent && existingContent !== newContent) {
    const updatedContent = existingContent + '\n\n---\n\n' + newContent;
    writeFileSync(attributionPath, updatedContent);
    console.log(`✅ Updated ATTRIBUTION.md for ${basename(templateDir)}`);
  } else {
    writeFileSync(attributionPath, newContent);
    console.log(`✅ Generated ATTRIBUTION.md for ${basename(templateDir)}`);
  }
}

async function main() {
  const shoppingDocPath = join(rootDir, 'docs', 'assets-shopping.md');
  const templatesDir = join(rootDir, 'packages', 'assets', 'templates');

  console.log('📝 Generating attribution files...');

  // Extract CC-BY assets from shopping doc
  const ccbyAssets = extractCCBYAssets(shoppingDocPath);

  if (ccbyAssets.length > 0) {
    console.log(`📋 Found ${ccbyAssets.length} CC-BY asset(s) requiring attribution`);
  } else {
    console.log('ℹ️  No CC-BY assets found (all assets are CC0 or no attribution needed)');
  }

  // Generate attribution for each template
  if (!existsSync(templatesDir)) {
    console.error(`❌ Templates directory not found: ${templatesDir}`);
    process.exit(1);
  }

  const templates = readdirSync(templatesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  if (templates.length === 0) {
    console.warn('⚠️  No templates found');
    return;
  }

  for (const templateId of templates) {
    const templateDir = join(templatesDir, templateId);
    generateAttributionForTemplate(templateDir, ccbyAssets);
  }

  console.log('\n✅ Attribution generation completed!');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
