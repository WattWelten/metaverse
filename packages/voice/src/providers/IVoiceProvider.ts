export interface IVoiceProvider {
  join(roomId: string, userId: string): Promise<void>;
  leave(): Promise<void>;
  publish(stream: MediaStream): Promise<void>;
  subscribe(participantId: string): Promise<MediaStream | null>;
  mute(muted: boolean): void;
  getDevices(): Promise<MediaDeviceInfo[]>;
  setDevice(deviceId: string): Promise<void>;
  isConnected(): boolean;
}
