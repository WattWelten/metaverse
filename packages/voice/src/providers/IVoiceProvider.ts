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

export interface ParticipantInfo {
  id: string;
  identity: string;
  name?: string;
  isSpeaking: boolean;
  isMuted: boolean;
  role?: 'host' | 'participant';
}

export interface IVoiceProvider {
  join(opts: JoinOptions): Promise<void>;
  leave(): Promise<void>;
  mute(muted: boolean): Promise<void>;
  listDevices(): Promise<DeviceInfo[]>;
  setInputDevice(deviceId: string): Promise<void>;
  setOutputDevice?(deviceId: string): Promise<void>;
  getParticipants?(): ParticipantInfo[];
  onParticipantChange?(cb: (count: number) => void): void;
  onParticipantUpdate?(cb: (participants: ParticipantInfo[]) => void): void;
  onActiveSpeakers?(cb: (speakerIds: string[]) => void): void;
  onState?(cb: (state: 'idle' | 'connecting' | 'connected' | 'error', err?: unknown) => void): void;
  startScreenShare?(): Promise<MediaStream | null>;
  stopScreenShare?(): Promise<void>;
  onRemoteScreen?(cb: (participantId: string, stream: MediaStream | null) => void): void;

  // Data Channel API for stage moderation
  sendData?(data: string): Promise<void>;
  onData?(cb: (data: string, participantId: string) => void): void;
}
