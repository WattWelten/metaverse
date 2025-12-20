import { ConsentModal, HUD, OverlayHost } from '@metaverse/ui';
import { useEffect, useRef, useState } from 'react';

import { ErrorBoundary } from './components/ErrorBoundary';
import { FeatureFlags, getFeatureFlags } from './FeatureFlags';
import { World } from './World';

export function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<World | null>(null);
  const [templateId, setTemplateId] = useState(() => getFeatureFlags().TEMPLATE_ID);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [fps, setFps] = useState(0);
  const [playerCount, setPlayerCount] = useState(1);

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
      }
      requestAnimationFrame(updateStats);
    };
    updateStats();

    // Check if voice is enabled and show consent modal
    const flags = getFeatureFlags();
    if (flags.VOICE_ENABLED && !localStorage.getItem('voice-consent')) {
      setShowConsentModal(true);
    }

    return () => {
      world.dispose();
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

  return (
    <ErrorBoundary>
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
        <FeatureFlags />
        <HUD playerCount={playerCount} fps={fps} />
        <OverlayHost templateId={templateId} onAction={handleOverlayAction} />
        <ConsentModal
          visible={showConsentModal}
          onAccept={() => handleVoiceConsent(true)}
          onDecline={() => handleVoiceConsent(false)}
        />
      </div>
    </ErrorBoundary>
  );
}
