import { ConsentModal, HUD, OverlayHost, RoomUI } from '@metaverse/ui';
import { useEffect, useRef, useState } from 'react';

import { ErrorBoundary } from './components/ErrorBoundary';
import { DebugOverlay } from './DebugOverlay';
import { FeatureFlags, getFeatureFlags } from './FeatureFlags';
import { World } from './World';

export function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<World | null>(null);
  const [templateId, setTemplateId] = useState(() => getFeatureFlags().TEMPLATE_ID);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [fps, setFps] = useState(0);
  const [playerCount, setPlayerCount] = useState(1);
  const [roomId, setRoomId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || 'default-room';
  });
  const [isMuted, setIsMuted] = useState(false);

  // Debug overlay visibility - enabled in dev mode or if flag is set
  const [showDebug, setShowDebug] = useState(
    import.meta.env.DEV || import.meta.env.VITE_DEBUG_ENABLED === 'true'
  );

  // F12 toggle for debug overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        setShowDebug((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const world = new World(containerRef.current);
    worldRef.current = world;

    world.init().catch((error) => {
      console.error('Failed to initialize world:', error);
    });

    // Performance monitoring
    const updateStats = () => {
      if (worldRef.current) {
        setFps(worldRef.current.getFPS());
        setPlayerCount(worldRef.current.getPlayerCount());
        setRoomId(worldRef.current.getRoomId());
      }
      requestAnimationFrame(updateStats);
    };
    updateStats();

    // Check if voice is enabled and show consent modal
    const flags = getFeatureFlags();
    if (flags.VOICE_ENABLED && !localStorage.getItem('voice-consent')) {
      setShowConsentModal(true);
    }

    // Resume audio context on first user interaction
    const handleFirstInteraction = async () => {
      const { resumeContext } = await import('@metaverse/audio');
      await resumeContext();
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      world.dispose();
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const handleVoiceConsent = async (accepted: boolean) => {
    setShowConsentModal(false);
    if (accepted) {
      localStorage.setItem('voice-consent', 'true');
      try {
        await worldRef.current?.enableVoice();
      } catch (error) {
        console.error('Failed to enable voice after consent:', error);
      }
    } else {
      localStorage.setItem('voice-consent', 'declined');
    }
  };

  const handleOverlayAction = (action: { type: string; payload?: unknown }) => {
    console.log('Overlay action:', action);

    switch (action.type) {
      case 'switch-template':
        if (
          action.payload &&
          typeof action.payload === 'object' &&
          'templateId' in action.payload
        ) {
          const newTemplateId = action.payload.templateId as string;
          setTemplateId(newTemplateId);

          const world = worldRef.current;
          if (!world) return;

          const template = world.getCurrentTemplate();
          const scene = world.getScene();

          if (template && scene) {
            template.unmount();
            // Template wird beim nächsten Render neu gemountet
            world.loadTemplate(newTemplateId).catch((error) => {
              console.error('Failed to switch template:', error);
            });
          }
        }
        break;
      case 'open-menu':
        // Menu-Logik hier
        break;
      default:
        console.warn('Unknown overlay action:', action.type);
    }
  };

  const handleLeaveRoom = () => {
    const world = worldRef.current;
    if (world) {
      const netClient = world.getNetClient();
      if (netClient) {
        netClient.leaveRoom(roomId);
      }
    }
    // Redirect to home without room parameter
    window.location.href = window.location.pathname;
  };

  const handleMuteToggle = (muted: boolean) => {
    setIsMuted(muted);
    const world = worldRef.current;
    if (world) {
      const voiceClient = world.getVoiceClient();
      if (voiceClient) {
        if (muted) {
          voiceClient.mute();
        } else {
          voiceClient.unmute();
        }
      }
    }
  };

  return (
    <ErrorBoundary>
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
        <FeatureFlags />
        <HUD playerCount={playerCount} fps={fps} />
        {getFeatureFlags().MULTIPLAYER_ENABLED && (
          <RoomUI
            roomId={roomId}
            playerCount={playerCount}
            onLeave={handleLeaveRoom}
            onMuteToggle={getFeatureFlags().VOICE_ENABLED ? handleMuteToggle : undefined}
            isVoiceEnabled={getFeatureFlags().VOICE_ENABLED}
            isMuted={isMuted}
          />
        )}
        <OverlayHost templateId={templateId} onAction={handleOverlayAction} />
        <ConsentModal
          visible={showConsentModal}
          onAccept={() => handleVoiceConsent(true)}
          onDecline={() => handleVoiceConsent(false)}
        />
        {showDebug && <DebugOverlay world={worldRef.current} />}
      </div>
    </ErrorBoundary>
  );
}
