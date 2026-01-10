import { useEffect, useState } from 'react';
import { getRoomFromURL } from '../rooms';
import { logger } from '../utils/logger';

interface QRPairingProps {
  onPairCodeGenerated?: (code: string) => void;
}

export function QRPairing({ onPairCodeGenerated }: QRPairingProps) {
  const [pairCode, setPairCode] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    // Generate pair code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setPairCode(code);
    onPairCodeGenerated?.(code);

    // Generate QR code data URL
    const roomId = getRoomFromURL();
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5173';
    const remoteUrl = `${serverUrl}/remote?room=${encodeURIComponent(roomId)}&pair=${code}`;

    // Simple QR code generation using qrcode library or canvas
    // For now, we'll use a simple text-based approach
    // In production, use a QR code library like 'qrcode'
    generateQRCode(remoteUrl)
      .then(setQrDataUrl)
      .catch((err) => {
        logger.error('[QRPairing] Failed to generate QR code:', err);
      });
  }, [onPairCodeGenerated]);

  const generateQRCode = async (_text: string): Promise<string> => {
    // Fallback: return data URL for simple QR code
    // In production, use: import QRCode from 'qrcode';
    // return QRCode.toDataURL(text);

    // For now, create a simple canvas-based QR placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#000';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('QR Code', 100, 100);
      ctx.fillText('(Use QR lib)', 100, 120);
    }
    return canvas.toDataURL();
  };

  return (
    <div
      style={{
        padding: '1.5rem',
        background: 'rgba(0,0,0,0.8)',
        borderRadius: '12px',
        color: 'white',
        textAlign: 'center',
      }}
    >
      <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>📱 Companion-Phone verbinden</h3>
      {qrDataUrl && (
        <div style={{ marginBottom: '1rem' }}>
          <img src={qrDataUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
        </div>
      )}
      <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
        Scanne diesen QR-Code mit deinem Smartphone
      </p>
      <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
        Oder gib diesen Code ein: <strong>{pairCode}</strong>
      </p>
    </div>
  );
}
