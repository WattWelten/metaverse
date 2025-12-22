import { createServer } from 'http';

import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';

import { PresenceService } from './presence/PresenceService.js';
import { RoomManager } from './rooms/RoomManager.js';
import { StateSyncService } from './sync/StateSyncService.js';

const app = express();
const httpServer = createServer(app);

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Vite Dev needs unsafe-inline
        connectSrc: ["'self'", 'ws:', 'wss:'], // WebSocket connections
        mediaSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", 'data:'],
      },
    },
    crossOriginEmbedderPolicy: false, // Required for Three.js
  })
);

// CORS Configuration - Whitelist from ENV
const clientUrls = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }
      if (clientUrls.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiting - 300 requests per 10 seconds
const limiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 300, // limit each IP to 300 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Request Logging (only in development or if LOG_LEVEL is set)
const logLevel =
  process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'combined' : 'dev');
if (logLevel !== 'silent') {
  app.use(morgan(logLevel));
}

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

// Detailed health check endpoint
app.get('/health', (_req, res) => {
  const activeConnections = io.sockets.sockets.size;
  const memoryUsage = process.memoryUsage();

  res.json({
    status: 'ok',
    service: 'WattWelten Metaverse Server',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    activeConnections,
    memory: {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
    },
  });
});

const io = new Server(httpServer, {
  cors: {
    origin: clientUrls,
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

  // Chat Messages
  socket.on(
    'chat-message',
    (data: { roomId: string; userId: string; message: string; timestamp: number }) => {
      const { roomId, userId, message, timestamp } = data;
      const userInfo = presenceService.getUserInfo(socket.id);
      if (!userInfo || userInfo.roomId !== roomId) return;

      // Broadcast to all users in room (including sender for consistency)
      io.to(roomId).emit('chat-message', {
        userId,
        message,
        timestamp,
      });
    }
  );

  // Media Sharing
  socket.on(
    'media-share',
    (data: {
      roomId: string;
      userId: string;
      url: string;
      type: 'image' | 'video';
      position: { x: number; y: number; z: number };
      width?: number;
      height?: number;
      timestamp: number;
    }) => {
      const { roomId, userId, url, type, position, width, height, timestamp } = data;
      const userInfo = presenceService.getUserInfo(socket.id);
      if (!userInfo || userInfo.roomId !== roomId) return;

      // Broadcast to all users in room
      io.to(roomId).emit('media-share', {
        userId,
        url,
        type,
        position,
        width,
        height,
        timestamp,
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
