import { CSSProperties, ReactNode, useEffect } from 'react';

interface AppleModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  style?: CSSProperties;
}

export function AppleModal({ open, onClose, children, title, style }: AppleModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: 'fadeIn 150ms var(--ease-out)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="glass"
        style={{
          background: 'var(--glass-background)',
          backdropFilter: 'var(--glass-backdrop-blur)',
          WebkitBackdropFilter: 'var(--glass-backdrop-blur)',
          border: '1px solid var(--glass-border)',
          borderRadius: '20px',
          padding: '24px',
          width: '90%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflow: 'auto',
          color: 'var(--color-label)',
          fontFamily: 'var(--font-system)',
          animation: 'slideUp 250ms var(--ease-spring)',
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h3 className="text-title3" style={{ margin: 0, color: 'var(--color-label)' }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-label-secondary)',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'all var(--duration-fast) var(--ease-out)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-fill-primary)';
                e.currentTarget.style.color = 'var(--color-label)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = 'var(--color-label-secondary)';
              }}
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
