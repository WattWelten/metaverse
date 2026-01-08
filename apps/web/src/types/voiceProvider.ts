/**
 * Voice Provider Interface
 * Used to type-check voice provider access without using 'any'
 */

import type { IVoiceProvider, DeviceInfo } from '@metaverse/voice';

export interface VoiceProvider extends Omit<IVoiceProvider, 'listDevices'> {
  // Additional methods that may be available
  listDevices?: () => Promise<DeviceInfo[]>;
  getInputDevices?: () => Promise<Array<{ id: string; label: string }>>;
  getOutputDevices?: () => Promise<Array<{ id: string; label: string }>>;
  onActiveSpeakers?: (cb: (speakerIds: string[]) => void) => void;
  onData?: (cb: (data: string, participantId: string) => void) => void;
  setPeerPosition?: (peerId: string, x: number, y: number, z: number) => void;
  room?: unknown; // Room object type depends on provider
}

export interface VoiceClientWithProvider {
  provider?: VoiceProvider;
}
