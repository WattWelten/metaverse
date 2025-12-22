import { Raycaster, Vector2, Vector3, Object3D, Mesh, Box3, type Camera } from 'three';

export interface InteractableObject {
  object: Object3D;
  type: 'chair' | 'seat' | 'interactive';
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
}

export class InteractionManager {
  private raycaster: Raycaster;
  private interactableObjects: InteractableObject[] = [];
  private scene: Object3D;

  constructor(scene: Object3D) {
    this.scene = scene;
    this.raycaster = new Raycaster();
  }

  /**
   * Register an object as interactable (e.g., chair, seat)
   */
  registerInteractable(object: InteractableObject): void {
    // Mark object with metadata
    object.object.userData.interactable = true;
    object.object.userData.interactionType = object.type;
    object.object.userData.interactionPosition = object.position;
    object.object.userData.interactionRotation = object.rotation;

    this.interactableObjects.push(object);
  }

  /**
   * Find interactable objects in scene (auto-detect objects with specific names/tags)
   */
  autoDetectInteractables(): void {
    this.scene.traverse((child) => {
      // Check for common naming patterns
      const name = child.name.toLowerCase();
      if (
        name.includes('chair') ||
        name.includes('seat') ||
        name.includes('bench') ||
        name.includes('stool') ||
        child.userData.interactable === true
      ) {
        if (child instanceof Mesh || child.children.length > 0) {
          // Get bounding box center as interaction point
          const box = new Box3().setFromObject(child);
          const center = box.getCenter(new Vector3());

          this.registerInteractable({
            object: child,
            type: 'chair',
            position: { x: center.x, y: center.y, z: center.z },
          });
        }
      }
    });
  }

  /**
   * Raycast from camera to find interactable objects
   */
  raycastFromCamera(
    camera: Camera,
    mouseX: number,
    mouseY: number,
    width: number,
    height: number
  ): InteractableObject | null {
    // Normalize mouse coordinates
    const mouse = new Vector2();
    mouse.x = (mouseX / width) * 2 - 1;
    mouse.y = -(mouseY / height) * 2 + 1;

    this.raycaster.setFromCamera(mouse, camera);

    // Filter to only interactable objects
    const objects = this.interactableObjects.map((io) => io.object);
    const intersects = this.raycaster.intersectObjects(objects, true);

    if (intersects.length > 0) {
      const hitObject = intersects[0]?.object;
      if (!hitObject) return null;

      // Find the interactable object
      const interactable = this.interactableObjects.find((io) => {
        let found = false;
        io.object.traverse((child) => {
          if (child === hitObject) {
            found = true;
          }
        });
        return found;
      });

      return interactable || null;
    }

    return null;
  }

  /**
   * Find nearest interactable object to position
   */
  findNearestInteractable(
    position: { x: number; y: number; z: number },
    maxDistance: number = 2.0
  ): InteractableObject | null {
    let nearest: InteractableObject | null = null;
    let minDistance = maxDistance;

    for (const interactable of this.interactableObjects) {
      const dx = interactable.position.x - position.x;
      const dy = interactable.position.y - position.y;
      const dz = interactable.position.z - position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = interactable;
      }
    }

    return nearest;
  }

  /**
   * Get interaction position for an object
   */
  getInteractionPosition(interactable: InteractableObject): { x: number; y: number; z: number } {
    return interactable.position;
  }

  /**
   * Clear all interactables
   */
  clear(): void {
    this.interactableObjects.forEach((io) => {
      delete io.object.userData.interactable;
      delete io.object.userData.interactionType;
      delete io.object.userData.interactionPosition;
    });
    this.interactableObjects = [];
  }
}
