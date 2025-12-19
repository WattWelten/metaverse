import { useEffect, useRef } from 'react';
import { World } from './World';
import { FeatureFlags } from './FeatureFlags';

export function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<World | null>(null);

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

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <FeatureFlags />
    </div>
  );
}

