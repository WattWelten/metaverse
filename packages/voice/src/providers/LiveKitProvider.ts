import { IVoiceProvider, JoinOptions, DeviceInfo } from './IVoiceProvider.js';
import { Room, RoomEvent, createLocalAudioTrack } from 'livekit-client';

export class LiveKitProvider implements IVoiceProvider {
  private room: Room | null = null;
  private stateCb?: (s: 'idle' | 'connecting' | 'connected' | 'error', e?: unknown) => void;
  private partCb?: (n: number) => void;

  onState(cb: (s: 'idle' | 'connecting' | 'connected' | 'error', e?: unknown) => void): void {
    this.stateCb = cb;
  }

  onParticipantChange(cb: (n: number) => void): void {
    this.partCb = cb;
  }

  async join(opts: JoinOptions): Promise<void> {
    this.stateCb?.('connecting');
    try {
      this.room = new Room();
      this.room.on(RoomEvent.ConnectionStateChanged, (state) => {
        if (state === 'connected') {
          this.stateCb?.('connected');
        } else if (state === 'disconnected') {
          this.stateCb?.('idle');
        } else if (state === 'reconnecting') {
          this.stateCb?.('connecting');
        }
      });
      this.room.on(RoomEvent.ParticipantConnected, () => {
        this.partCb?.(this.room?.participants.size ?? 0);
      });
      this.room.on(RoomEvent.ParticipantDisconnected, () => {
        this.partCb?.(this.room?.participants.size ?? 0);
      });
      await this.room.connect(opts.url, opts.token);
      const track = await createLocalAudioTrack();
      await this.room.localParticipant.publishTrack(track);
      this.stateCb?.('connected');
    } catch (error) {
      this.stateCb?.('error', error);
      throw error;
    }
  }

  async leave(): Promise<void> {
    await this.room?.disconnect();
    this.room = null;
    this.stateCb?.('idle');
  }

  async mute(muted: boolean): Promise<void> {
    const mic = this.room?.localParticipant?.getTrackPublication('microphone');
    await mic?.mute(muted);
  }

  async listDevices(): Promise<DeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === 'audioinput' || d.kind === 'audiooutput')
      .map((d) => ({
        id: d.deviceId,
        label: d.label,
        kind: d.kind as 'audioinput' | 'audiooutput',
      }));
  }

  async setInputDevice(deviceId: string): Promise<void> {
    await this.room?.switchActiveDevice('audioinput', deviceId);
  }
}
