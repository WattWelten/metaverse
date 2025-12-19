import React from 'react';

export interface HUDProps {
  playerCount?: number;
  fps?: number;
  onMenuClick?: () => void;
}

export function HUD({ playerCount, fps, onMenuClick }: HUDProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {playerCount !== undefined && (
            <div style={{ color: '#fff', fontSize: '14px' }}>
              Players: {playerCount}
            </div>
          )}
          {fps !== undefined && (
            <div style={{ color: '#fff', fontSize: '14px' }}>
              FPS: {fps}
            </div>
          )}
        </div>
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Menu
          </button>
        )}
      </div>
    </div>
  );
}

