import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { Water } from 'three/examples/jsm/objects/Water2.js';

export function buildEco(scene: THREE.Scene): void {
  // Sky
  const sky = new Sky();
  sky.scale.setScalar(450000);
  scene.add(sky);

  // Sun position (configurable)
  const sun = new THREE.Vector3();
  const phi = THREE.MathUtils.degToRad(90 - 5); // Elevation angle
  const theta = THREE.MathUtils.degToRad(180); // Azimuth angle
  sun.setFromSphericalCoords(1, phi, theta);
  (sky.material as any).sunPosition = sun;
  (sky.material as any).turbidity = 10;
  (sky.material as any).rayleigh = 2;
  (sky.material as any).mieCoefficient = 0.005;
  (sky.material as any).mieDirectionalG = 0.8;

  // Water plane (lake)
  const waterGeometry = new THREE.CircleGeometry(20, 64);
  const normalMap = new THREE.TextureLoader().load(
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg',
    (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }
  );
  const water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    normalMap0: normalMap,
  });
  // Set material properties after creation (Water2 uses uniforms)
  if (water.material && 'uniforms' in water.material) {
    const uniforms = (water.material as any).uniforms;
    if (uniforms) {
      if (uniforms.sunDirection) uniforms.sunDirection.value = sun.clone();
      if (uniforms.sunColor) uniforms.sunColor.value = new THREE.Color(0xffffff);
      if (uniforms.waterColor) uniforms.waterColor.value = new THREE.Color(0x001e0f);
    }
  }
  water.rotation.x = -Math.PI / 2;
  water.position.set(-12, 0.01, -10);
  scene.add(water);

  // Tagging für Navmesh
  water.name = 'Lake';
  (water as any).userData = { isLake: true, radius: 20 };

  // Ground grid (fallback, falls kein GLB-Ground)
  const gridHelper = new THREE.GridHelper(100, 100, 0x334444, 0x223333);
  (gridHelper.material as THREE.Material).opacity = 0.35;
  (gridHelper.material as THREE.Material).transparent = true;
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  // Simple props: trees (cones) - performance-friendly
  const treeMaterial = new THREE.MeshStandardMaterial({
    color: 0x2e6b3c,
    roughness: 0.8,
    metalness: 0.1,
  });

  for (let i = 0; i < 15; i++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.2, 8), treeMaterial);
    cone.position.set(
      -8 + Math.random() * 24, // x: -8 to 16
      1.1, // y: tree height / 2
      -14 + Math.random() * 18 // z: -14 to 4
    );
    cone.castShadow = true;
    cone.receiveShadow = true;
    scene.add(cone);

    // Tagging für Navmesh
    cone.name = `Tree_${i}`;
    cone.userData = { isTree: true, colliderRadius: 0.9 };
  }

  console.log('✅ Eco environment built: Sky, Water, Trees, Ground');
}
