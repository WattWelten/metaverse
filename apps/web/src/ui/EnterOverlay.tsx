import { resumeContext } from '@metaverse/audio';
import { AppleButton } from '@metaverse/ui';
import { useState } from 'react';

interface EnterOverlayProps {
  onEnter: () => void;
}

export function EnterOverlay({ onEnter }: EnterOverlayProps) {
  const [loading, setLoading] = useState(false);

  const handleEnter = async () => {
    setLoading(true);
    try {
      await resumeContext();
      onEnter();
      // Focus auf Canvas setzen für Keyboard-Events
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (canvas) {
        canvas.focus();
        console.log('[PointerLock] Canvas focused, requesting lock...');
      }
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
