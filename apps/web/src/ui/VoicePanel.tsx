import { useState, useEffect } from 'react';
import { LiveKitProvider } from '@metaverse/voice';

interface VoicePanelProps {
  roomId: string;
  userId: string;
  visible: boolean;
  onClose: () => void;
}

export function VoicePanel({ roomId, userId, visible, onClose }: VoicePanelProps) {
  const [provider] = useState(() => new LiveKitProvider());
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');

  useEffect(() => {
    provider.getDevices().then(setDevices);
  }, [provider]);

  const handleJoin = async () => {
    try {
      await provider.join(roomId, userId);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to join voice room:', error);
    }
  };

  const handleLeave = async () => {
    await provider.leave();
    setIsConnected(false);
  };

  const handleMute = () => {
    const newMuted = !isMuted;
    provider.mute(newMuted);
    setIsMuted(newMuted);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '8px',
        padding: '24px',
        zIndex: 1000,
        minWidth: '320px',
        pointerEvents: 'auto',
      }}
      data-testid="voice-panel"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ color: '#fff', margin: 0 }}>Voice</h3>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '0',
            width: '24px',
            height: '24px',
          }}
        >
          ×
        </button>
      </div>
      {!isConnected ? (
        <button
          onClick={handleJoin}
          style={{
            background: 'rgba(0, 200, 0, 0.7)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            width: '100%',
          }}
        >
          Join Voice Room
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleLeave}
            style={{
              background: 'rgba(200, 0, 0, 0.7)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Leave
          </button>
          <button
            onClick={handleMute}
            style={{
              background: isMuted ? 'rgba(200, 0, 0, 0.7)' : 'rgba(0, 200, 0, 0.7)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {isMuted ? '🔇 Unmute' : '🔊 Mute'}
          </button>
          {devices.length > 0 && (
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value="">Select Device</option>
              {devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || d.kind}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}
