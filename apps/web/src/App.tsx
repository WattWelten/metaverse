import { useEffect, useRef, useState } from 'react';
import { World } from './World';
import { FeatureFlags, getFeatureFlags } from './FeatureFlags';
import { OverlayHost } from '@metaverse/ui';
import { ErrorBoundary } from './components/ErrorBoundary';

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
          
          const world = worldRef.current;
          if (!world) return;
          
          const template = world.getCurrentTemplate();
          const scene = world.getScene();
          
          if (template && scene) {
            template.unmount();
            // Template wird beim nächsten Render neu gemountet
            world.loadTemplate(newTemplateId).catch((error) => {
              console.error('Failed to switch template:', error);
            });
          }
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
    <ErrorBoundary>
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
        <FeatureFlags />
        <OverlayHost templateId={templateId} onAction={handleOverlayAction} />
      </div>
    </ErrorBoundary>
  );
}

