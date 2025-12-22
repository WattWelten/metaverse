import {
  Object3D,
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  TextureLoader,
  VideoTexture,
  DoubleSide,
  Vector3,
  Texture,
  LinearFilter,
} from 'three';

export interface MediaBillboardConfig {
  url: string;
  position: { x: number; y: number; z: number };
  width?: number;
  height?: number;
  type: 'image' | 'video';
}

export class MediaBillboard {
  private object: Object3D;
  private texture: VideoTexture | Texture | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private config: MediaBillboardConfig;

  constructor(config: MediaBillboardConfig) {
    this.config = config;
    this.object = new Object3D();
    this.object.position.set(config.position.x, config.position.y, config.position.z);
    this.loadMedia();
  }

  private async loadMedia(): Promise<void> {
    const width = this.config.width || 4;
    const height = this.config.height || 3;
    const geometry = new PlaneGeometry(width, height);

    if (this.config.type === 'video') {
      // Video Billboard
      this.videoElement = document.createElement('video');
      this.videoElement.src = this.config.url;
      this.videoElement.loop = true;
      this.videoElement.muted = true;
      this.videoElement.playsInline = true;
      this.videoElement.crossOrigin = 'anonymous';

      this.videoElement.addEventListener('loadeddata', () => {
        this.videoElement?.play().catch((error) => {
          console.warn('Failed to autoplay video:', error);
        });
      });

      this.texture = new VideoTexture(this.videoElement);
      this.texture.minFilter = LinearFilter;
      this.texture.magFilter = LinearFilter;
    } else {
      // Image Billboard
      const loader = new TextureLoader();
      this.texture = await loader.loadAsync(this.config.url);
    }

    const material = new MeshBasicMaterial({
      map: this.texture,
      side: DoubleSide,
    });

    const mesh = new Mesh(geometry, material);
    this.object.add(mesh);
  }

  getObject(): Object3D {
    return this.object;
  }

  dispose(): void {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = '';
      this.videoElement = null;
    }
    if (this.texture) {
      this.texture.dispose();
      this.texture = null;
    }
    if (this.object) {
      this.object.traverse((child) => {
        if (child instanceof Mesh) {
          child.geometry.dispose();
          if (child.material instanceof MeshBasicMaterial) {
            child.material.map?.dispose();
            child.material.dispose();
          }
        }
      });
    }
  }

  updatePosition(position: { x: number; y: number; z: number }): void {
    this.object.position.set(position.x, position.y, position.z);
  }

  lookAt(target: Vector3 | { x: number; y: number; z: number }): void {
    if (target instanceof Vector3) {
      this.object.lookAt(target);
    } else {
      this.object.lookAt(new Vector3(target.x, target.y, target.z));
    }
  }
}
