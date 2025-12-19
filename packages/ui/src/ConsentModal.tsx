
export interface ConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
  title?: string;
  message?: string;
}

export function ConsentModal({
  visible,
  onAccept,
  onDecline,
  title = 'Microphone Access Required',
  message = 'This application requires microphone access for voice communication. Do you want to enable it?',
}: ConsentModalProps) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: '#1e293b',
          padding: '32px',
          borderRadius: '8px',
          minWidth: '400px',
          maxWidth: '500px',
        }}
      >
        <h2 style={{ color: '#fff', marginTop: 0, marginBottom: '16px' }}>
          {title}
        </h2>
        <p style={{ color: '#94a3b8', marginBottom: '24px' }}>{message}</p>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onDecline}
            style={{
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid #475569',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            style={{
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

