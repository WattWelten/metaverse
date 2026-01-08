import { AppleButton } from '@metaverse/ui';
import { useState, useEffect } from 'react';

import { getFeatureFlags } from '../FeatureFlags';
import type { VoiceClientWithProvider } from '../types/voiceProvider';
import { World } from '../World';

interface ShareButtonProps {
  world: World | null;
}

export function ShareButton({ world }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const flags = getFeatureFlags();

  if (!flags.SHARE_ENABLED || !world) {
    return null;
  }

  const handleShare = async () => {
    if (!world) return;
    const voiceClient = world.getVoiceClient();
    if (!voiceClient) return;

    const provider = (voiceClient as VoiceClientWithProvider).provider;
    if (!provider || typeof provider.startScreenShare !== 'function') return;

    if (isSharing) {
      await provider.stopScreenShare?.();
      world.attachRemoteStream('local', null);
      setIsSharing(false);
    } else {
      const stream = await provider.startScreenShare?.();
      if (stream) {
        world.attachLocalStream(stream);
        setIsSharing(true);
      }
    }
  };

  // Listen for remote screen shares
  useEffect(() => {
    if (!world) return;
    const voiceClient = world.getVoiceClient();
    if (!voiceClient) return;

    const provider = (voiceClient as VoiceClientWithProvider).provider;
    if (provider && typeof provider.onRemoteScreen === 'function') {
      provider.onRemoteScreen((participantId: string, stream: MediaStream | null) => {
        world.attachRemoteStream(participantId, stream);
      });
    }
  }, [world]);

  return (
    <AppleButton
      onClick={handleShare}
      variant={isSharing ? 'destructive' : 'primary'}
      style={{ fontSize: '13px', padding: '6px 12px' }}
    >
      {isSharing ? 'Stop Share' : 'Share Screen'}
    </AppleButton>
  );
}
