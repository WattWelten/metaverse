import { Howl } from 'howler';
import type { AudioMixer } from '../mixer/AudioMixer.js';

export interface AmbientSourceConfig {
  id: string;
  file: string;
  volume: number;
  loop: boolean;
  position?: { x: number; y: number; z: number };
}

export class AmbientSource {
  private config: AmbientSourceConfig;
  private howl: Howl | null = null;
  private mixer: AudioMixer;
  private soundId: number | null = null;
  private isPlaying = false;

  constructor(config: AmbientSourceConfig, mixer: AudioMixer) {
    this.config = config;
    this.mixer = mixer;
    this.init();
  }

  getMixer(): AudioMixer {
    return this.mixer;
  }

  private init(): void {
    this.howl = new Howl({
      src: [this.config.file],
      volume: this.config.volume,
      loop: this.config.loop,
      autoplay: false,
      preload: true,
    });

    // If position is provided, use 3D audio
    if (this.config.position) {
      this.howl.pos(
        this.config.position.x,
        this.config.position.y,
        this.config.position.z
      );
      this.howl.pannerAttr({
        panningModel: 'HRTF',
        distanceModel: 'inverse',
        refDistance: 1,
        maxDistance: 50,
        rolloffFactor: 1,
      });
    }
  }

  play(): void {
    if (!this.howl || this.isPlaying) return;

    this.soundId = this.howl.play();
    this.isPlaying = true;
  }

  stop(): void {
    if (!this.howl || !this.isPlaying) return;

    if (this.soundId !== null) {
      this.howl.stop(this.soundId);
      this.soundId = null;
    }
    this.isPlaying = false;
  }

  pause(): void {
    if (!this.howl || !this.isPlaying) return;

    if (this.soundId !== null) {
      this.howl.pause(this.soundId);
    }
  }

  resume(): void {
    if (!this.howl || !this.isPlaying) return;

    if (this.soundId !== null) {
      this.howl.play(this.soundId);
    }
  }

  setVolume(volume: number): void {
    if (this.howl) {
      this.howl.volume(volume);
    }
  }

  fadeIn(duration = 1000): void {
    if (!this.howl) return;

    const targetVolume = this.config.volume;
    this.howl.volume(0);
    this.play();
    this.howl.fade(0, targetVolume, duration);
  }

  fadeOut(duration = 1000): void {
    if (!this.howl) return;

    const currentVolume = this.howl.volume();
    this.howl.fade(currentVolume, 0, duration);
    
    setTimeout(() => {
      this.stop();
    }, duration);
  }

  updatePosition(position: { x: number; y: number; z: number }): void {
    if (this.howl) {
      this.howl.pos(position.x, position.y, position.z);
    }
  }

  dispose(): void {
    this.stop();
    if (this.howl) {
      this.howl.unload();
      this.howl = null;
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

