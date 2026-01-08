import type { StageManager } from '@metaverse/moderation';
import { AppleCard, AppleButton } from '@metaverse/ui';

import type { VoiceClientWithProvider } from '../types/voiceProvider';
import type { World } from '../World';

interface StageControlsProps {
  world: World | null;
  stageManager: StageManager | null;
  isHost: boolean;
}

export function StageControls({ world, stageManager, isHost }: StageControlsProps) {
  if (!isHost || !stageManager || !world) return null;

  const state = stageManager.getState();

  const handleLockToggle = async () => {
    if (!world || !stageManager) return;
    const voiceClient = world.getVoiceClient();
    if (!voiceClient) return;

    const provider = (voiceClient as VoiceClientWithProvider).provider;
    if (!provider || typeof provider.sendData !== 'function') return;

    const newLocked = !state.locked;
    const message = JSON.stringify({
      type: newLocked ? 'stage_lock' : 'stage_unlock',
      participantId: world.getUserId(),
      timestamp: Date.now(),
    });

    try {
      await provider.sendData(message);
      stageManager.setLocked(newLocked);
    } catch (error) {
      console.error('Failed to toggle stage lock:', error);
    }
  };

  const handleSpotlightToggle = async (targetId: string) => {
    if (!world || !stageManager) return;
    const voiceClient = world.getVoiceClient();
    if (!voiceClient) return;

    const provider = (voiceClient as VoiceClientWithProvider).provider;
    if (!provider || typeof provider.sendData !== 'function') return;

    const isCurrentlySpotlighted = state.spotlight === targetId;
    const message = JSON.stringify({
      type: isCurrentlySpotlighted ? 'unspotlight' : 'spotlight',
      participantId: world.getUserId(),
      targetId,
      timestamp: Date.now(),
    });

    try {
      await provider.sendData(message);
      stageManager.setSpotlight(isCurrentlySpotlighted ? null : targetId);
    } catch (error) {
      console.error('Failed to toggle spotlight:', error);
    }
  };

  const handleApproveSpeaker = async (targetId: string) => {
    if (!world || !stageManager) return;
    const voiceClient = world.getVoiceClient();
    if (!voiceClient) return;

    const provider = (voiceClient as VoiceClientWithProvider).provider;
    if (!provider || typeof provider.sendData !== 'function') return;

    const message = JSON.stringify({
      type: 'approve_speaker',
      participantId: world.getUserId(),
      targetId,
      timestamp: Date.now(),
    });

    try {
      await provider.sendData(message);
      stageManager.removeRaisedHand(targetId);
    } catch (error) {
      console.error('Failed to approve speaker:', error);
    }
  };

  const handleLowerHand = async (targetId: string) => {
    if (!world || !stageManager) return;
    const voiceClient = world.getVoiceClient();
    if (!voiceClient) return;

    const provider = (voiceClient as VoiceClientWithProvider).provider;
    if (!provider || typeof provider.sendData !== 'function') return;

    const message = JSON.stringify({
      type: 'lower_hand',
      participantId: world.getUserId(),
      targetId,
      timestamp: Date.now(),
    });

    try {
      await provider.sendData(message);
      stageManager.removeRaisedHand(targetId);
    } catch (error) {
      console.error('Failed to lower hand:', error);
    }
  };

  return (
    <AppleCard
      style={{
        padding: '16px',
        background: 'var(--color-fill-secondary)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <h4 className="text-headline" style={{ margin: '0 0 12px', color: 'var(--color-label)' }}>
        Bühnen-Steuerung
      </h4>

      {/* Stage Lock Toggle */}
      <div style={{ marginBottom: '12px' }}>
        <AppleButton
          variant={state.locked ? 'destructive' : 'secondary'}
          onClick={handleLockToggle}
          style={{ width: '100%', marginBottom: '8px' }}
        >
          {state.locked ? '🔒 Bühne entsperren' : '🔓 Bühne sperren'}
        </AppleButton>
      </div>

      {/* Raised Hands Queue */}
      {state.raisedHands.size > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div
            className="text-subheadline"
            style={{
              marginBottom: '8px',
              color: 'var(--color-label-secondary)',
              fontWeight: 600,
            }}
          >
            Meldungen ({state.raisedHands.size})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Array.from(state.raisedHands).map((participantId) => (
              <div
                key={participantId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  background: 'var(--color-fill-primary)',
                  borderRadius: '6px',
                }}
              >
                <span className="text-body" style={{ flex: 1, color: 'var(--color-label)' }}>
                  {participantId}
                </span>
                <AppleButton
                  variant="primary"
                  onClick={() => handleApproveSpeaker(participantId)}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  Genehmigen
                </AppleButton>
                <AppleButton
                  variant="secondary"
                  onClick={() => handleLowerHand(participantId)}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  Ablehnen
                </AppleButton>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spotlight Control */}
      {state.spotlight && (
        <div>
          <div
            className="text-subheadline"
            style={{
              marginBottom: '8px',
              color: 'var(--color-label-secondary)',
              fontWeight: 600,
            }}
          >
            Spotlight
          </div>
          <AppleButton
            variant="secondary"
            onClick={() => state.spotlight && handleSpotlightToggle(state.spotlight)}
            style={{ width: '100%' }}
          >
            ⭐ Spotlight entfernen ({state.spotlight})
          </AppleButton>
        </div>
      )}
    </AppleCard>
  );
}
