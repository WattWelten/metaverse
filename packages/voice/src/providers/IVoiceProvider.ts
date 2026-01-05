export interface DeviceInfo {
  id: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
}

export interface JoinOptions {
  room: string;
  token: string;
  url: string;
}

export interface IVoiceProvider {
  join(opts: JoinOptions): Promise<void>;
  leave(): Promise<void>;
  mute(muted: boolean): Promise<void>;
  listDevices(): Promise<DeviceInfo[]>;
  setInputDevice(deviceId: string): Promise<void>;
  onParticipantChange?(cb: (count: number) => void): void;
  onState?(cb: (state: 'idle' | 'connecting' | 'connected' | 'error', err?: unknown) => void): void;
}
