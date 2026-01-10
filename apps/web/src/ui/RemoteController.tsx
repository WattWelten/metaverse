import { useEffect, useState, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import QRCode from 'qrcode';
import { getRoomFromURL } from '../rooms';
import { logger } from '../utils/logger';
import { PTTButton } from './PTTButton';
import { RTCClient } from '@metaverse/rtc-sfu';
import { getFeatureFlags } from '../FeatureFlags';

export function RemoteController() {
  const [roomId] = useState(() => getRoomFromURL());
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [paired, setPaired] = useState(false);
  const [pttActive, setPttActive] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const flags = getFeatureFlags();
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

  const socket: Socket | null = useMemo(() => {
    try {
      return io(serverUrl, {
        transports: ['websocket'],
        reconnection: true,
        auth: {
          sessionId: `remote-${Date.now()}`,
        },
      });
    } catch (error) {
      logger.error('[RemoteController] Failed to create socket:', error);
      return null;
    }
  }, [serverUrl]);

  const rtcClient = useMemo(() => {
    if (!flags.RTC_TOKEN_ENDPOINT) return null;
    return new RTCClient();
  }, [flags.RTC_TOKEN_ENDPOINT]);

  useEffect(() => {
    // Generate pair code from URL or create new one
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('pair') || Math.random().toString(36).substring(2, 8).toUpperCase();
    setPairCode(code);

    // Generate QR code
    QRCode.toDataURL(JSON.stringify({ pairCode: code, roomId }))
      .then((url) => setQrDataUrl(url))
      .catch((err) => logger.error('[RemoteController] QR generation failed:', err));

    if (!socket) return;

    // Initialize pairing
    socket.emit('remote:pair:init', { pairCode: code });

    // Listen for pairing confirmation
    socket.on('remote:paired', () => {
      logger.debug('[RemoteController] Paired successfully');
      setPaired(true);
    });

    // Listen for PTT commands from host
    socket.on('host:ptt', ({ down }: { down: boolean }) => {
      if (down) {
        handlePTTStart();
      } else {
        handlePTTEnd();
      }
    });

    return () => {
      socket.off('remote:paired');
      socket.off('host:ptt');
    };
  }, [socket, roomId]);

  const handlePTTStart = async () => {
    if (pttActive) return;
    setPttActive(true);

    if (socket && pairCode) {
      socket.emit('remote:ptt', { pairCode, down: true });
    }

    // Publish mic via RTCClient if available
    if (rtcClient && flags.RTC_TOKEN_ENDPOINT) {
      try {
        await rtcClient.connect({
          tokenEndpoint: flags.RTC_TOKEN_ENDPOINT,
          roomId,
          userId: `remote-${Date.now()}`,
          displayName: 'Remote',
          role: 'speaker',
        });
        await rtcClient.publishMic();
      } catch (error) {
        logger.error('[RemoteController] Failed to publish mic:', error);
      }
    }

    logger.debug('[RemoteController] PTT Start');
  };

  const handlePTTEnd = async () => {
    if (!pttActive) return;
    setPttActive(false);

    if (socket && pairCode) {
      socket.emit('remote:ptt', { pairCode, down: false });
    }

    // Stop mic
    if (rtcClient) {
      rtcClient.stopMic();
    }

    logger.debug('[RemoteController] PTT End');
  };

  const handleEmote = (name: string) => {
    if (socket && pairCode) {
      socket.emit('remote:emote', { pairCode, name });
    }
  };

  const handleMove = (dx: number, dy: number) => {
    if (socket && pairCode) {
      socket.emit('remote:move', { pairCode, dx, dy });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎮 Remote Controller</h1>
        <p style={{ opacity: 0.8 }}>Room: {roomId}</p>
        {pairCode && (
          <p style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Pair Code: <strong>{pairCode}</strong>
          </p>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        {qrDataUrl && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <img
              src={qrDataUrl}
              alt="QR Code"
              width={160}
              height={160}
              style={{ borderRadius: '8px' }}
            />
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
              Scanne diesen QR-Code auf dem Desktop
            </p>
          </div>
        )}

        <PTTButton onPTTStart={handlePTTStart} onPTTEnd={handlePTTEnd} disabled={!paired} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            marginTop: '1rem',
          }}
        >
          <button
            onClick={() => handleMove(0, 1)}
            style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1.5rem',
            }}
          >
            ⬆️
          </button>
          <button
            onClick={() => handleMove(-1, 0)}
            style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1.5rem',
            }}
          >
            ⬅️
          </button>
          <button
            onClick={() => handleMove(1, 0)}
            style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1.5rem',
            }}
          >
            ➡️
          </button>
          <button
            onClick={() => handleMove(0, -1)}
            style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1.5rem',
            }}
          >
            ⬇️
          </button>
          <button
            onClick={() => handleEmote('wave')}
            style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1.5rem',
            }}
          >
            🎭
          </button>
          <button
            onClick={() => handleEmote('clap')}
            style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1.5rem',
            }}
          >
            👏
          </button>
        </div>

        {!paired && (
          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <p style={{ marginBottom: '0.5rem' }}>Warte auf Pairing...</p>
            <p style={{ fontSize: '0.9rem', opacity: '0.8' }}>
              Pair Code: <strong>{pairCode}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
