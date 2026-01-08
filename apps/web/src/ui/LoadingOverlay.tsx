import { AppleButton } from '@metaverse/ui';
import { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  visible: boolean;
  progress?: number; // 0-1
  message?: string;
  error?: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
}

export function LoadingOverlay({
  visible,
  progress,
  message = 'Lädt...',
  error,
  onRetry,
  onCancel,
}: LoadingOverlayProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!visible || error) return;

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [visible, error]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 20000,
        color: 'var(--color-label)',
        fontFamily: 'var(--font-system)',
        animation: 'fadeIn 200ms var(--ease-out)',
      }}
    >
      <div
        className="glass"
        style={{
          padding: '32px',
          borderRadius: '20px',
          background: 'var(--glass-background)',
          backdropFilter: 'var(--glass-backdrop-blur)',
          WebkitBackdropFilter: 'var(--glass-backdrop-blur)',
          border: '1px solid var(--glass-border)',
          minWidth: '300px',
          maxWidth: '400px',
          textAlign: 'center',
        }}
      >
        {error ? (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 className="text-title3" style={{ margin: '0 0 8px', color: 'var(--color-label)' }}>
              Fehler beim Laden
            </h3>
            <p
              className="text-body"
              style={{ margin: '0 0 24px', color: 'var(--color-label-secondary)' }}
            >
              {error}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {onCancel && (
                <AppleButton variant="secondary" onClick={onCancel} style={{ flex: 1 }}>
                  Abbrechen
                </AppleButton>
              )}
              {onRetry && (
                <AppleButton onClick={onRetry} style={{ flex: 1 }}>
                  Erneut versuchen
                </AppleButton>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <h3 className="text-title3" style={{ margin: '0 0 8px', color: 'var(--color-label)' }}>
              {message}
              {dots}
            </h3>
            {progress !== undefined && (
              <div style={{ marginTop: '24px' }}>
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    background: 'var(--color-fill-primary)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${progress * 100}%`,
                      height: '100%',
                      background: 'var(--color-system-blue)',
                      transition: 'width 0.3s var(--ease-out)',
                    }}
                  />
                </div>
                <p
                  className="text-footnote"
                  style={{ marginTop: '8px', color: 'var(--color-label-secondary)' }}
                >
                  {Math.round(progress * 100)}%
                </p>
              </div>
            )}
            {onCancel && (
              <AppleButton
                variant="secondary"
                onClick={onCancel}
                style={{ marginTop: '24px', width: '100%' }}
              >
                Abbrechen
              </AppleButton>
            )}
          </>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
