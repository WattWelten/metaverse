import assert from 'node:assert/strict';
import WebSocket from 'ws';

// YWS ist auf demselben Server wie der API-Server (Port 3001)
const SERVER_PORT = Number(process.env.PORT || 3001);
const HOST = process.env.YWS_HOST || 'localhost';
const URL = `ws://${HOST}:${SERVER_PORT}/yws?room=md-smoke`;

const ok = await new Promise((resolve) => {
  const ws = new WebSocket(URL);
  ws.on('open', () => {
    ws.close();
    resolve(true);
  });
  ws.on('error', () => resolve(false));
  setTimeout(() => resolve(false), 5000); // Timeout after 5s
});

assert.ok(ok, 'yws not reachable');
console.log('✅ YWS websocket OK');
