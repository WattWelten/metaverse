import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Lade .env.local falls vorhanden
const envLocalPath = join(process.cwd(), '.env.local');
if (existsSync(envLocalPath)) {
  const envContent = readFileSync(envLocalPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
const TOKEN = process.env.STRAPI_TOKEN;
assert.ok(TOKEN, 'Setze STRAPI_TOKEN in .env.local');

const H = {
  'content-type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
};

async function upsert(type, uniqueField, payload) {
  // In Strapi v5: Felder stehen direkt unter data, nicht unter data.attributes
  const fieldValue = payload.data[uniqueField] || payload.data.attributes?.[uniqueField];
  const q = new URLSearchParams({
    [`filters[${uniqueField}][$eq]`]: fieldValue,
    'pagination[limit]': '1',
  });
  const list = await fetch(`${STRAPI}/api/${type}?${q}`, { headers: H });
  const js = await list.json();
  if (js?.data?.length) {
    const id = js.data[0].id;
    const r = await fetch(`${STRAPI}/api/${type}/${id}`, {
      method: 'PUT',
      headers: H,
      body: JSON.stringify(payload),
    });
    const jr = await r.json();
    return jr.data;
  } else {
    const r = await fetch(`${STRAPI}/api/${type}`, {
      method: 'POST',
      headers: H,
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const errorText = await r.text();
      throw new Error(`POST failed for ${type}: ${r.status} ${errorText.substring(0, 200)}`);
    }
    const jr = await r.json();
    return jr.data;
  }
}

try {
  // In Strapi v5: Felder stehen direkt unter data, nicht unter data.attributes
  const asset = await upsert('assets', 'idStr', {
    data: {
      idStr: 'plaza',
      src: 'glb/plaza.glb',
      draco: true,
      ktx2: true,
    },
  });

  const zoneA = await upsert('zones', 'idStr', {
    data: {
      idStr: 'stage',
      shape: 'circle',
      center: [0, 0],
      radius: 6,
      isStage: true,
    },
  });

  const zoneB = await upsert('zones', 'idStr', {
    data: {
      idStr: 'breakoutA',
      shape: 'circle',
      center: [8, 0],
      radius: 4,
      isStage: false,
    },
  });

  const beacon = await upsert('audio-beacons', 'idStr', {
    data: {
      idStr: 'fountain',
      pos: [2, 0, -4],
      url: 'audio/fountain.ogg',
      radius: 8,
    },
  });

  const portal = await upsert('portals', 'to', {
    data: {
      to: 'Breakout A',
      position: [5, 0, 2],
    },
  });

  const scenePayload = {
    data: {
      name: 'Welcome Plaza',
      spawn: { x: 0, y: 0, z: 3 },
      ui: { showMinimap: true },
    },
  };
  const scene = await upsert('scenes', 'name', scenePayload);

  console.log('✅ Seed done:', {
    asset: asset?.id,
    zoneA: zoneA?.id,
    zoneB: zoneB?.id,
    beacon: beacon?.id,
    portal: portal?.id,
    scene: scene?.id,
  });
} catch (error) {
  console.error('❌ Seed failed:', error.message);
  process.exit(1);
}
