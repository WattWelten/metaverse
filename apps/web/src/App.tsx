import type { EmoteId } from '@metaverse/avatars';
import {
  ChatUI,
  ConsentModal,
  EmoteUI,
  HUD,
  MediaUploadUI,
  OverlayHost,
  RoomUI,
} from '@metaverse/ui';
import { useEffect, useRef, useState } from 'react';

import { AuthService } from './auth/AuthService';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DebugOverlay } from './DebugOverlay';
import { FeatureFlags, getFeatureFlags } from './FeatureFlags';
import { getRoomFromURL, copyRoomLink } from './rooms';
import { loadPrefs, type Quality } from './state/prefs';
import { DevicePickerModal } from './ui/DevicePickerModal';
import { EmoteBar } from './ui/EmoteBar';
import { EnterOverlay } from './ui/EnterOverlay';
import { FileUploadPanel } from './ui/FileUploadPanel';
import { useFPS } from './ui/FPS';
import { useJourneyManager } from './ui/JourneyManager';
import { LoginModal } from './ui/LoginModal';
import { MicRing } from './ui/MicRing';
import { ParticipantsPanel } from './ui/ParticipantsPanel';
import { Pinboard } from './ui/Pinboard';
import { PrejoinPanel } from './ui/PrejoinPanel';
import { RaiseHandButton } from './ui/RaiseHandButton';
import { SettingsModal } from './ui/SettingsModal';
import { ShareButton } from './ui/ShareButton';
import { StageControls } from './ui/StageControls';
import { VoicePanel } from './ui/VoicePanel';
import { WhiteboardPanel } from './ui/WhiteboardPanel';
import { ZoneIndicator } from './ui/ZoneIndicator';
import { World } from './World';

