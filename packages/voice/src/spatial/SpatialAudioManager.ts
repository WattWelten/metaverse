import { Vector3 } from 'three';
import { AudioGraph } from '../positional/AudioGraph.js';
import { AudioEffects } from '../effects/AudioEffects.js';

export class SpatialAudioManager {
  private audioGraph: AudioGraph;
  private audioEffects: AudioEffects;
  private listenerPosition: Vector3;
  private speakerPositions = new Map<string, Vector3>();
  private enabled: boolean;

  constructor(enabled = true) {
    this.enabled = enabled;
    this.audioGraph = new AudioGraph();
    this.audioEffects = new AudioEffects(this.audioGraph.getAudioContext());
    this.listenerPosition = new Vector3(0, 0, 0);
  }

  updateListenerPosition(position: Vector3): void {
    this.listenerPosition.copy(position);
    if (this.enabled) {
      this.audioGraph.setListenerPosition(position.x, position.y, position.z);
    }
  }

  updateSpeakerPosition(userId: string, position: Vector3): void {
    this.speakerPositions.set(userId, position.clone());
    if (this.enabled) {
      this.audioGraph.updateSourcePosition(userId, {
        x: position.x,
        y: position.y,
        z: position.z,
      });

      // Apply distance-based effects
      const distance = this.listenerPosition.distanceTo(position);
      this.audioEffects.applyDistanceEffects(userId, distance);
    }
  }

  addSpeaker(userId: string, stream: MediaStream, position: Vector3): void {
    this.speakerPositions.set(userId, position.clone());
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

  getAudioGraph(): AudioGraph {
    return this.audioGraph;
  }

  dispose(): void {
    this.audioGraph.dispose();
    this.audioEffects.dispose();
  }
}

