import * as THREE from 'three';

export function extractHolesFromScene(scene: THREE.Scene): {
  holes: { center: THREE.Vector2; radius: number }[];
  radius: number;
} {
  const holes: { center: THREE.Vector2; radius: number }[] = [];
  let worldRadius = 28; // begehbarer Disk-Radius

  scene.traverse((o: THREE.Object3D) => {
    const obj = o as THREE.Mesh;
    if (!obj || !obj.position) return;
    // Lake
    if (obj.name === 'Lake' || obj.userData?.isLake) {
      const r = obj.userData?.radius ?? 20;
      holes.push({
        center: new THREE.Vector2(obj.position.x, obj.position.z),
        radius: r + 1.0,
      });
    }
    // Trees (Cone/Cylinder)
    if (obj.name?.startsWith('Tree') || obj.userData?.isTree) {
      const r = obj.userData?.colliderRadius ?? 0.9;
      holes.push({
        center: new THREE.Vector2(obj.position.x, obj.position.z),
        radius: r,
      });
    }
  });

  return { holes, radius: worldRadius };
}
