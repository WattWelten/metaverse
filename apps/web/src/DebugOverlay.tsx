import { useEffect, useState } from 'react';
import type { World } from './World';

interface DebugOverlayProps {
  world: World | null;
}

export function DebugOverlay({ world }: DebugOverlayProps) {
  const [fps, setFps] = useState(0);
  const [drawCalls, setDrawCalls] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!world || !visible) return;

    let frameCount = 0;
    let lastTime = performance.now();

    const updateStats = () => {
      frameCount++;
      const currentTime = performance.now();
      const delta = currentTime - lastTime;

      if (delta >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;

        const info = world.getRenderer().info;
        setDrawCalls(info.render.calls);
      }

      requestAnimationFrame(updateStats);
    };

    updateStats();
  }, [world, visible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.key === 'F' && e.ctrlKey)) {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '10px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#fff',
        zIndex: 1000,
      }}
    >
      <div>FPS: {fps}</div>
      <div>Draw Calls: {drawCalls}</div>
      <div>GPU: {world?.getRenderer().getContext().getParameter(world.getRenderer().getContext().RENDERER)}</div>
      <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
        Press F12 to toggle
      </div>
    </div>
  );
}

