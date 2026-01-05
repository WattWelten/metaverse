import { useEffect, useMemo, useState } from 'react';
import { Excalidraw, convertToExcalidrawElements } from '@excalidraw/excalidraw';
import * as Y from 'yjs';
import { WhiteboardClient } from '@metaverse/whiteboard';

const ENABLED = import.meta.env.VITE_WHITEBOARD_ENABLED === 'true';

interface WhiteboardPanelProps {
  room: string;
}

export function WhiteboardPanel({ room }: WhiteboardPanelProps) {
  const wsUrl = import.meta.env.VITE_YWS_URL || 'ws://localhost:1234';
  const [ready, setReady] = useState(false);
  const y = useMemo(() => new WhiteboardClient(wsUrl, room), [wsUrl, room]);

  useEffect(() => {
    setReady(true);
    return () => y.destroy();
  }, [y]);

  if (!ENABLED) return null;
  if (!ready) return <div>Whiteboard loading…</div>;

  // Simple shared array for elements
  const store = y.doc.getArray<unknown>('elements');

  return (
    <div className="whiteboard-panel" data-testid="whiteboard-panel">
      <Excalidraw
        onChange={(els) => {
          store.delete(0, store.length);
          store.push([els]);
        }}
        initialData={{
          elements: convertToExcalidrawElements((store.toArray().flat() || []) as unknown[]),
        }}
      />
    </div>
  );
}
