import type { StageManager } from '@metaverse/moderation';
import { AppleModal, AppleCard, AppleButton } from '@metaverse/ui';
import type { ParticipantInfo } from '@metaverse/voice';
import { useEffect, useState } from 'react';

import type { VoiceClientWithProvider } from '../types/voiceProvider';
import type { World } from '../World';

interface ParticipantsPanelProps {
  open: boolean;
  onClose: () => void;
  world: World | null;
  stageManager?: StageManager | null;
}

export function ParticipantsPanel({ open, onClose, world, stageManager }: ParticipantsPanelProps) {
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [activeSpeakers, setActiveSpeakers] = useState<Set<string>>(new Set());
  const localUserId = world?.getUserId() || '';

  useEffect(() => {
    if (!open || !world) return;

    const voiceClient = world.getVoiceClient();
    if (!voiceClient) return;

    const provider = (voiceClient as VoiceClientWithProvider).provider;
    if (!provider || typeof provider.getParticipants !== 'function') return;

    // Initial load
    const initialParticipants = provider.getParticipants?.();
    if (initialParticipants) {
      // Map to ParticipantInfo format
      const mappedParticipants: ParticipantInfo[] = initialParticipants.map(
        (p: ParticipantInfo) => ({
          id: p.id,
          identity: p.identity,
          name: p.name,
          isSpeaking: false, // Will be updated by onActiveSpeakers
          isMuted: p.isMuted ?? false,
          role: p.role as 'host' | 'participant' | undefined,
        })
      );
      setParticipants(mappedParticipants);
    }

    // Subscribe to updates
    let cleanupFn: (() => void) | undefined;
    if (typeof provider.onParticipantUpdate === 'function') {
      provider.onParticipantUpdate(() => {
        const updated = provider.getParticipants?.();
        if (updated) {
          const mapped: ParticipantInfo[] = updated.map((p: ParticipantInfo) => ({
            id: p.id,
            identity: p.identity,
            name: p.name,
            isSpeaking: false,
            isMuted: p.isMuted ?? false,
            role: p.role as 'host' | 'participant' | undefined,
          }));
          setParticipants(mapped);
        }
      });
    }

    // Subscribe to active speakers
    if (typeof provider.onActiveSpeakers === 'function') {
      provider.onActiveSpeakers((speakerIds: string[]) => {
        setActiveSpeakers(new Set(speakerIds));
      });
    }

    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [open, world]);

  const handleSpotlight = async (targetId: string) => {
    if (!world || !stageManager) return;
    const voiceClient = world.getVoiceClient();
    if (!voiceClient) return;

    const provider = (voiceClient as VoiceClientWithProvider).provider;
    if (!provider || typeof provider.sendData !== 'function') return;

    const state = stageManager.getState();
    const isCurrentlySpotlighted = state.spotlight === targetId;

    const message = JSON.stringify({
      type: isCurrentlySpotlighted ? 'unspotlight' : 'spotlight',
      participantId: localUserId,
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

  const handlePromoteHost = async (targetId: string) => {
    if (!world || !stageManager) return;
    const voiceClient = world.getVoiceClient();
    if (!voiceClient) return;

    const provider = (voiceClient as VoiceClientWithProvider).provider;
    if (!provider || typeof provider.sendData !== 'function') return;

    const state = stageManager.getState();
    const isCurrentlyHost = state.hosts.has(targetId);

    const message = JSON.stringify({
      type: isCurrentlyHost ? 'demote_host' : 'promote_host',
      participantId: localUserId,
      targetId,
      timestamp: Date.now(),
    });

    try {
      await provider.sendData(message);
      if (isCurrentlyHost) {
        stageManager.removeHost(targetId);
      } else {
        stageManager.addHost(targetId);
      }
    } catch (error) {
      console.error('Failed to toggle host:', error);
    }
  };

  return (
    <AppleModal open={open} onClose={onClose} title="Teilnehmer">
      <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '8px 0' }}>
        {participants.length === 0 ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              color: 'var(--color-label-secondary)',
              fontSize: '15px',
            }}
          >
            Keine Teilnehmer
          </div>
        ) : (
          participants.map((participant) => {
            const isLocal = participant.identity === localUserId;
            const isSpeaking = activeSpeakers.has(participant.identity);
            const isHost = participant.role === 'host';

            return (
              <AppleCard
                key={participant.id}
                style={{
                  marginBottom: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: isSpeaking
                    ? 'rgba(10, 132, 255, 0.15)'
                    : 'var(--color-fill-secondary)',
                  border: isSpeaking
                    ? '1px solid var(--color-system-blue)'
                    : '1px solid transparent',
                  transition: 'all 150ms var(--ease-in-out)',
                }}
              >
                {/* Avatar/Avatar Icon */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isLocal ? 'var(--color-system-blue)' : 'var(--color-fill-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: isLocal ? '#fff' : 'var(--color-label)',
                    flexShrink: 0,
                  }}
                >
                  {participant.name?.[0]?.toUpperCase() ||
                    participant.identity[0]?.toUpperCase() ||
                    '?'}
                </div>

                {/* Name & Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      className="text-body"
                      style={{
                        fontWeight: isLocal ? 600 : 400,
                        color: 'var(--color-label)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {participant.name || participant.identity}
                      {isLocal && (
                        <span
                          style={{
                            marginLeft: '6px',
                            fontSize: '13px',
                            color: 'var(--color-label-secondary)',
                          }}
                        >
                          (Du)
                        </span>
                      )}
                    </span>
                    {isHost && (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'var(--color-system-orange)',
                          color: '#fff',
                          fontWeight: 600,
                        }}
                      >
                        Host
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: 'var(--color-label-secondary)',
                    }}
                  >
                    {isSpeaking && (
                      <span
                        style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--color-system-green)',
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                      />
                    )}
                    <span>{isSpeaking ? 'Spricht' : participant.isMuted ? 'Stumm' : 'Aktiv'}</span>
                  </div>
                </div>

                {/* Status Icons & Host Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexShrink: 0,
                  }}
                >
                  {participant.isMuted && (
                    <span
                      style={{
                        fontSize: '18px',
                        color: 'var(--color-system-red)',
                      }}
                      title="Stumm geschaltet"
                    >
                      🔇
                    </span>
                  )}
                  {!participant.isMuted && !isSpeaking && (
                    <span
                      style={{
                        fontSize: '18px',
                        color: 'var(--color-label-tertiary)',
                      }}
                      title="Mikrofon aktiv"
                    >
                      🎤
                    </span>
                  )}
                  {isHost && !isLocal && stageManager && (
                    <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                      <AppleButton
                        variant="secondary"
                        onClick={() => handleSpotlight(participant.identity)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          minWidth: 'auto',
                        }}
                      >
                        {stageManager.isSpotlighted(participant.identity) ? '⭐' : '⭐'}
                      </AppleButton>
                      <AppleButton
                        variant="secondary"
                        onClick={() => handlePromoteHost(participant.identity)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          minWidth: 'auto',
                        }}
                      >
                        {stageManager.isHost(participant.identity) ? '👑' : '👑'}
                      </AppleButton>
                    </div>
                  )}
                </div>
              </AppleCard>
            );
          })
        )}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }
      `}</style>
    </AppleModal>
  );
}
