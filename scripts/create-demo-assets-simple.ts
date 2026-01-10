#!/usr/bin/env tsx
/**
 * Simple script to create minimal GLB files for demo templates
 * Uses manual GLTF structure creation instead of GLTFExporter
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const templatesDir = join(process.cwd(), 'apps/web/public/templates');

interface AssetConfig {
  templateId: string;
  scene: {
    ground: { size: [number, number, number]; color: number };
    walls?: Array<{ pos: [number, number, number]; size: [number, number, number]; color: number }>;
    props?: Array<{
      type: 'box' | 'sphere' | 'cylinder';
      pos: [number, number, number];
      size: number;
      color: number;
    }>;
  };
  navmesh: {
    bounds: { min: [number, number]; max: [number, number] };
    holes?: Array<{ center: [number, number]; radius: number }>;
  };
}

const configs: Record<string, AssetConfig> = {
  'demo-plaza': {
    templateId: 'demo-plaza',
    scene: {
      ground: { size: [40, 0.2, 40], color: 0x888888 },
      walls: [{ pos: [0, 2, -20], size: [40, 4, 0.2], color: 0xcccccc }],
      props: [
        { type: 'cylinder', pos: [0, 1, -15], size: 2, color: 0xff6b6b },
        { type: 'box', pos: [-10, 1, -5], size: 1, color: 0x4ecdc4 },
        { type: 'box', pos: [10, 1, -5], size: 1, color: 0x4ecdc4 },
      ],
    },
    navmesh: {
      bounds: { min: [-20, -20], max: [20, 20] },
      holes: [{ center: [0, -15], radius: 2.5 }],
    },
  },
  'demo-meeting': {
    templateId: 'demo-meeting',
    scene: {
      ground: { size: [16, 0.2, 12], color: 0x654321 },
      walls: [
        { pos: [0, 2, -6], size: [16, 4, 0.2], color: 0xffffff },
        { pos: [-8, 2, 0], size: [0.2, 4, 12], color: 0xffffff },
        { pos: [8, 2, 0], size: [0.2, 4, 12], color: 0xffffff },
      ],
      props: [
        { type: 'box', pos: [0, 0.5, -4], size: 0.3, color: 0x333333 },
        { type: 'box', pos: [-6, 1.5, -4], size: 0.1, color: 0x0000ff },
      ],
    },
    navmesh: {
      bounds: { min: [-8, -6], max: [8, 6] },
    },
  },
};

/**
 * Create a minimal valid GLB file with a simple box as ground
 */
function createMinimalGLB(outputPath: string, name: string): void {
  // Create a minimal GLTF structure
  const gltf = {
    asset: { version: '2.0', generator: 'WattWelten Demo Assets' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [
      {
        name: 'Root',
        children: [1],
      },
      {
        name,
        mesh: 0,
      },
    ],
    meshes: [
      {
        name,
        primitives: [
          {
            attributes: {
              POSITION: 0,
              NORMAL: 1,
            },
            indices: 2,
          },
        ],
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126, // FLOAT
        count: 8,
        type: 'VEC3',
        max: [1, 1, 1],
        min: [-1, -1, -1],
      },
      {
        bufferView: 1,
        componentType: 5126,
        count: 8,
        type: 'VEC3',
      },
      {
        bufferView: 2,
        componentType: 5123, // UNSIGNED_SHORT
        count: 36,
        type: 'SCALAR',
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: 96, // 8 vertices * 3 components * 4 bytes
      },
      {
        buffer: 0,
        byteOffset: 96,
        byteLength: 96,
      },
      {
        buffer: 0,
        byteOffset: 192,
        byteLength: 72, // 36 indices * 2 bytes
      },
    ],
    buffers: [
      {
        uri: 'data:application/octet-stream;base64,' + createBoxBuffer(),
        byteLength: 264,
      },
    ],
    materials: [
      {
        name: 'DefaultMaterial',
        pbrMetallicRoughness: {
          baseColorFactor: [0.5, 0.5, 0.5, 1.0],
          metallicFactor: 0.0,
          roughnessFactor: 0.8,
        },
      },
    ],
  };

  // Convert to GLB format (simplified - just write as JSON for now)
  // In production, use gltf-transform or proper GLB binary format
  const json = JSON.stringify(gltf, null, 2);
  writeFileSync(outputPath.replace('.glb', '.gltf'), json);

  // For now, create a note that GLB conversion is needed
  console.log(`  ⚠️  Created ${name}.gltf (GLB conversion needed via gltf-transform)`);
}

/**
 * Create base64-encoded buffer for a simple box
 */
function createBoxBuffer(): string {
  // Simple box vertices (8 vertices, 3 components each = 24 floats = 96 bytes)
  const vertices = new Float32Array([
    -1,
    -1,
    -1,
    1,
    -1,
    -1,
    1,
    1,
    -1,
    -1,
    1,
    -1, // front face
    -1,
    -1,
    1,
    1,
    -1,
    1,
    1,
    1,
    1,
    -1,
    1,
    1, // back face
  ]);

  // Normals (same structure)
  const normals = new Float32Array([
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
  ]);

  // Indices (36 indices for 12 triangles = 72 bytes)
  const indices = new Uint16Array([
    0,
    1,
    2,
    2,
    3,
    0, // front
    4,
    7,
    6,
    6,
    5,
    4, // back
    0,
    4,
    5,
    5,
    1,
    0, // bottom
    2,
    6,
    7,
    7,
    3,
    2, // top
    0,
    3,
    7,
    7,
    4,
    0, // left
    1,
    5,
    6,
    6,
    2,
    1, // right
  ]);

  // Combine all buffers
  const combined = Buffer.concat([
    Buffer.from(vertices.buffer),
    Buffer.from(normals.buffer),
    Buffer.from(indices.buffer),
  ]);

  return combined.toString('base64');
}

async function createSceneAsset(config: AssetConfig): Promise<void> {
  const templateDir = join(templatesDir, config.templateId);
  if (!existsSync(templateDir)) {
    mkdirSync(templateDir, { recursive: true });
  }

  const outputPath = join(templateDir, 'scene.glb');
  createMinimalGLB(outputPath, `${config.templateId}-scene`);
  console.log(`✅ Created scene asset for ${config.templateId}`);
}

async function createNavmeshAsset(config: AssetConfig): Promise<void> {
  const templateDir = join(templatesDir, config.templateId);
  const outputPath = join(templateDir, 'navmesh.glb');
  createMinimalGLB(outputPath, `${config.templateId}-navmesh`);
  console.log(`✅ Created navmesh asset for ${config.templateId}`);
}

async function main(): Promise<void> {
  console.log('🎨 Creating demo assets (minimal GLTF format)...\n');

  for (const [templateId, config] of Object.entries(configs)) {
    console.log(`Creating assets for ${templateId}...`);
    await createSceneAsset(config);
    await createNavmeshAsset(config);
  }

  console.log('\n✅ All demo assets created!');
  console.log('\n📝 Next steps:');
  console.log('  1. Run `pnpm assets:optimize` to convert GLTF to GLB and optimize');
  console.log('  2. Or replace with production 3D models from Blender/3D tools');
}

main().catch(console.error);
