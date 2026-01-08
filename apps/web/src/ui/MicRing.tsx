import { useEffect, useState } from 'react';

import type { World } from '../World';

interface MicRingProps {
  world: World | null;
}

export function MicRing({ world }: MicRingProps) {
  const [micLevel, setMicLevel] = useState(0);

  useEffect(() => {
    if (!world) return;

    const interval = setInterval(() => {
      const level = world.getMicLevel();
      setMicLevel(level);
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, [world]);

  // Calculate ring size based on mic level (0-1)
  const ringSize = 20 + micLevel * 8; // 20-28px
  const ringOpacity = 0.3 + micLevel * 0.7; // 0.3-1.0

  return (
    <div
      style={{
        position: 'relative',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title={`Mikrofon: ${Math.round(micLevel * 100)}%`}
    >
      {/* Outer ring (pulse effect when speaking) */}
      {micLevel > 0.1 && (
        <div
          style={{
            position: 'absolute',
            width: `${ringSize}px`,
            height: `${ringSize}px`,
            borderRadius: '50%',
            border: `2px solid var(--color-system-green)`,
            opacity: ringOpacity,
            animation: micLevel > 0.3 ? 'pulse 1s ease-in-out infinite' : 'none',
            transition: 'all 100ms var(--ease-out)',
          }}
        />
      )}

      {/* Inner microphone icon */}
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: micLevel > 0.1 ? 'var(--color-system-green)' : 'var(--color-fill-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: micLevel > 0.1 ? '#fff' : 'var(--color-label-secondary)',
          transition: 'all 150ms var(--ease-in-out)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        🎤
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
