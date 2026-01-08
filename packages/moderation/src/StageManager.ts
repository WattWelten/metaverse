import type { StageMessage } from './StageProtocol.js';

export interface StageState {
  locked: boolean;
  spotlight: string | null; // participantId
  raisedHands: Set<string>; // participantIds
  hosts: Set<string>; // participantIds
}

export type StageStateListener = (state: StageState) => void;
export type StageMessageListener = (message: StageMessage) => void;

export class StageManager {
  private state: StageState = {
    locked: false,
    spotlight: null,
    raisedHands: new Set(),
    hosts: new Set(),
  };

  private stateListeners: Set<StageStateListener> = new Set();
  private messageListeners: Set<StageMessageListener> = new Set();

  getState(): StageState {
    return {
      ...this.state,
      raisedHands: new Set(this.state.raisedHands),
      hosts: new Set(this.state.hosts),
    };
  }

  onStateChange(listener: StageStateListener): () => void {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  onMessage(listener: StageMessageListener): () => void {
    this.messageListeners.add(listener);
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  handleMessage(message: StageMessage): void {
    // Notify message listeners
    this.messageListeners.forEach((listener) => listener(message));

    // Update state based on message type
    switch (message.type) {
      case 'stage_lock':
        this.state.locked = true;
        this.notifyStateChange();
        break;

      case 'stage_unlock':
        this.state.locked = false;
        this.notifyStateChange();
        break;

      case 'raise_hand':
        this.state.raisedHands.add(message.participantId);
        this.notifyStateChange();
        break;

      case 'lower_hand':
        this.state.raisedHands.delete(message.participantId);
        this.notifyStateChange();
        break;

      case 'approve_speaker': {
        // Approve speaker removes them from raised hands
        const targetId =
          (message as { data?: { targetId?: string } }).data?.targetId || message.participantId;
        this.state.raisedHands.delete(targetId);
        this.notifyStateChange();
        break;
      }

      case 'spotlight': {
        const spotlightTarget =
          (message as { data?: { targetId?: string } }).data?.targetId || message.participantId;
        this.state.spotlight = spotlightTarget;
        this.notifyStateChange();
        break;
      }

      case 'unspotlight':
        this.state.spotlight = null;
        this.notifyStateChange();
        break;

      case 'promote_host': {
        const promoteTarget =
          (message as { data?: { targetId?: string } }).data?.targetId || message.participantId;
        this.state.hosts.add(promoteTarget);
        this.notifyStateChange();
        break;
      }

      case 'demote_host': {
        const demoteTarget =
          (message as { data?: { targetId?: string } }).data?.targetId || message.participantId;
        this.state.hosts.delete(demoteTarget);
        this.notifyStateChange();
        break;
      }
    }
  }

  setLocked(locked: boolean): void {
    this.state.locked = locked;
    this.notifyStateChange();
  }

  setSpotlight(participantId: string | null): void {
    this.state.spotlight = participantId;
    this.notifyStateChange();
  }

  addRaisedHand(participantId: string): void {
    this.state.raisedHands.add(participantId);
    this.notifyStateChange();
  }

  removeRaisedHand(participantId: string): void {
    this.state.raisedHands.delete(participantId);
    this.notifyStateChange();
  }

  addHost(participantId: string): void {
    this.state.hosts.add(participantId);
    this.notifyStateChange();
  }

  removeHost(participantId: string): void {
    this.state.hosts.delete(participantId);
    this.notifyStateChange();
  }

  isHost(participantId: string): boolean {
    return this.state.hosts.has(participantId);
  }

  isSpotlighted(participantId: string): boolean {
    return this.state.spotlight === participantId;
  }

  hasRaisedHand(participantId: string): boolean {
    return this.state.raisedHands.has(participantId);
  }

  private notifyStateChange(): void {
    const state = this.getState();
    this.stateListeners.forEach((listener) => listener(state));
  }
}
