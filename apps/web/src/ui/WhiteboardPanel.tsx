import { Excalidraw } from '@excalidraw/excalidraw';
import { useState, useEffect, useRef } from 'react';
import { WhiteboardClient } from '@metaverse/whiteboard';

interface WhiteboardPanelProps {
  roomId: string;
  visible: boolean;
  onClose: () => void;
}

export function WhiteboardPanel({ roomId, visible, onClose }: WhiteboardPanelProps) {
  const [client] = useState(() => new WhiteboardClient());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      const wsUrl = import.meta.env.VITE_YWS_URL || 'ws://localhost:1234';
      client.connect(wsUrl, `whiteboard-${roomId}`);
    } else {
      client.disconnect();
    }
  }, [visible, roomId, client]);

  // Yjs-Sync mit Excalidraw würde hier implementiert werden
  // (Y.Map für Shapes, Awareness für Cursors)

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
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
        width: isFullscreen ? '100vw' : '80vw',
        height: isFullscreen ? '100vh' : '80vh',
        maxWidth: isFullscreen ? 'none' : '1200px',
        maxHeight: isFullscreen ? 'none' : '800px',
        pointerEvents: 'auto',
      }}
      data-testid="whiteboard-panel"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ color: '#fff', margin: 0 }}>Whiteboard</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
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
      </div>
      <div style={{ width: '100%', height: 'calc(100% - 60px)' }}>
        <Excalidraw />
      </div>
    </div>
  );
}
