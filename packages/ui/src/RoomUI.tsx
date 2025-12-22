import { useState } from 'react';

export interface RoomUIProps {
  roomId: string;
  playerCount: number;
  onLeave?: () => void;
  onMuteToggle?: (muted: boolean) => void;
  isVoiceEnabled?: boolean;
  isMuted?: boolean;
}

export function RoomUI({
  roomId,
  playerCount,
  onLeave,
  onMuteToggle,
  isVoiceEnabled = false,
  isMuted = false,
}: RoomUIProps) {
  const [copied, setCopied] = useState(false);

  const copyRoomLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '16px',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '14px',
        minWidth: '200px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        zIndex: 200,
        pointerEvents: 'auto',
      }}
    >
      <div style={{ marginBottom: '12px', fontWeight: '600' }}>Room: {roomId}</div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ marginBottom: '8px' }}>Players: {playerCount}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={copyRoomLink}
          style={{
            background: copied ? 'rgba(76, 175, 80, 0.8)' : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background 0.2s',
          }}
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>

        {isVoiceEnabled && onMuteToggle && (
          <button
            onClick={() => onMuteToggle(!isMuted)}
            style={{
              background: isMuted ? 'rgba(244, 67, 54, 0.8)' : 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {isMuted ? '🔇 Unmute' : '🔊 Mute'}
          </button>
        )}

        {onLeave && (
          <button
            onClick={onLeave}
            style={{
              background: 'rgba(244, 67, 54, 0.8)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Leave Room
          </button>
        )}
      </div>
    </div>
  );
}
