import { WebRTCAdapter, type WebRTCAdapterConfig } from './adapters/webrtc.js';
import { SpatialAudioManager } from './spatial/SpatialAudioManager.js';

export interface VoiceClientConfig {
  serverUrl?: string;
  userId: string;
  roomId: string;
  enableSpatialAudio?: boolean;
  netClient?: {
    on: (event: string, callback: (data: unknown) => void) => void;
    emit?: (event: string, data: unknown) => void;
  };
}

export class VoiceClient {
  private adapter: WebRTCAdapter;
  private spatialAudioManager: SpatialAudioManager;
  private isEnabled = false;
  private localStream: MediaStream | null = null;

  constructor(config: VoiceClientConfig) {
    this.adapter = new WebRTCAdapter({
      userId: config.userId,
      roomId: config.roomId,
      serverUrl: config.serverUrl,
      netClient: config.netClient as WebRTCAdapterConfig['netClient'],
    });
    this.spatialAudioManager = new SpatialAudioManager(
      config.enableSpatialAudio !== false
    );
  }

  async enable(): Promise<void> {
    if (this.isEnabled) return;

    try {
      // Request microphone access
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      await this.adapter.connect(this.localStream);
      this.isEnabled = true;
    } catch (error) {
      console.error('Failed to enable voice:', error);
      throw error;
    }
  }

  disable(): void {
    if (!this.isEnabled) return;

    this.adapter.disconnect();
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    this.isEnabled = false;
  }

  updateListenerPosition(position: { x: number; y: number; z: number }): void {
    this.spatialAudioManager.updateListenerPosition(position);
  }

  updateSpeakerPosition(userId: string, position: { x: number; y: number; z: number }): void {
    this.spatialAudioManager.updateSpeakerPosition(userId, position);
  }

  mute(): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    }
  }

  unmute(): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });
    }
  }

  isMuted(): boolean {
    if (!this.localStream) return true;
    return this.localStream.getAudioTracks().some((track) => !track.enabled);
  }

  getAdapter(): WebRTCAdapter {
    return this.adapter;
  }

  getSpatialAudioManager(): SpatialAudioManager {
    return this.spatialAudioManager;
  }
}

