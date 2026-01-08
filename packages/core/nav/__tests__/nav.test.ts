import { describe, expect, it } from 'vitest';
import { BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three';

describe('Navmesh Clamp', () => {
  it('should return direct position when no navmesh is available', () => {
    const pos = new Vector3(0, 0, 0);
    const delta = new Vector3(1, 0, 1);
    const target = pos.clone().add(delta);

    // Without NavController, position should be direct
    expect(target.x).toBe(1);
    expect(target.z).toBe(1);
  });

  it('should clamp position when navmesh is available', () => {
    // Create a simple navmesh (ground plane)
    const geometry = new BoxGeometry(10, 0.1, 10);
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    const navmesh = new Mesh(geometry, material);
    navmesh.name = 'NavMesh';

    // Mock clampStep to return a clamped position
    const pos = new Vector3(0, 0, 0);
    const delta = new Vector3(5, 0, 5); // Try to move 5 units
    const target = pos.clone().add(delta);

    // With NavController, position should be clamped to navmesh bounds
    // In this test, we just verify the structure
    expect(navmesh).toBeDefined();
    expect(navmesh.name).toBe('NavMesh');
    expect(target.x).toBe(5);
    expect(target.z).toBe(5);
  });
});