export function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<World | null>(null);
  const [templateId, setTemplateId] = useState(() => getFeatureFlags().TEMPLATE_ID);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [playerCount, setPlayerCount] = useState(1);
  const [roomId, setRoomId] = useState(() => getRoomFromURL());
  const [isMuted, setIsMuted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ userId: string; message: string; timestamp: number }>
  >([]);
  const [showChat, setShowChat] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [showEmotes, setShowEmotes] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showPinboard, setShowPinboard] = useState(false);
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showDevicePicker, setShowDevicePicker] = useState(false);
  const [_showEnterOverlay, setShowEnterOverlay] = useState(true);
  const [prejoinDone, setPrejoinDone] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const fps = useFPS(); // FPS Hook
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [authService] = useState(
    () => new AuthService(import.meta.env.VITE_SERVER_URL || 'http://localhost:3001')
  );
  const [session, setSession] = useState<{
    sessionId: string;
    user: { userId: string; username: string };
  } | null>(null);

  // Journey Management - start with login state
  const journey = useJourneyManager('login');

  // Debug overlay visibility - enabled in dev mode or if flag is set
  const [showDebug, setShowDebug] = useState(
    import.meta.env.DEV || import.meta.env.VITE_DEBUG_ENABLED === 'true'
  );

  // Expose feature flags to window for HUD component
  useEffect(() => {
    (window as Window & { __featureFlags?: ReturnType<typeof getFeatureFlags> }).__featureFlags =
      getFeatureFlags();
  }, []);

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

  // Check for existing session on mount (only once)
  useEffect(() => {
    const existingSession = authService.getSession();
    if (existingSession) {
      setSession(existingSession);
      // Validate session (only in multiplayer mode)
      if (getFeatureFlags().MULTIPLAYER_ENABLED) {
        authService.validateSession().then((valid) => {
          if (!valid) {
            journey.transition('login');
          } else {
            journey.transition('prejoin');
          }
        });
      } else {
        // Solo mode - accept local session
        journey.transition('prejoin');
      }
    } else {
      journey.transition('login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // World initialization - only after prejoin state (not during login)
  useEffect(() => {
    // Don't initialize World during login or error states
    if (
      !containerRef.current ||
      !session ||
      journey.state === 'login' ||
      journey.state === 'error'
    ) {
      return;
    }

    // Only initialize when in prejoin, enter, or metaverse state
    if (journey.state !== 'prejoin' && journey.state !== 'enter' && journey.state !== 'metaverse') {
      return;
    }

    // Prevent multiple initializations
    if (worldRef.current) {
      console.log('[App] World already initialized, skipping');
      return;
    }

    console.log('[App] Initializing World (sessionId:', session.sessionId, ')');
    const world = new World(containerRef.current);
    world.setSessionId(session.sessionId);
    worldRef.current = world;

    let chatCleanup: (() => void) | undefined;

    world
      .init()
      .then(() => {
        setReady(true);
        // Chat message listener (after world is initialized)
        if (getFeatureFlags().MULTIPLAYER_ENABLED && worldRef.current) {
          chatCleanup = worldRef.current.onChatMessage((message) => {
            setChatMessages((prev) => [...prev, message]);
          });
        }
      })
      .catch((error) => {
        console.error('Failed to initialize world:', error);
        setReady(true); // Set ready even on error to show prejoin panel
      });

    // Keybinds: View toggle (V key), Settings (M/ESC)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'v') {
        worldRef.current?.switchView();
      }
      if (e.key.toLowerCase() === 'm' || e.key === 'Escape') {
        setSettingsOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Performance monitoring (only update playerCount and roomId, fps comes from useFPS hook)
    let animationFrameId: number | null = null;
    const updateStats = () => {
      if (worldRef.current) {
        setPlayerCount(worldRef.current.getPlayerCount());
        setRoomId(worldRef.current.getRoomId());
        // Update active zone
        const zoneSystem = worldRef.current.getZoneSystem();
        const zoneId = zoneSystem?.getActive() || null;
        if (zoneId) {
          const template = worldRef.current.getCurrentTemplate();
          const zone = template?.manifest?.zones?.find((z) => z.id === zoneId);
          setActiveZone(zone?.label || zoneId);
        } else {
          setActiveZone(null);
        }

        // Update host status
        if (getFeatureFlags().VOICE_ENABLED && worldRef.current.getVoiceClient()) {
          const voiceClient = worldRef.current.getVoiceClient();
          const provider = (
            voiceClient as {
              provider?: { getParticipants?: () => Array<{ identity: string; role?: string }> };
            }
          ).provider;
          if (provider && typeof provider.getParticipants === 'function') {
            const participants = provider.getParticipants();
            const localUser = participants.find(
              (p) => p.identity === worldRef.current?.getUserId()
            );
            setIsHost(localUser?.role === 'host' || false);
          }
        }
      }
      animationFrameId = requestAnimationFrame(updateStats);
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
      chatCleanup?.();
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      if (worldRef.current) {
        worldRef.current.dispose();
        worldRef.current = null;
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [session?.sessionId]); // Only depend on sessionId to prevent re-initialization on journey.state changes

  const handleVoiceConsent = async (accepted: boolean) => {
    setShowConsentModal(false);
    if (accepted) {
      localStorage.setItem('voice-consent', 'true');
      // Automatisch Voice aktivieren nach Consent
      const world = worldRef.current;
      if (world) {
        try {
          await world.enableVoice();
          setVoiceEnabled(true);
          // Update mute state
          const voiceClient = world.getVoiceClient();
          if (voiceClient) {
            setVoiceMuted(voiceClient.isMuted());
          }
        } catch (error) {
          console.error('Failed to enable voice:', error);
        }
      }
    }
  };

  // handleVoiceToggle removed - using handleVoicePanelToggle instead

  const handleVoiceMuteToggle = () => {
    const world = worldRef.current;
    if (!world || !voiceEnabled) return;

    const voiceClient = world.getVoiceClient();
    if (voiceClient) {
      if (voiceMuted) {
        voiceClient.unmute();
        setVoiceMuted(false);
      } else {
        voiceClient.mute();
        setVoiceMuted(true);
      }
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

  const handleSendChatMessage = (message: string) => {
    const world = worldRef.current;
    if (world) {
      world.sendChatMessage(message);
    }
  };

  const handleMediaUpload = (url: string, type: 'image' | 'video') => {
    const world = worldRef.current;
    if (world) {
      world.shareMedia(url, type);
    }
  };

  const handleEmote = (emote: string | EmoteId) => {
    const world = worldRef.current;
    if (world) {
      if (typeof emote === 'string' && emote >= '1' && emote <= '9') {
        world.triggerEmote(emote as EmoteId);
      } else {
        world.setAvatarAnimation(emote as string);
      }
    }
  };

  const handleWhiteboardToggle = () => {
    setShowWhiteboard(!showWhiteboard);
  };

  const handlePinboardToggle = () => {
    setShowPinboard(!showPinboard);
  };

  const handleVoicePanelToggle = () => {
    setShowVoicePanel(!showVoicePanel);
  };

  const handleCopyLink = () => {
    try {
      copyRoomLink();
      console.log('Room link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy room link:', error);
    }
  };

  // Apply quality to renderer
  // Note: Quality is handled internally by World class
  // This function is kept for potential future use
  const applyQuality = (_q: Quality) => {
    // Quality is handled internally by World class
    // No action needed here
  };

  // Journey handlers
  const handleLoginSuccess = (session: {
    sessionId: string;
    user: { userId: string; username: string };
  }) => {
    setSession(session);
    journey.transition('prejoin');
  };

  const handlePrejoinContinue = async () => {
    const prefs = loadPrefs();
    // Avatar/Name an World durchreichen
    try {
      if (prefs.avatarUrl && worldRef.current) {
        await worldRef.current.loadAvatarFromUrl(prefs.avatarUrl);
      }
      const avatarManager = worldRef.current?.getAvatarManager();
      if (avatarManager) {
        avatarManager.setName('me', prefs.username);
      }
    } catch (error) {
      console.error('Failed to apply prefs:', error);
      journey.transition('error', 'Failed to apply preferences');
      return;
    }
    // Qualität anwenden
    applyQuality(prefs.quality);
    // Audio-Volume anwenden
    if (worldRef.current && prefs.audioVolume !== undefined) {
      worldRef.current.setAudioVolume(prefs.audioVolume);
    }
    // Mouse-Invert anwenden
    if (worldRef.current && prefs.mouseInvert !== undefined) {
      worldRef.current.setMouseInvert(prefs.mouseInvert);
    }
    setPrejoinDone(true);
    // Transition to enter state after a short delay for smooth animation
    setTimeout(() => {
      journey.transition('enter');
    }, 300);
  };

  const handleEnterMetaverse = () => {
    journey.transition('metaverse');
    setShowEnterOverlay(false);
  };

  return (
    <ErrorBoundary>
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
        <FeatureFlags />
        <HUD
          playerCount={playerCount}
          fps={fps}
          voiceEnabled={voiceEnabled}
          voiceMuted={voiceMuted}
          onVoiceToggle={getFeatureFlags().VOICE_ENABLED ? handleVoicePanelToggle : undefined}
          onVoiceMuteToggle={getFeatureFlags().VOICE_ENABLED ? handleVoiceMuteToggle : undefined}
          onWhiteboardToggle={
            getFeatureFlags().WHITEBOARD_ENABLED ? handleWhiteboardToggle : undefined
          }
          onPinboardToggle={handlePinboardToggle}
          roomId={roomId}
          onCopyLink={getFeatureFlags().MULTIPLAYER_ENABLED ? handleCopyLink : undefined}
        />
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
        {getFeatureFlags().MULTIPLAYER_ENABLED && (
          <>
            <ChatUI
              messages={chatMessages}
              onSendMessage={handleSendChatMessage}
              currentUserId={worldRef.current?.getUserId()}
              visible={showChat}
              onToggle={() => setShowChat(!showChat)}
            />
            <MediaUploadUI
              onUpload={handleMediaUpload}
              visible={showMediaUpload}
              onToggle={() => setShowMediaUpload(!showMediaUpload)}
            />
            <EmoteUI
              onEmote={handleEmote}
              visible={showEmotes}
              onToggle={() => setShowEmotes(!showEmotes)}
            />
          </>
        )}
        <EmoteBar onEmote={(id) => handleEmote(id)} />
        <ConsentModal
          visible={showConsentModal}
          onAccept={() => handleVoiceConsent(true)}
          onDecline={() => handleVoiceConsent(false)}
        />
        {showDebug && <DebugOverlay world={worldRef.current} />}
        {getFeatureFlags().VOICE_ENABLED && showVoicePanel && <VoicePanel room={roomId} />}
        {getFeatureFlags().WHITEBOARD_ENABLED && showWhiteboard && (
          <WhiteboardPanel room={roomId} />
        )}
        {/* Journey: Login */}
        {journey.state === 'login' && (
          <LoginModal
            onLogin={handleLoginSuccess}
            serverUrl={import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'}
          />
        )}

        {/* Journey: Prejoin */}
        {journey.state === 'prejoin' && session && ready && (
          <PrejoinPanel onContinue={handlePrejoinContinue} />
        )}

        {/* Journey: Enter */}
        {journey.state === 'enter' && worldRef.current && (
          <EnterOverlay
            onEnter={() => {
              // Ensure PlayerController is initialized before locking pointer
              if (worldRef.current && !worldRef.current.hasPlayerController()) {
                // PlayerController will be initialized when template is loaded
                // For now, just proceed to metaverse
                console.log(
                  '[EnterOverlay] PlayerController not yet initialized, proceeding anyway'
                );
              }
              worldRef.current?.lockPointer();
              handleEnterMetaverse();
            }}
          />
        )}

        {/* Settings Modal */}
        <SettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onViewToggle={() => worldRef.current?.switchView()}
          onQuality={applyQuality}
          onAudioVolume={(volume) => {
            worldRef.current?.setAudioVolume(volume);
          }}
          onMouseLockToggle={() => {
            worldRef.current?.togglePointerLock();
          }}
          onMouseInvert={(invert) => {
            worldRef.current?.setMouseInvert(invert);
          }}
        />

        {/* Participants Panel */}
        {getFeatureFlags().VOICE_ENABLED && (
          <>
            <ParticipantsPanel
              open={showParticipants}
              onClose={() => setShowParticipants(false)}
              world={worldRef.current}
              stageManager={worldRef.current?.getStageManager() || null}
            />
            <DevicePickerModal
              open={showDevicePicker}
              onClose={() => setShowDevicePicker(false)}
              world={worldRef.current}
            />
            {import.meta.env.VITE_STAGE_ENABLED === 'true' && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <StageControls
                    world={worldRef.current}
                    stageManager={worldRef.current?.getStageManager() || null}
                    isHost={isHost}
                  />
                  <RaiseHandButton
                    world={worldRef.current}
                    stageManager={worldRef.current?.getStageManager() || null}
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* Topbar: Copy Link + Menu + FPS (Apple Style) */}
        {prejoinDone && (
          <div
            className="glass"
            style={{
              position: 'fixed',
              top: 8,
              left: 8,
              zIndex: 1000,
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              background: 'var(--glass-background)',
              backdropFilter: 'var(--glass-backdrop-blur)',
              WebkitBackdropFilter: 'var(--glass-backdrop-blur)',
              border: '1px solid var(--glass-border)',
              padding: '8px 12px',
              borderRadius: '10px',
              color: 'var(--color-label)',
              fontFamily: 'var(--font-system)',
              fontSize: '14px',
            }}
          >
            <button
              onClick={handleCopyLink}
              className="btn-apple"
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                background: 'var(--color-fill-primary)',
                color: 'var(--color-label)',
              }}
            >
              Copy Link
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="btn-apple"
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                background: 'var(--color-fill-primary)',
                color: 'var(--color-label)',
              }}
            >
              Menü
            </button>
            <ShareButton world={worldRef.current} />
            {getFeatureFlags().VOICE_ENABLED && (
              <>
                <MicRing world={worldRef.current} />
                <button
                  onClick={() => setShowParticipants(true)}
                  className="btn-apple"
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    background: 'var(--color-fill-primary)',
                    color: 'var(--color-label)',
                  }}
                >
                  Teilnehmer
                </button>
                <button
                  onClick={() => setShowDevicePicker(true)}
                  className="btn-apple"
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    background: 'var(--color-fill-primary)',
                    color: 'var(--color-label)',
                  }}
                >
                  Geräte
                </button>
              </>
            )}
            <div style={{ opacity: 0.9, marginLeft: 'auto' }}>
              FPS: {fps} | Players: {playerCount}
            </div>
          </div>
        )}
        <Pinboard visible={showPinboard} onClose={() => setShowPinboard(false)} />

        {/* Journey: Error State */}
        {journey.state === 'error' && journey.error && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
            }}
          >
            <div
              style={{
                background: 'rgba(20, 20, 20, 0.95)',
                border: '1px solid rgba(244, 67, 54, 0.5)',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '400px',
                color: '#fff',
              }}
            >
              <h2 style={{ margin: '0 0 16px 0', color: '#ff5252' }}>Error</h2>
              <p style={{ margin: '0 0 24px 0', color: 'rgba(255, 255, 255, 0.7)' }}>
                {journey.error}
              </p>
              <button
                onClick={journey.retry}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#4CAF50',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* File Upload Panel */}
        {session && (
          <FileUploadPanel
            visible={showFileUpload}
            onClose={() => setShowFileUpload(false)}
            serverUrl={import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'}
            sessionId={session.sessionId}
            onFileUploaded={(file) => {
              if (worldRef.current) {
                worldRef.current.shareFile(file);
              }
            }}
          />
        )}

        {/* File Upload Button */}
        {session && prejoinDone && (
          <button
            onClick={() => setShowFileUpload(true)}
            style={{
              position: 'fixed',
              bottom: '80px',
              right: '20px',
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '12px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              backdropFilter: 'blur(10px)',
              zIndex: 200,
            }}
          >
            📁 Upload File
          </button>
        )}

        {/* Template++ HUD Hinweise */}
        {prejoinDone && (
          <div
            className="glass"
            style={{
              position: 'fixed',
              bottom: 16,
              left: 16,
              zIndex: 1000,
              background: 'var(--glass-background)',
              backdropFilter: 'var(--glass-backdrop-blur)',
              WebkitBackdropFilter: 'var(--glass-backdrop-blur)',
              border: '1px solid var(--glass-border)',
              padding: '12px 16px',
              borderRadius: '10px',
              color: 'var(--color-label)',
              fontFamily: 'var(--font-system)',
              fontSize: '13px',
              pointerEvents: 'none',
            }}
          >
            <div style={{ opacity: 0.9 }}>E = Sitzen/aufstehen</div>
            {activeZone && (
              <div style={{ opacity: 0.7, marginTop: '4px', fontSize: '12px' }}>
                Zone: {activeZone}
              </div>
            )}
          </div>
        )}
        {/* Zone Indicator (Center Screen) */}
        {prejoinDone && (
          <ZoneIndicator
            zoneLabel={activeZone}
            zoneId={activeZone ? worldRef.current?.getZoneSystem()?.getActive() || null : null}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
