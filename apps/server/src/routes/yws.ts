import { WebSocketServer } from 'ws';
// @ts-expect-error - y-websocket/bin/utils has no types
import { setupWSConnection } from 'y-websocket/bin/utils';
import type { Server } from 'http';

export function setupYWebSocket(server: Server): void {
  if (process.env.YWS_ENABLED === 'false') {
    console.log('[yws] Y-WebSocket deaktiviert (YWS_ENABLED=false)');
    return;
  }

  const wss = new WebSocketServer({ server, path: '/yws' });

  wss.on('connection', (conn: any, req: any) => {
    const url = new URL(req.url ?? '', `http://${req.headers.host}`);
    const roomId = url.searchParams.get('room') || 'default';
    setupWSConnection(conn, req, { docName: `room-${roomId}` });
  });

  console.log('[yws] WebSocket-Server gestartet auf /yws');
}
