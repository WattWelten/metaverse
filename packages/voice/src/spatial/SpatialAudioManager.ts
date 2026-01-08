import { AudioEffects } from '../effects/AudioEffects.js';
import { AudioGraph } from '../positional/AudioGraph.js';

export class SpatialAudioManager {
  private audioGraph: AudioGraph;
  private audioEffects: AudioEffects;
  private listenerPosition: { x: number; y: number; z: number };
  private speakerPositions = new Map<string, { x: number; y: number; z: number }>();
  private enabled: boolean;

  constructor(enabled = true) {
    this.enabled = enabled;
    this.audioGraph = new AudioGraph();
    this.audioEffects = new AudioEffects(this.audioGraph.getAudioContext());
    this.listenerPosition = { x: 0, y: 0, z: 0 };
  }

  updateListenerPosition(position: { x: number; y: number; z: number }): void {
    this.listenerPosition = { ...position };
    if (this.enabled) {
      this.audioGraph.setListenerPosition(position.x, position.y, position.z);
    }
  }

  updateSpeakerPosition(userId: string, position: { x: number; y: number; z: number }): void {
    this.speakerPositions.set(userId, { ...position });
    if (this.enabled) {
      this.audioGraph.updateSourcePosition(userId, {
        x: position.x,
        y: position.y,
        z: position.z,
      });

      // Apply distance-based effects
      const dx = position.x - this.listenerPosition.x;
      const dy = position.y - this.listenerPosition.y;
      const dz = position.z - this.listenerPosition.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      this.audioEffects.applyDistanceEffects(userId, distance);
    }
  }

  addSpeaker(
    userId: string,
    stream: MediaStream,
    position: { x: number; y: number; z: number }
  ): void {
    this.speakerPositions.set(userId, { ...position });
    if (this.enabled) {
      this.audioGraph.addSource(userId, stream, {
        x: position.x,
        y: position.y,
        z: position.z,
      });
    }
  }

  removeSpeaker(userId: string): void {
    this.speakerPositions.delete(userId);
    if (this.enabled) {
      this.audioGraph.removeSource(userId);
    }
  }

  /**
   * Apply zone-specific audio settings (gain, reverb)
   */
  applyZoneSettings(userId: string, gain: number, reverb?: 'none' | 'hall'): void {
    if (this.enabled) {
      this.audioEffects.applyZoneGain(userId, gain);
      if (reverb) {
        this.audioEffects.applyZoneReverb(userId, reverb);
      }
    }
  }

  /**
   * Apply zone settings to all speakers
   */
  applyZoneSettingsToAll(gain: number, reverb?: 'none' | 'hall'): void {
    for (const userId of this.speakerPositions.keys()) {
      this.applyZoneSettings(userId, gain, reverb);
    }
  }

  getAudioGraph(): AudioGraph {
    return this.audioGraph;
  }

  dispose(): void {
    this.audioGraph.dispose();
    this.audioEffects.dispose();
  }
}
