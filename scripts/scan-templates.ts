import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, resolve } from 'path';
import { z } from 'zod';

const TemplateInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
});

const TemplateIndexSchema = z.object({
  default: z.string(),
  items: z.array(TemplateInfoSchema),
});

type TemplateInfo = z.infer<typeof TemplateInfoSchema>;
type TemplateIndex = z.infer<typeof TemplateIndexSchema>;

interface Manifest {
  id?: string;
  name: string;
  assets?: {
    scene?: string;
    hdri?: string;
  };
}

async function scanTemplates(): Promise<TemplateIndex> {
  const templatesDir = resolve(process.cwd(), 'packages/assets/templates');
  const entries = await readdir(templatesDir, { withFileTypes: true });

  const items: TemplateInfo[] = [];
  const defaultTemplateId = process.env.VITE_TEMPLATE_ID || process.env.TEMPLATE_ID || 'watt-eco';

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const templateId = entry.name;
    const manifestPath = join(templatesDir, templateId, 'manifest.json');

    try {
      const manifestContent = await readFile(manifestPath, 'utf-8');
      const manifest: Manifest = JSON.parse(manifestContent);

      // Minimal-Validierung: id oder name muss vorhanden sein
      const id = manifest.id || templateId;
      const name = manifest.name || templateId;

      // Optional: assets.scene oder assets.hdri sollte vorhanden sein (nur Warnung)
      if (!manifest.assets?.scene && !manifest.assets?.hdri) {
        console.warn(`⚠️  Template "${id}": Keine scene.glb oder hdri in assets gefunden`);
      }

      items.push({
        id,
        name,
        path: `/templates/${templateId}/manifest.json`,
      });

      console.log(`✅ Template gefunden: ${id} (${name})`);
    } catch (error) {
      console.error(`❌ Fehler beim Lesen von ${manifestPath}:`, error);
    }
  }

  if (items.length === 0) {
    throw new Error('Keine Templates gefunden!');
  }

  // Prüfen ob default Template existiert
  const defaultExists = items.some((item) => item.id === defaultTemplateId);
  if (!defaultExists) {
    console.warn(
      `⚠️  Default Template "${defaultTemplateId}" nicht gefunden, verwende "${items[0].id}"`
    );
  }

  return {
    default: defaultExists ? defaultTemplateId : items[0].id,
    items,
  };
}

async function main() {
  try {
    console.log('🔍 Scanne Templates...\n');

    const index = await scanTemplates();

    // Validierung mit Zod
    const validated = TemplateIndexSchema.parse(index);

    // Output-Pfad
    const outputPath = resolve(process.cwd(), 'apps/web/public/templates.json');

    // Verzeichnis erstellen falls nicht vorhanden
    const outputDir = resolve(outputPath, '..');
    await mkdir(outputDir, { recursive: true });

    // JSON schreiben
    await writeFile(outputPath, JSON.stringify(validated, null, 2), 'utf-8');

    console.log(`\n✅ ${validated.items.length} Template(s) gefunden:`);
    validated.items.forEach((item) => {
      console.log(`   - ${item.id}: ${item.name}`);
    });
    console.log(`\n📄 templates.json geschrieben: ${outputPath}`);
    console.log(`   Default: ${validated.default}`);
  } catch (error) {
    console.error('❌ Fehler:', error);
    process.exit(1);
  }
}

main();
