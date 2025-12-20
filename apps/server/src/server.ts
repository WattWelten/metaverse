import { createServer } from 'http';

import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';

import { PresenceService } from './presence/PresenceService.js';
import { RoomManager } from './rooms/RoomManager.js';
import { StateSyncService } from './sync/StateSyncService.js';

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'WattWelten Metaverse Server',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const roomManager = new RoomManager();
const presenceService = new PresenceService();
const stateSyncService = new StateSyncService();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join-room', async (data: { roomId: string; userId: string; avatar?: unknown }) => {
    const { roomId, userId, avatar } = data;
    await roomManager.joinRoom(socket.id, roomId, userId, avatar);
    socket.join(roomId);

    const roomState = roomManager.getRoomState(roomId);
    socket.emit('room-state', roomState);
    socket.to(roomId).emit('user-joined', { userId, socketId: socket.id, avatar });

    presenceService.addUser(socket.id, userId, roomId);
  });

  socket.on('leave-room', async (data: { roomId: string; userId: string }) => {
    const { roomId, userId } = data;
    await roomManager.leaveRoom(socket.id, roomId, userId);
    socket.leave(roomId);

    socket.to(roomId).emit('user-left', { userId, socketId: socket.id });
    presenceService.removeUser(socket.id);
  });

  socket.on('state-update', (data: { roomId: string; userId: string; state: unknown }) => {
    const { roomId, userId, state } = data;
    stateSyncService.updateState(roomId, userId, state);
    socket.to(roomId).emit('state-update', { userId, state });
  });

  socket.on(
    'avatar-update',
    (data: {
      roomId: string;
      userId: string;
      position: { x: number; y: number; z: number };
      rotation: { x: number; y: number; z: number };
      animation?: string;
    }) => {
      const { roomId, userId, position, rotation, animation } = data;
      socket.to(roomId).emit('avatar-update', { userId, position, rotation, animation });
    }
  );

  // WebRTC Signalisierung (für Voice/Audio)
  socket.on(
    'webrtc-signal',
    (data: { from: string; to: string; signal: unknown; type: string }) => {
      const { to, signal, type } = data;
      const userInfo = presenceService.getUserInfo(socket.id);
      if (!userInfo) return;

      // Weiterleite Signal an Ziel-User
      socket.to(userInfo.roomId).emit('webrtc-signal', {
        from: userInfo.userId,
        to,
        signal,
        type,
      });
    }
  );

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    const userInfo = presenceService.getUserInfo(socket.id);
    if (userInfo) {
      roomManager.leaveRoom(socket.id, userInfo.roomId, userInfo.userId);
      io.to(userInfo.roomId).emit('user-left', { userId: userInfo.userId, socketId: socket.id });
      presenceService.removeUser(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Metaverse Server running on port ${PORT}`);
});
