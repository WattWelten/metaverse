#!/usr/bin/env tsx
/**
 * Script to create placeholder demo assets for demo-plaza and demo-meeting
 * Creates simple GLB files using Three.js and gltf-transform
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { createRequire } from 'module';

// Use createRequire for CommonJS compatibility
const require = createRequire(import.meta.url);
const THREE = require('three');
const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter.js');

const templatesDir = join(process.cwd(), 'apps/web/public/templates');

// Mock FileReader for Node.js environment (GLTFExporter needs it)
if (typeof globalThis.FileReader === 'undefined') {
  // @ts-ignore
  globalThis.FileReader = class FileReader {
    result: ArrayBuffer | string | null = null;
    onload: ((e: any) => void) | null = null;
    readAsArrayBuffer(blob: any): void {
      if (blob instanceof Buffer) {
        this.result = blob.buffer.slice(blob.byteOffset, blob.byteOffset + blob.byteLength);
      } else {
        this.result = blob;
      }
      if (this.onload) {
        this.onload({ target: { result: this.result } });
      }
    }
    readAsDataURL(blob: any): void {
      if (blob instanceof Buffer) {
        const base64 = blob.toString('base64');
        this.result = `data:application/octet-stream;base64,${base64}`;
      } else if (blob instanceof ArrayBuffer) {
        const base64 = Buffer.from(blob).toString('base64');
        this.result = `data:application/octet-stream;base64,${base64}`;
      }
      if (this.onload) {
        this.onload({ target: { result: this.result } });
      }
    }
    readAsText(blob: any): void {
      if (blob instanceof Buffer) {
        this.result = blob.toString('utf-8');
      } else if (typeof blob === 'string') {
        this.result = blob;
      }
      if (this.onload) {
        this.onload({ target: { result: this.result } });
      }
    }
  };
}

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
      walls: [
        { pos: [0, 2, -20], size: [40, 4, 0.2], color: 0xcccccc }, // Back wall
      ],
      props: [
        { type: 'cylinder', pos: [0, 1, -15], size: 2, color: 0xff6b6b }, // Stage platform
        { type: 'box', pos: [-10, 1, -5], size: 1, color: 0x4ecdc4 }, // Breakout area marker 1
        { type: 'box', pos: [10, 1, -5], size: 1, color: 0x4ecdc4 }, // Breakout area marker 2
      ],
    },
    navmesh: {
      bounds: { min: [-20, -20], max: [20, 20] },
      holes: [
        { center: [0, -15], radius: 2.5 }, // Stage area
      ],
    },
  },
  'demo-meeting': {
    templateId: 'demo-meeting',
    scene: {
      ground: { size: [16, 0.2, 12], color: 0x654321 },
      walls: [
        { pos: [0, 2, -6], size: [16, 4, 0.2], color: 0xffffff }, // Back wall
        { pos: [-8, 2, 0], size: [0.2, 4, 12], color: 0xffffff }, // Left wall
        { pos: [8, 2, 0], size: [0.2, 4, 12], color: 0xffffff }, // Right wall
      ],
      props: [
        { type: 'box', pos: [0, 0.5, -4], size: 0.3, color: 0x333333 }, // Table
        { type: 'box', pos: [-6, 1.5, -4], size: 0.1, color: 0x0000ff }, // Whiteboard placeholder
      ],
    },
    navmesh: {
      bounds: { min: [-8, -6], max: [8, 6] },
    },
  },
};

async function createGLB(scene: THREE.Scene, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const exporter = new GLTFExporter();

      // Configure exporter options for binary GLB
      const options = {
        binary: true,
        includeCustomExtensions: false,
        animations: [],
      };

      exporter.parse(
        scene,
        (result) => {
          try {
            if (result instanceof ArrayBuffer) {
              writeFileSync(filename, Buffer.from(result));
              resolve();
            } else if (typeof result === 'string') {
              // If result is a string (JSON), write it directly
              writeFileSync(filename, result);
              resolve();
            } else if (result && typeof result === 'object') {
              // If result is an object, stringify it
              writeFileSync(filename, JSON.stringify(result, null, 2));
              resolve();
            } else {
              reject(new Error('Unexpected export result type'));
            }
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(error);
        },
        options
      );
    } catch (error) {
      reject(error);
    }
  });
}

async function createSceneAsset(config: AssetConfig): Promise<void> {
  const scene = new THREE.Scene();

  // Ground
  const groundGeometry = new THREE.BoxGeometry(...config.scene.ground.size);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: config.scene.ground.color });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.position.set(0, -config.scene.ground.size[1] / 2, 0);
  ground.receiveShadow = true;
  scene.add(ground);

  // Walls
  if (config.scene.walls) {
    config.scene.walls.forEach((wall) => {
      const wallGeometry = new THREE.BoxGeometry(...wall.size);
      const wallMaterial = new THREE.MeshStandardMaterial({ color: wall.color });
      const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
      wallMesh.position.set(...wall.pos);
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      scene.add(wallMesh);
    });
  }

  // Props
  if (config.scene.props) {
    config.scene.props.forEach((prop) => {
      let geometry: THREE.BufferGeometry;
      if (prop.type === 'box') {
        geometry = new THREE.BoxGeometry(prop.size, prop.size, prop.size);
      } else if (prop.type === 'sphere') {
        geometry = new THREE.SphereGeometry(prop.size, 16, 16);
      } else {
        geometry = new THREE.CylinderGeometry(prop.size, prop.size, prop.size * 2, 32);
      }
      const material = new THREE.MeshStandardMaterial({ color: prop.color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...prop.pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    });
  }

  // Add basic lighting (only directional - ambient not supported in GLB export)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  // Set light target for proper direction (GLTFExporter requirement)
  const target = new THREE.Object3D();
  target.position.set(0, 0, -1);
  directionalLight.add(target);
  directionalLight.target = target;
  scene.add(directionalLight);

  const templateDir = join(templatesDir, config.templateId);
  if (!existsSync(templateDir)) {
    mkdirSync(templateDir, { recursive: true });
  }

  const outputPath = join(templateDir, 'scene.glb');
  await createGLB(scene, outputPath);
  console.log(`✅ Created scene.glb for ${config.templateId}`);
}

async function createNavmeshAsset(config: AssetConfig): Promise<void> {
  // Create a simple navmesh as a plane with holes
  const scene = new THREE.Scene();

  const bounds = config.navmesh.bounds;
  const width = bounds.max[0] - bounds.min[0];
  const height = bounds.max[1] - bounds.min[1];

  // Main plane
  const planeGeometry = new THREE.PlaneGeometry(width, height, 32, 32);
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: true });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.set((bounds.min[0] + bounds.max[0]) / 2, 0, (bounds.min[1] + bounds.max[1]) / 2);
  scene.add(plane);

  const templateDir = join(templatesDir, config.templateId);
  const outputPath = join(templateDir, 'navmesh.glb');
  await createGLB(scene, outputPath);
  console.log(`✅ Created navmesh.glb for ${config.templateId}`);
}

async function main(): Promise<void> {
  console.log('🎨 Creating demo assets...\n');

  for (const [templateId, config] of Object.entries(configs)) {
    console.log(`Creating assets for ${templateId}...`);
    await createSceneAsset(config);
    await createNavmeshAsset(config);
  }

  console.log('\n✅ All demo assets created!');
  console.log(
    '\nNote: These are placeholder assets. For production, replace with optimized 3D models.'
  );
}

main().catch(console.error);
