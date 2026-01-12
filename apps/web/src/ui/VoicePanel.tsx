import { RTCClient } from '@metaverse/rtc-sfu';
import { getFeatureFlags } from '../FeatureFlags';
import { loadPrefs } from '../state/prefs';
import { logger } from '../utils/logger';
import { t } from '../i18n';
import { useEffect, useMemo, useState } from 'react';

const ENABLED = import.meta.env.VITE_VOICE_ENABLED === 'true';

interface VoicePanelProps {
  room: string;
  userId?: string;
  displayName?: string;
  role?: 'host' | 'moderator' | 'speaker' | 'guest';
}

export function VoicePanel({ room, userId, displayName, role = 'guest' }: VoicePanelProps) {
  const [state, setState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [devices, setDevices] = useState<
    { id: string; label: string; kind: 'audioinput' | 'audiooutput' }[]
  >([]);
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const flags = getFeatureFlags();
  const prefs = loadPrefs();

  const rtcClient = useMemo(() => new RTCClient(), []);

  useEffect(() => {
    // Load devices on mount
    navigator.mediaDevices.enumerateDevices().then((deviceList) => {
      setDevices(
        deviceList
          .filter((d) => d.kind === 'audioinput' || d.kind === 'audiooutput')
          .map((d) => ({
            id: d.deviceId,
            label: d.label || d.kind,
            kind: d.kind as 'audioinput' | 'audiooutput',
          }))
      );
    });
  }, []);

  if (!ENABLED) return null;

  const effectiveUserId = userId || `user-${Date.now()}`;
  const effectiveDisplayName = displayName || prefs.username || 'Guest';

  async function join() {
    if (!flags.RTC_TOKEN_ENDPOINT) {
      logger.error('[VoicePanel] RTC_TOKEN_ENDPOINT nicht konfiguriert');
      setState('error');
      return;
    }

    setState('connecting');
    try {
      await rtcClient.connect({
        tokenEndpoint: flags.RTC_TOKEN_ENDPOINT,
        roomId: room,
        userId: effectiveUserId,
        displayName: effectiveDisplayName,
        role,
      });

      await rtcClient.publishMic();
      setJoined(true);
      setState('connected');
    } catch (error) {
      logger.error('[VoicePanel] Failed to join voice room:', error);
      setState('error');
    }
  }

  async function leave() {
    rtcClient.stopMic();
    rtcClient.disconnect();
    setJoined(false);
    setState('idle');
  }

  async function toggleMute() {
    if (muted) {
      await rtcClient.publishMic();
      setMuted(false);
    } else {
      rtcClient.stopMic();
      setMuted(true);
    }
  }

  return (
    <div
      className="voice-panel"
      data-testid="voice-panel"
      style={{
        padding: '1rem',
        background: 'rgba(0,0,0,0.8)',
        borderRadius: '8px',
        color: 'white',
      }}
    >
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Voice:</strong> {state}
        {joined && (
          <span style={{ marginLeft: '0.5rem', color: muted ? '#f00' : '#0f0' }}>
            {muted ? '🔇 Muted' : '🎤 Active'}
          </span>
        )}
      </div>
      {!joined ? (
        <button onClick={join} disabled={state === 'connecting'}>
          {state === 'connecting' ? t('loading') : t('join')}
        </button>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={toggleMute}>{muted ? t('unmute') : t('mute')}</button>
            <button onClick={leave}>{t('leave')}</button>
          </div>
          <select
            onChange={(e) => {
              rtcClient.publishMic(e.target.value || undefined);
            }}
            style={{ marginTop: '0.5rem' }}
          >
            <option value="">Default Device</option>
            {devices
              .filter((d) => d.kind === 'audioinput')
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
}
