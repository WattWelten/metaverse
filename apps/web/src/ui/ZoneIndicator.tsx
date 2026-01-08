import { useEffect, useState } from 'react';

interface ZoneIndicatorProps {
  zoneLabel: string | null;
  zoneId: string | null;
}

export function ZoneIndicator({ zoneLabel, zoneId }: ZoneIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (zoneLabel) {
      setIsVisible(true);
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      return undefined;
    }
  }, [zoneLabel, zoneId]);

  if (!isVisible || !zoneLabel) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        pointerEvents: 'none',
        opacity: isAnimating ? 1 : 0.7,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div
        className="glass"
        style={{
          background: 'var(--glass-background, rgba(20, 20, 20, 0.9))',
          backdropFilter: 'var(--glass-backdrop-blur, blur(20px))',
          WebkitBackdropFilter: 'var(--glass-backdrop-blur, blur(20px))',
          border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.2))',
          borderRadius: '12px',
          padding: '12px 20px',
          color: 'var(--color-label, #fff)',
          fontFamily:
            'var(--font-system, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
          fontSize: '14px',
          fontWeight: 500,
          animation: isAnimating
            ? 'slideDown 0.5s var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1))'
            : 'none',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#4CAF50',
              animation: isAnimating ? 'pulse 1s ease-in-out infinite' : 'none',
            }}
          />
          <span>{zoneLabel}</span>
        </div>
      </div>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -60%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
