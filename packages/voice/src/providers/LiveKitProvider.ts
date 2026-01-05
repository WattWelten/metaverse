import { Room } from 'livekit-client';
import type { IVoiceProvider } from './IVoiceProvider.js';

export class LiveKitProvider implements IVoiceProvider {
  private room: Room | null = null;
  private livekitUrl: string;
  private wattosBaseUrl: string;
  private isConnectedFlag = false;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env = (import.meta as any).env || {};
    this.livekitUrl = env.VITE_LIVEKIT_URL || '';
    this.wattosBaseUrl = env.VITE_WATTOS_BASE_URL || '';
  }

  async join(roomId: string, userId: string): Promise<void> {
    if (!this.livekitUrl) {
      throw new Error('VITE_LIVEKIT_URL not set');
    }

    // Token via wattos_plattform
    const tokenUrl = `${this.wattosBaseUrl}/voice/token?room=${roomId}`;
    const response = await fetch(tokenUrl);
    const { token } = await response.json();

    this.room = new Room();
    await this.room.connect(this.livekitUrl, token);
    this.isConnectedFlag = true;
    console.log(`[LiveKit] Joined room ${roomId} as ${userId}`);
  }

  async leave(): Promise<void> {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
    }
    this.isConnectedFlag = false;
    console.log('[LiveKit] Left room');
  }

  async publish(stream: MediaStream): Promise<void> {
    if (!this.room) throw new Error('Not connected');
    const track = stream.getAudioTracks()[0];
    if (!track) throw new Error('No audio track in stream');
    // Skeleton: Track publishing would be implemented here
    // Full implementation would use:
    // const { createLocalAudioTrack } = await import('livekit-client');
    // const localTrack = await createLocalAudioTrack({ source: track });
    // await this.room.localParticipant.publishTrack(localTrack);
    console.log('[LiveKit] Published audio track (skeleton - not fully implemented)');
  }

  async subscribe(participantId: string): Promise<MediaStream | null> {
    if (!this.room) return null;
    const participant = this.room.remoteParticipants.get(participantId);
    if (!participant) return null;
    // Get first audio track publication
    const audioPublication = Array.from(participant.audioTrackPublications.values())[0];
    const track = audioPublication?.track;
    if (!track) return null;
    // Create MediaStream from RemoteTrack
    const mediaStream = new MediaStream([track.mediaStreamTrack]);
    return mediaStream;
  }

  mute(muted: boolean): void {
    if (!this.room) return;
    this.room.localParticipant.setMicrophoneEnabled(!muted);
    console.log(`[LiveKit] Muted: ${muted}`);
  }

  async getDevices(): Promise<MediaDeviceInfo[]> {
    return navigator.mediaDevices.enumerateDevices();
  }

  async setDevice(deviceId: string): Promise<void> {
    // Device-Switching würde hier implementiert werden
    console.log(`[LiveKit] Set device: ${deviceId}`);
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }
}
