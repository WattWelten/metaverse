import { useEffect, useState } from 'react';

import { getFeatureFlags } from './FeatureFlags';
import type { World } from './World';

interface DebugOverlayProps {
  world: World | null;
}

const AVAILABLE_TEMPLATES = ['watt-default', 'watt-eco'];

export function DebugOverlay({ world }: DebugOverlayProps) {
  const [fps, setFps] = useState(0);
  const [drawCalls, setDrawCalls] = useState(0);
  const [visible, setVisible] = useState(false);
  const [exposure, setExposure] = useState(1.0);
  const [currentTemplate, setCurrentTemplate] = useState(() => getFeatureFlags().TEMPLATE_ID);

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

  const handleTemplateChange = async (templateId: string) => {
    if (!world) return;
    try {
      await world.loadTemplate(templateId);
      setCurrentTemplate(templateId);
    } catch (error) {
      console.error('Failed to switch template:', error);
    }
  };

  const handleExposureChange = (value: number) => {
    setExposure(value);
    if (world) {
      world.setExposure(value);
    }
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#fff',
        zIndex: 1000,
        minWidth: '250px',
      }}
    >
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Debug Overlay</div>

      <div style={{ marginBottom: '8px' }}>FPS: {fps}</div>
      <div style={{ marginBottom: '8px' }}>Draw Calls: {drawCalls}</div>
      <div style={{ marginBottom: '8px' }}>
        GPU:{' '}
        {world?.getRenderer().getContext().getParameter(world.getRenderer().getContext().RENDERER)}
      </div>

      <div style={{ marginTop: '15px', marginBottom: '8px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Template:</label>
        <select
          value={currentTemplate}
          onChange={(e) => handleTemplateChange(e.target.value)}
          style={{
            width: '100%',
            padding: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '2px',
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: '11px',
          }}
        >
          {AVAILABLE_TEMPLATES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: '15px', marginBottom: '8px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          Exposure: {exposure.toFixed(2)}
        </label>
        <input
          type="range"
          min="0.1"
          max="3.0"
          step="0.1"
          value={exposure}
          onChange={(e) => handleExposureChange(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>Press F12 to toggle</div>
    </div>
  );
}
