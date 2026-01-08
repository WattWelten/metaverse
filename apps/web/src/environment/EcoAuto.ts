import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water2.js';

/**
 * Erweiterte prozedurale Landschaft für watt-eco Template
 * - Boden mit sanften Hügeln (Noise-Funktion)
 * - See mit physischem Material (Transmission/IOR)
 * - Drei Wege (Hauptweg zur Bühne, zwei Seitenwege zu Treffpunkten)
 * - 140 Low-Poly-Bäume (Stamm + Krone), intelligente Platzierung
 * - Licht: HemisphereLight + DirectionalLight (Sunset-Positionierung)
 */
export async function buildEcoAuto(scene: THREE.Scene): Promise<void> {
  // Simple noise function for terrain
  function noise(x: number, z: number): number {
    return (
      Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.3 +
      Math.sin(x * 0.05) * Math.cos(z * 0.05) * 0.2 +
      Math.sin(x * 0.02) * Math.cos(z * 0.02) * 0.1
    );
  }

  // Ground with hills (200x200 units, 128x128 segments)
  const groundSize = 200;
  const groundSegments = 128;
  const groundGeometry = new THREE.PlaneGeometry(
    groundSize,
    groundSize,
    groundSegments,
    groundSegments
  );
  const groundVertices = groundGeometry.attributes.position;

  // Apply noise to vertices
  if (groundVertices) {
    for (let i = 0; i < groundVertices.count; i++) {
      const x = groundVertices.getX(i);
      const z = groundVertices.getZ(i);
      const y = noise(x, z) * 0.6; // Amplitude 0.6
      groundVertices.setY(i, y);
    }
  }

  groundGeometry.computeVertexNormals();

  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a6741, // Forest green-brown
    roughness: 0.9,
    metalness: 0.0,
  });

  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.castShadow = true;
  ground.name = 'Ground';
  scene.add(ground);

  // Lake with physical material (18m radius, position (-6, 0.02, -10))
  const lakeRadius = 18;
  const lakeGeometry = new THREE.CircleGeometry(lakeRadius, 64);

  // Try to load water normals from assets, fallback to CDN
  const normalMapLoader = new THREE.TextureLoader();
  const normalMapUrl = '/assets/watt-eco/waternormals.jpg';

  // Load normal map with proper error handling - use CDN as fallback
  let normalMap: THREE.Texture | null = null;
  try {
    normalMap = await normalMapLoader.loadAsync(normalMapUrl);
    if (normalMap) {
      normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
    }
  } catch (error) {
    // Fallback to CDN if local asset fails
    console.warn('Local water normals not found, using CDN fallback:', error);
    try {
      normalMap = await normalMapLoader.loadAsync(
        'https://threejs.org/examples/textures/waternormals.jpg'
      );
      if (normalMap) {
        normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
      }
    } catch (fallbackError) {
      console.error('Failed to load water normals from CDN:', fallbackError);
      // Use a simple default texture if both fail
      normalMap = null;
    }
  }

  // Only create water if we have a valid normal map
  if (normalMap) {
    const water = new Water(lakeGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      normalMap0: normalMap,
    });

    // Set material properties
    interface WaterMaterial {
      uniforms?: {
        sunDirection?: { value: THREE.Vector3 };
        sunColor?: { value: THREE.Color };
        waterColor?: { value: THREE.Color };
        transmission?: { value: number };
        ior?: { value: number };
      };
    }
    if (water.material && 'uniforms' in water.material) {
      const uniforms = (water.material as WaterMaterial).uniforms;
      if (uniforms) {
        const sunDirection = new THREE.Vector3(-5, 10, 5).normalize();
        if (uniforms.sunDirection) uniforms.sunDirection.value = sunDirection;
        if (uniforms.sunColor) uniforms.sunColor.value = new THREE.Color(0xffffff);
        if (uniforms.waterColor) uniforms.waterColor.value = new THREE.Color(0x001e0f);
        if (uniforms.transmission) uniforms.transmission.value = 0.9;
        if (uniforms.ior) uniforms.ior.value = 1.33; // Water IOR
      }
    }

    water.rotation.x = -Math.PI / 2;
    water.position.set(-6, 0.02, -10);
    water.name = 'Lake';
    water.userData = { isLake: true, radius: lakeRadius };
    scene.add(water);
  } else {
    // Fallback: simple blue plane if texture loading fails
    console.warn('Water normal map failed to load, using simple plane');
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x001e0f,
      roughness: 0.1,
      metalness: 0.0,
    });
    const water = new THREE.Mesh(lakeGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.set(-6, 0.02, -10);
    water.name = 'Lake';
    water.userData = { isLake: true, radius: lakeRadius };
    scene.add(water);
  }

  // Paths: Three paths (main path to stage, two side paths to meeting points)
  const pathMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b7355, // Dirt path color
    roughness: 0.95,
    metalness: 0.0,
  });

  // Main path to stage (from spawn to stage area)
  const mainPathGeometry = new THREE.PlaneGeometry(2.4, 14); // Width 2.4m, length 14m
  const mainPath = new THREE.Mesh(mainPathGeometry, pathMaterial);
  mainPath.rotation.x = -Math.PI / 2;
  mainPath.position.set(0, 0.03, -1); // Y offset 0.03 above ground
  mainPath.receiveShadow = true;
  mainPath.name = 'MainPath';
  scene.add(mainPath);

  // Side path A (to meeting point A at -8, 0, -4)
  const sidePathAGeometry = new THREE.PlaneGeometry(2.0, 8);
  const sidePathA = new THREE.Mesh(sidePathAGeometry, pathMaterial);
  sidePathA.rotation.x = -Math.PI / 2;
  sidePathA.rotation.z = Math.PI / 6; // Slight angle
  sidePathA.position.set(-4, 0.03, -2);
  sidePathA.receiveShadow = true;
  sidePathA.name = 'SidePathA';
  scene.add(sidePathA);

  // Side path B (to meeting point B at 7, 0, -4)
  const sidePathBGeometry = new THREE.PlaneGeometry(2.0, 8);
  const sidePathB = new THREE.Mesh(sidePathBGeometry, pathMaterial);
  sidePathB.rotation.x = -Math.PI / 2;
  sidePathB.rotation.z = -Math.PI / 6; // Slight angle
  sidePathB.position.set(4, 0.03, -2);
  sidePathB.receiveShadow = true;
  sidePathB.name = 'SidePathB';
  scene.add(sidePathB);

  // Trees: 140 Low-Poly trees (trunk + crown)
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x5a3d2a, // Brown trunk
    roughness: 0.8,
    metalness: 0.1,
  });

  const crownMaterial = new THREE.MeshStandardMaterial({
    color: 0x2e6b3c, // Forest green
    roughness: 0.8,
    metalness: 0.0,
  });

  const lakeCenter = new THREE.Vector3(-6, 0, -10);
  const paths: Array<{ center: THREE.Vector3; width: number }> = [
    { center: new THREE.Vector3(0, 0, -1), width: 2.4 },
    { center: new THREE.Vector3(-4, 0, -2), width: 2.0 },
    { center: new THREE.Vector3(4, 0, -2), width: 2.0 },
  ];

  function isTooCloseToLake(pos: THREE.Vector3): boolean {
    return pos.distanceTo(lakeCenter) < 20; // Minimum 20m from lake
  }

  function isTooCloseToPath(pos: THREE.Vector3): boolean {
    for (const path of paths) {
      const distToPath = pos.distanceTo(path.center);
      if (distToPath < path.width / 2 + 2.8) {
        // 2.8m clearance from path edge
        return true;
      }
    }
    return false;
  }

  let treesPlaced = 0;
  const maxAttempts = 1000;
  let attempts = 0;

  while (treesPlaced < 140 && attempts < maxAttempts) {
    attempts++;

    // Random position within ground bounds
    const x = (Math.random() - 0.5) * groundSize;
    const z = (Math.random() - 0.5) * groundSize;
    const y = noise(x, z) * 0.6; // Match ground height
    const pos = new THREE.Vector3(x, y, z);

    // Check constraints
    if (isTooCloseToLake(pos) || isTooCloseToPath(pos)) {
      continue;
    }

    // Create tree
    const trunkRadius = 0.15 + Math.random() * 0.07; // 0.15-0.22m radius
    const trunkHeight = 1.6; // 1.6m height
    const trunkGeometry = new THREE.CylinderGeometry(
      trunkRadius,
      trunkRadius * 1.1,
      trunkHeight,
      12
    );
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, y + trunkHeight / 2, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.name = `Tree_${treesPlaced}_Trunk`;
    scene.add(trunk);

    const crownRadius = 0.9; // 0.9m radius
    const crownHeight = 1.8; // 1.8m height
    const crownGeometry = new THREE.IcosahedronGeometry(crownRadius, 0); // Low-poly sphere
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.set(x, y + trunkHeight + crownHeight / 2, z);
    crown.castShadow = true;
    crown.receiveShadow = true;
    crown.name = `Tree_${treesPlaced}_Crown`;
    scene.add(crown);

    treesPlaced++;
  }

  console.log(
    `✅ EcoAuto environment built: Ground (${groundSegments}x${groundSegments}), Lake (${lakeRadius}m), 3 Paths, ${treesPlaced} Trees`
  );
}
