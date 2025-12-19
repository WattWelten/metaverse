import { Howl } from 'howler';
import { AmbientSource } from './sources/AmbientSource.js';
import { AudioMixer } from './mixer/AudioMixer.js';
import type { TemplateManifest } from '@metaverse/core';

export interface AmbientConfig {
  id: string;
  file: string;
  volume: number;
  loop: boolean;
  position?: { x: number; y: number; z: number };
}

export class AmbientManager {
  private sources = new Map<string, AmbientSource>();
  private mixer: AudioMixer;
  private enabled = true;

  constructor() {
    this.mixer = new AudioMixer();
  }

  loadFromTemplate(manifest: TemplateManifest): void {
    if (!manifest.ambient?.sources) return;

    manifest.ambient.sources.forEach((config) => {
      this.addSource(config);
    });
  }

  addSource(config: AmbientConfig): void {
    if (this.sources.has(config.id)) {
      this.removeSource(config.id);
    }

    const source = new AmbientSource(config, this.mixer);
    this.sources.set(config.id, source);

    if (this.enabled) {
      source.play();
    }
  }

  removeSource(id: string): void {
    const source = this.sources.get(id);
    if (source) {
      source.stop();
      source.dispose();
      this.sources.delete(id);
    }
  }

  playAll(): void {
    this.enabled = true;
    this.sources.forEach((source) => {
      source.play();
    });
  }

  stopAll(): void {
    this.enabled = false;
    this.sources.forEach((source) => {
      source.stop();
    });
  }

  setMasterVolume(volume: number): void {
    this.mixer.setMasterVolume(volume);
  }

  fadeIn(id: string, duration = 1000): void {
    const source = this.sources.get(id);
    if (source) {
      source.fadeIn(duration);
    }
  }

  fadeOut(id: string, duration = 1000): void {
    const source = this.sources.get(id);
    if (source) {
      source.fadeOut(duration);
    }
  }

  getSource(id: string): AmbientSource | undefined {
    return this.sources.get(id);
  }

  getAllSources(): AmbientSource[] {
    return Array.from(this.sources.values());
  }

  dispose(): void {
    this.stopAll();
    this.sources.forEach((source) => source.dispose());
    this.sources.clear();
    this.mixer.dispose();
  }
}

