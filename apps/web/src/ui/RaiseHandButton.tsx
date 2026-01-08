import type { StageManager } from '@metaverse/moderation';
import { AppleButton } from '@metaverse/ui';
import { useEffect, useState } from 'react';

import type { VoiceClientWithProvider } from '../types/voiceProvider';
import type { World } from '../World';

interface RaiseHandButtonProps {
  world: World | null;
  stageManager: StageManager | null;
}

export function RaiseHandButton({ world, stageManager }: RaiseHandButtonProps) {
  const [hasRaisedHand, setHasRaisedHand] = useState(false);

  useEffect(() => {
    if (!world || !stageManager) return;

    const userId = world.getUserId();
    const checkRaisedHand = () => {
      setHasRaisedHand(stageManager.hasRaisedHand(userId));
    };

    // Initial check
    checkRaisedHand();

    // Subscribe to state changes
    const cleanup = stageManager.onStateChange(() => {
      checkRaisedHand();
    });

    // Keyboard handler for R key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        // Don't trigger if typing in an input field
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        handleToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cleanup();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [world, stageManager]);

  const handleToggle = async () => {
    if (!world || !stageManager) return;
    const voiceClient = world.getVoiceClient();
    if (!voiceClient) return;

    const provider = (voiceClient as VoiceClientWithProvider).provider;
    if (!provider || typeof provider.sendData !== 'function') return;

    const userId = world.getUserId();
    const currentlyRaised = stageManager.hasRaisedHand(userId);

    const message = JSON.stringify({
      type: currentlyRaised ? 'lower_hand' : 'raise_hand',
      participantId: userId,
      timestamp: Date.now(),
    });

    try {
      await provider.sendData(message);
      if (currentlyRaised) {
        stageManager.removeRaisedHand(userId);
      } else {
        stageManager.addRaisedHand(userId);
      }
    } catch (error) {
      console.error('Failed to toggle raise hand:', error);
    }
  };

  if (!world || !stageManager) return null;

  return (
    <AppleButton
      variant={hasRaisedHand ? 'primary' : 'secondary'}
      onClick={handleToggle}
      style={{
        padding: '8px 16px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      {hasRaisedHand ? '✋ Hand senken' : '✋ Hand heben'}
    </AppleButton>
  );
}
