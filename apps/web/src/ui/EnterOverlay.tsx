import { resumeContext } from '@metaverse/audio';
import { AppleButton } from '@metaverse/ui';
import { useState, useEffect, useRef } from 'react';

interface EnterOverlayProps {
  onEnter: () => void;
}

export function EnterOverlay({ onEnter }: EnterOverlayProps) {
  const [loading, setLoading] = useState(false);
  const [pointerLockError, setPointerLockError] = useState(false);
  const retryTimeoutRef = useRef<number | null>(null);
  const lastRetryRef = useRef<number>(0);
  const errorHandlerRef = useRef<(() => void) | null>(null);
  const mouseMoveHandlerRef = useRef<(() => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (errorHandlerRef.current) {
        document.removeEventListener('pointerlockerror', errorHandlerRef.current);
      }
      if (mouseMoveHandlerRef.current) {
        document.removeEventListener('mousemove', mouseMoveHandlerRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const handleEnter = async () => {
    setLoading(true);
    setPointerLockError(false);

    try {
      await resumeContext();
      onEnter();

      // Focus auf Canvas setzen für Keyboard-Events
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) {
        console.warn('[PointerLock] Canvas not found');
        setLoading(false);
        return;
      }

      canvas.focus();
      console.log('[PointerLock] Canvas focused, requesting lock...');

      // Pointer-Lock Error Handling
      const handlePointerLockError = () => {
        console.warn('[PointerLock] Failed to lock pointer - user interaction may be required');
        setPointerLockError(true);
      };

      errorHandlerRef.current = handlePointerLockError;
      document.addEventListener('pointerlockerror', handlePointerLockError);

      // Retry mechanism (throttled: max every 2s)
      const retryLock = () => {
        const now = Date.now();
        if (now - lastRetryRef.current < 2000) return; // Throttle: max every 2s
        lastRetryRef.current = now;

        if (document.pointerLockElement !== canvas && canvas.requestPointerLock) {
          console.log('[PointerLock] Retrying pointer lock...');
          canvas.requestPointerLock();
        }
      };

      // Try to request lock immediately
      if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
      }

      // Retry on mouse move if not locked (user might move mouse to trigger)
      const handleMouseMove = () => {
        if (document.pointerLockElement === canvas) {
          // Success! Clean up
          setPointerLockError(false);
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('pointerlockerror', handlePointerLockError);
          mouseMoveHandlerRef.current = null;
          errorHandlerRef.current = null;
        } else {
          // Not locked yet, retry (throttled)
          retryLock();
        }
      };

      mouseMoveHandlerRef.current = handleMouseMove;
      document.addEventListener('mousemove', handleMouseMove);

      // Auto-retry after 1 second if still not locked
      retryTimeoutRef.current = window.setTimeout(() => {
        if (document.pointerLockElement !== canvas) {
          retryLock();
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to enter metaverse:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: '#fff',
        zIndex: 9999,
        fontFamily: 'var(--font-system)',
        animation: 'fadeIn 300ms var(--ease-out)',
      }}
    >
      <div
        className="glass"
        style={{
          textAlign: 'center',
          padding: '40px',
          borderRadius: '20px',
          background: 'var(--glass-background)',
          backdropFilter: 'var(--glass-backdrop-blur)',
          WebkitBackdropFilter: 'var(--glass-backdrop-blur)',
          border: '1px solid var(--glass-border)',
          maxWidth: '400px',
          animation: 'slideUp 400ms var(--ease-spring)',
        }}
      >
        {loading ? (
          <>
            <div
              style={{
                fontSize: '48px',
                marginBottom: '24px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            >
              ⏳
            </div>
            <h2 className="text-title2" style={{ margin: '0 0 12px', color: 'var(--color-label)' }}>
              Metaverse wird geladen...
            </h2>
            <p
              className="text-body"
              style={{
                margin: '0 0 32px',
                color: 'var(--color-label-secondary)',
                opacity: 0.8,
                lineHeight: 1.5,
              }}
            >
              Bitte warten, während die Welt initialisiert wird.
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--color-accent)',
                  animation: 'pulse 1s ease-in-out infinite',
                }}
              />
              <span className="text-footnote" style={{ color: 'var(--color-label-secondary)' }}>
                Avatar wird geladen...
              </span>
            </div>
          </>
        ) : (
          <>
            <div
              style={{ fontSize: '64px', marginBottom: '16px', animation: 'fadeIn 0.5s ease-out' }}
            >
              🚀
            </div>
            <h2
              className="text-title2"
              style={{
                margin: '0 0 12px',
                color: 'var(--color-label)',
                fontSize: '28px',
                fontWeight: 600,
                letterSpacing: '-0.5px',
              }}
            >
              Bereit zum Eintreten
            </h2>
            <p
              className="text-body"
              style={{
                margin: '0 0 32px',
                color: 'var(--color-label-secondary)',
                opacity: 0.9,
                lineHeight: 1.5,
                fontSize: '15px',
              }}
            >
              Klicke auf "Enter", um die Maussteuerung zu aktivieren und das Metaverse zu betreten.
            </p>
            {pointerLockError && (
              <div
                style={{
                  padding: '12px',
                  marginBottom: '16px',
                  background: 'var(--color-fill-primary)',
                  border: '1px solid var(--color-system-yellow)',
                  borderRadius: '8px',
                  color: 'var(--color-label)',
                }}
              >
                <p
                  className="text-footnote"
                  style={{ margin: 0, color: 'var(--color-label-secondary)' }}
                >
                  ⚠️ Maussteuerung konnte nicht automatisch aktiviert werden. Bitte klicke ins
                  Fenster.
                </p>
              </div>
            )}
          </>
        )}

        {/* Keyboard Hints */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            marginBottom: '24px',
            padding: '12px',
            background: 'var(--color-fill-primary)',
            borderRadius: '8px',
          }}
        >
          {[
            { key: 'WASD', label: 'Bewegen' },
            { key: 'Maus', label: 'Schauen' },
            { key: 'SPACE', label: 'Springen' },
            { key: 'V', label: 'Ansicht' },
          ].map((hint) => (
            <div
              key={hint.key}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span
                className="text-footnote"
                style={{ color: 'var(--color-label-secondary)', fontSize: '11px' }}
              >
                {hint.label}
              </span>
              <kbd
                style={{
                  padding: '2px 6px',
                  background: 'var(--color-background)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-label)',
                }}
              >
                {hint.key}
              </kbd>
            </div>
          ))}
        </div>

        {!loading && (
          <AppleButton
            onClick={handleEnter}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 28px',
              fontSize: '17px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            Enter
          </AppleButton>
        )}
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
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
