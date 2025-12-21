import { AudioMixer } from './mixer/AudioMixer.js';
import { AmbientSource } from './sources/AmbientSource.js';

// TemplateManifest type definition (to avoid circular dependency)
export interface TemplateManifest {
  name: string;
  version: string;
  ambient?: {
    sources: Array<{
      id: string;
      file: string;
      volume: number;
      loop: boolean;
      position?: { x: number; y: number; z: number };
    }>;
  };
}

export interface AmbientConfig {
  id: string;
  file: string;
  volume: number;
  loop: boolean;
  position?: { x: number; y: number; z: number };
}

// Singleton AudioContext for ambient audio
let audioContext: AudioContext | null = null;

/**
 * Gets or creates the singleton AudioContext instance.
 * @returns The AudioContext instance
 */
export function getContext(): AudioContext {
  if (!audioContext) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

/**
 * Resumes the AudioContext after user interaction.
 * This is required by browser autoplay policies.
 * @returns Promise that resolves when the context is resumed
 */
export async function resumeContext(): Promise<void> {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  } catch (error) {
    console.warn('Failed to resume audio context:', error);
  }
}

export class AmbientManager {
  private sources = new Map<string, AmbientSource>();
  private mixer: AudioMixer;
  private enabled = true;
  private contextResumed = false;

  constructor() {
    this.mixer = new AudioMixer();
  }

  /**
   * Gets the AudioContext instance.
   * @returns The AudioContext instance
   */
  getContext(): AudioContext {
    return getContext();
  }

  /**
   * Resumes the AudioContext after user interaction.
   * @returns Promise that resolves when the context is resumed
   */
  async resumeContext(): Promise<void> {
    await resumeContext();
    this.contextResumed = true;
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

    // Only play if enabled and context is resumed
    if (this.enabled && this.contextResumed) {
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

  async playAll(): Promise<void> {
    // Ensure context is resumed before playing
    if (!this.contextResumed) {
      await this.resumeContext();
    }
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
