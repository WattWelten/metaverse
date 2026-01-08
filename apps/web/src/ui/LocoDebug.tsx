import { useEffect, useState } from 'react';

export function LocoDebug() {
  const [kine, setKine] = useState<{ speed: number; yawDelta: number; state?: string }>({
    speed: 0,
    yawDelta: 0,
  });

  useEffect(() => {
    if (import.meta.env.VITE_LOCO_DEBUG !== 'true') return;

    let animationFrameId: number;
    const update = () => {
      const world = (window as any).__world;
      if (world?.kine) {
        setKine({
          speed: world.kine.speed || 0,
          yawDelta: world.kine.yawDelta || 0,
          state: world.kine.state,
        });
      }
      animationFrameId = requestAnimationFrame(update);
    };
    animationFrameId = requestAnimationFrame(update);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  if (import.meta.env.VITE_LOCO_DEBUG !== 'true') return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <div style={{ marginBottom: '4px', fontWeight: 600 }}>Locomotion Debug</div>
      <div>Speed: {kine.speed.toFixed(2)} m/s</div>
      <div>Yaw: {kine.yawDelta.toFixed(2)} rad/s</div>
      {kine.state && <div>State: {kine.state}</div>}
    </div>
  );
}
