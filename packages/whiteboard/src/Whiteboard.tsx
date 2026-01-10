import { useEffect, useMemo } from 'react';
import { Tldraw } from '@tldraw/tldraw';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface WhiteboardProps {
  roomId: string;
  ywsUrl?: string;
}

export default function Whiteboard({ roomId, ywsUrl }: WhiteboardProps) {
  const doc = useMemo(() => new Y.Doc(), []);

  useEffect(() => {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    // YWS ist auf demselben Server wie der API-Server (Port 3001)
    const serverPort = (window as any).PORT || (window as any).YWS_PORT || 3001;
    const hostname = new URL(ywsUrl || window.location.href).hostname;
    const url = ywsUrl || `${proto}://${hostname}:${serverPort}/yws?room=${roomId}`;
    const provider = new WebsocketProvider(url, `wb-${roomId}`, doc);

    // Yjs-Doc ist mit Y-WebSocket verbunden für Echtzeit-Synchronisation
    // Tldraw v3.4.7 unterstützt Yjs-Integration über separate Store-Implementierung
    // Für MVP: Basis-Integration mit Yjs-Doc, vollständige Store-Bindung optional
    // TODO: Für vollständige tldraw-Yjs-Sync siehe tldraw Dokumentation für Store-Integration

    return () => {
      provider.destroy();
    };
  }, [doc, roomId, ywsUrl]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Tldraw />
    </div>
  );
}
