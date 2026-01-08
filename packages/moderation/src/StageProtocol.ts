/**
 * Stage Moderation Protocol
 * Defines data channel messages for stage moderation features
 */

export type StageMessageType =
  | 'stage_lock'
  | 'stage_unlock'
  | 'raise_hand'
  | 'lower_hand'
  | 'approve_speaker'
  | 'promote_host'
  | 'demote_host'
  | 'spotlight'
  | 'unspotlight';

export interface StageMessage {
  type: StageMessageType;
  participantId: string;
  timestamp: number;
  data?: unknown;
}

export interface RaiseHandMessage extends StageMessage {
  type: 'raise_hand';
  participantId: string;
}

export interface SpotlightMessage extends StageMessage {
  type: 'spotlight' | 'unspotlight';
  participantId: string;
  targetId: string;
}

export interface StageLockMessage extends StageMessage {
  type: 'stage_lock' | 'stage_unlock';
  participantId: string;
}

export interface ApproveSpeakerMessage extends StageMessage {
  type: 'approve_speaker';
  participantId: string;
  targetId: string;
}

export interface PromoteHostMessage extends StageMessage {
  type: 'promote_host' | 'demote_host';
  participantId: string;
  targetId: string;
}

export function createStageMessage(
  type: StageMessageType,
  participantId: string,
  targetId?: string
): StageMessage {
  const base: StageMessage = {
    type,
    participantId,
    timestamp: Date.now(),
  };

  if (
    targetId &&
    (type === 'spotlight' ||
      type === 'unspotlight' ||
      type === 'approve_speaker' ||
      type === 'promote_host' ||
      type === 'demote_host')
  ) {
    return {
      ...base,
      data: { targetId },
    } as SpotlightMessage | ApproveSpeakerMessage | PromoteHostMessage;
  }

  return base;
}

export function parseStageMessage(data: string): StageMessage | null {
  try {
    const parsed = JSON.parse(data);
    if (parsed.type && parsed.participantId && parsed.timestamp) {
      return parsed as StageMessage;
    }
    return null;
  } catch {
    return null;
  }
}
