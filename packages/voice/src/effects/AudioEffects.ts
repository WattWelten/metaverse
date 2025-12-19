// AudioContext and related types are from Web Audio API (browser global)

export class AudioEffects {
  private audioContext: AudioContext;
  private reverbNodes = new Map<string, ConvolverNode>();
  private delayNodes = new Map<string, DelayNode>();
  private gainNodes = new Map<string, GainNode>();

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  applyDistanceEffects(userId: string, distance: number): void {
    // Distance attenuation
    const gain = this.getOrCreateGain(userId);
    const maxDistance = 50;
    const minGain = 0.1;
    const attenuation = Math.max(minGain, 1 - distance / maxDistance);
    gain.gain.value = attenuation;

    // Reverb based on distance (more reverb when further away)
    if (distance > 10) {
      this.applyReverb(userId);
    } else {
      this.removeReverb(userId);
    }
  }

  private getOrCreateGain(userId: string): GainNode {
    if (!this.gainNodes.has(userId)) {
      const gain = this.audioContext.createGain();
      this.gainNodes.set(userId, gain);
    }
    return this.gainNodes.get(userId)!;
  }

  private applyReverb(userId: string): void {
    // Create reverb effect based on distance
    // This is a simplified implementation
    if (!this.reverbNodes.has(userId)) {
      const convolver = this.audioContext.createConvolver();
      // Load impulse response for reverb
      // For MVP, we'll use a simple delay-based reverb
      this.reverbNodes.set(userId, convolver);
    }
  }

  private removeReverb(userId: string): void {
    const reverb = this.reverbNodes.get(userId);
    if (reverb) {
      reverb.disconnect();
      this.reverbNodes.delete(userId);
    }
  }

  applyDopplerEffect(_userId: string, _velocity: { x: number; y: number; z: number }): void {
    // Doppler effect implementation
    // This would adjust playback rate based on relative velocity
  }

  dispose(): void {
    this.reverbNodes.forEach((node) => node.disconnect());
    this.delayNodes.forEach((node) => node.disconnect());
    this.gainNodes.forEach((node) => node.disconnect());
    this.reverbNodes.clear();
    this.delayNodes.clear();
    this.gainNodes.clear();
  }
}

