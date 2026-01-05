export interface HUDProps {
  playerCount?: number;
  fps?: number;
  onMenuClick?: () => void;
  voiceEnabled?: boolean;
  voiceMuted?: boolean;
  onVoiceToggle?: () => void;
  onVoiceMuteToggle?: () => void;
  onWhiteboardToggle?: () => void;
  onPinboardToggle?: () => void;
  roomId?: string;
  onCopyLink?: () => void;
}

export function HUD({
  playerCount,
  fps,
  onMenuClick,
  voiceEnabled = false,
  voiceMuted = false,
  onVoiceToggle,
  onVoiceMuteToggle,
  onWhiteboardToggle,
  onPinboardToggle,
  roomId,
  onCopyLink,
}: HUDProps) {
  // Dynamically check feature flags (will be passed from App.tsx)
  const whiteboardEnabled =
    typeof window !== 'undefined' && (window as any).__featureFlags?.WHITEBOARD_ENABLED;
  const voiceEnabledFlag =
    typeof window !== 'undefined' && (window as any).__featureFlags?.VOICE_ENABLED;
  const multiplayerEnabled =
    typeof window !== 'undefined' && (window as any).__featureFlags?.MULTIPLAYER_ENABLED;
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {playerCount !== undefined && (
            <div style={{ color: '#fff', fontSize: '14px' }}>Players: {playerCount}</div>
          )}
          {fps !== undefined && <div style={{ color: '#fff', fontSize: '14px' }}>FPS: {fps}</div>}
          {onVoiceToggle && (
            <button
              onClick={onVoiceToggle}
              style={{
                background: voiceEnabled ? 'rgba(0, 200, 0, 0.7)' : 'rgba(200, 0, 0, 0.7)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              title={voiceEnabled ? 'Voice aktiviert' : 'Voice deaktiviert'}
            >
              <span>🎤</span>
              {voiceEnabled ? 'Voice ON' : 'Voice OFF'}
            </button>
          )}
          {onVoiceMuteToggle && voiceEnabled && (
            <button
              onClick={onVoiceMuteToggle}
              style={{
                background: voiceMuted ? 'rgba(200, 0, 0, 0.7)' : 'rgba(0, 200, 0, 0.7)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              title={voiceMuted ? 'Stumm' : 'Nicht stumm'}
            >
              <span>{voiceMuted ? '🔇' : '🔊'}</span>
              {voiceMuted ? 'Muted' : 'Unmuted'}
            </button>
          )}
          {whiteboardEnabled && onWhiteboardToggle && (
            <button
              onClick={onWhiteboardToggle}
              data-testid="whiteboard-toggle"
              style={{
                background: 'rgba(0, 150, 255, 0.7)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              title="Whiteboard"
            >
              <span>📝</span>
              Whiteboard
            </button>
          )}
          {onPinboardToggle && (
            <button
              onClick={onPinboardToggle}
              data-testid="pinboard-toggle"
              style={{
                background: 'rgba(150, 100, 200, 0.7)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              title="Pinboard"
            >
              <span>📌</span>
              Pinboard
            </button>
          )}
          {voiceEnabledFlag && onVoiceToggle && (
            <button
              onClick={onVoiceToggle}
              data-testid="voice-toggle"
              style={{
                background: voiceEnabled ? 'rgba(0, 200, 0, 0.7)' : 'rgba(200, 0, 0, 0.7)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              title={voiceEnabled ? 'Voice aktiviert' : 'Voice deaktiviert'}
            >
              <span>🎤</span>
              Voice
            </button>
          )}
          {multiplayerEnabled && roomId && onCopyLink && (
            <button
              onClick={onCopyLink}
              data-testid="copy-link"
              style={{
                background: 'rgba(100, 100, 100, 0.7)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              title="Copy Room Link"
            >
              <span>🔗</span>
              Copy Link
            </button>
          )}
        </div>
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Menu
          </button>
        )}
      </div>

      {/* Footer Links */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          gap: '20px',
          justifyContent: 'flex-start',
          pointerEvents: 'auto',
        }}
      >
        <a
          href="/privacy.html"
          target="_blank"
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '12px',
            textDecoration: 'none',
          }}
        >
          Datenschutz
        </a>
        <a
          href="/imprint.html"
          target="_blank"
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '12px',
            textDecoration: 'none',
          }}
        >
          Impressum
        </a>
        <a
          href="/ATTRIBUTION.md"
          target="_blank"
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '12px',
            textDecoration: 'none',
          }}
        >
          Assets & Lizenzen
        </a>
      </div>
    </div>
  );
}
