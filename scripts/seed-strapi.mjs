import assert from 'node:assert/strict';

const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337';
const TOKEN = process.env.STRAPI_TOKEN;
assert.ok(TOKEN, 'Setze STRAPI_TOKEN in .env.local');

const H = {
  'content-type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
};

async function upsert(type, uniqueField, payload) {
  const q = new URLSearchParams({
    [`filters[${uniqueField}][$eq]`]: payload.data.attributes[uniqueField],
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
    const jr = await r.json();
    return jr.data;
  }
}

try {
  const asset = await upsert('assets', 'idStr', {
    data: {
      attributes: {
        idStr: 'plaza',
        src: 'glb/plaza.glb',
        draco: true,
        ktx2: true,
      },
    },
  });

  const zoneA = await upsert('zones', 'idStr', {
    data: {
      attributes: {
        idStr: 'stage',
        shape: 'circle',
        center: [0, 0],
        radius: 6,
        isStage: true,
      },
    },
  });

  const zoneB = await upsert('zones', 'idStr', {
    data: {
      attributes: {
        idStr: 'breakoutA',
        shape: 'circle',
        center: [8, 0],
        radius: 4,
        isStage: false,
      },
    },
  });

  const beacon = await upsert('audio-beacons', 'idStr', {
    data: {
      attributes: {
        idStr: 'fountain',
        pos: [2, 0, -4],
        url: 'audio/fountain.ogg',
        radius: 8,
      },
    },
  });

  const portal = await upsert('portals', 'to', {
    data: {
      attributes: {
        to: 'Breakout A',
        position: [5, 0, 2],
      },
    },
  });

  const scenePayload = {
    data: {
      attributes: {
        name: 'Welcome Plaza',
        spawn: { x: 0, y: 0, z: 3 },
        ui: { showMinimap: true },
      },
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
