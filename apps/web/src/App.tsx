import { useEffect, useRef, useState } from 'react';
import { World } from './World';
import { FeatureFlags, getFeatureFlags } from './FeatureFlags';
import { OverlayHost } from '@metaverse/ui';

export function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<World | null>(null);
  const [templateId, setTemplateId] = useState(() => getFeatureFlags().TEMPLATE_ID);

  useEffect(() => {
    if (!containerRef.current) return;

    const world = new World(containerRef.current);
    worldRef.current = world;

    world.init().catch((error) => {
      console.error('Failed to initialize world:', error);
    });

    return () => {
      world.dispose();
    };
  }, []);

  const handleOverlayAction = (action: { type: string; payload?: unknown }) => {
    console.log('Overlay action:', action);
    
    switch (action.type) {
      case 'switch-template':
        if (action.payload && typeof action.payload === 'object' && 'templateId' in action.payload) {
          const newTemplateId = action.payload.templateId as string;
          setTemplateId(newTemplateId);
          worldRef.current?.getCurrentTemplate()?.unmount();
          worldRef.current?.getCurrentTemplate()?.mount(worldRef.current?.getScene()!);
        }
        break;
      case 'open-menu':
        // Menu-Logik hier
        break;
      default:
        console.warn('Unknown overlay action:', action.type);
    }
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <FeatureFlags />
      <OverlayHost templateId={templateId} onAction={handleOverlayAction} />
    </div>
  );
}

