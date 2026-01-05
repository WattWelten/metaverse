import { resumeContext } from '@metaverse/audio';

interface EnterOverlayProps {
  onEnter: () => void;
}

export function EnterOverlay({ onEnter }: EnterOverlayProps) {
  const handleEnter = () => {
    resumeContext();
    onEnter();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
        color: '#fff',
        zIndex: 9999,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>Enter Metaverse</h2>
        <p style={{ marginBottom: '24px', fontSize: '16px', opacity: 0.9 }}>
          Klicke, um Maussteuerung & Audio zu aktivieren.
        </p>
        <button
          onClick={handleEnter}
          style={{
            background: 'rgba(0, 200, 0, 0.7)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          Enter
        </button>
      </div>
    </div>
  );
}
