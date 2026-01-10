import { AudioEffects } from '../effects/AudioEffects.js';
import { AudioGraph } from '../positional/AudioGraph.js';
import type { ZoneSystem } from '@metaverse/audio';

export class SpatialAudioManager {
  private audioGraph: AudioGraph;
  private audioEffects: AudioEffects;
  private listenerPosition: { x: number; y: number; z: number };
  private speakerPositions = new Map<string, { x: number; y: number; z: number }>();
  private enabled: boolean;
  private zoneSystem: ZoneSystem | null = null;

  constructor(enabled = true, zoneSystem?: ZoneSystem) {
    this.enabled = enabled;
    this.audioGraph = new AudioGraph();
    this.audioEffects = new AudioEffects(this.audioGraph.getAudioContext());
    this.listenerPosition = { x: 0, y: 0, z: 0 };
    this.zoneSystem = zoneSystem || null;
  }

  /**
   * Set zone system for zone-based gain
   */
  setZoneSystem(zoneSystem: ZoneSystem): void {
    this.zoneSystem = zoneSystem;
  }

  updateListenerPosition(position: { x: number; y: number; z: number }): void {
    this.listenerPosition = { ...position };
    if (this.enabled) {
      this.audioGraph.setListenerPosition(position.x, position.y, position.z);

      // Update zone-based gain for all speakers if zone system is available
      if (this.zoneSystem) {
        this.updateZoneGains();
      }
    }
  }

  /**
   * Update listener orientation (camera direction)
   */
  updateListenerOrientation(
    forward: { x: number; y: number; z: number },
    up: { x: number; y: number; z: number } = { x: 0, y: 1, z: 0 }
  ): void {
    if (this.enabled) {
      this.audioGraph.setListenerOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
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

      // Apply zone-based gain if zone system is available
      if (this.zoneSystem) {
        const zoneId = this.zoneSystem.which({
          x: position.x,
          y: position.y,
          z: position.z,
        } as any);
        const zoneGain = this.zoneSystem.gainFor(zoneId);
        this.audioGraph.setZoneGain(userId, zoneGain);
      }
    }
  }

  /**
   * Update zone gains for all speakers based on listener position
   */
  private updateZoneGains(): void {
    if (!this.zoneSystem) return;

    for (const [userId, position] of this.speakerPositions.entries()) {
      const zoneId = this.zoneSystem.which({
        x: position.x,
        y: position.y,
        z: position.z,
      } as any);
      const zoneGain = this.zoneSystem.gainFor(zoneId);
      this.audioGraph.setZoneGain(userId, zoneGain);
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
