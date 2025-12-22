import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { io as ClientIO } from 'socket.io-client';
import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { PresenceService } from '../presence/PresenceService.js';
import { RoomManager } from '../rooms/RoomManager.js';
import { StateSyncService } from '../sync/StateSyncService.js';

// Create test server (similar to production server.ts)
function createTestServer() {
  const app = express();
  const httpServer = createServer(app);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'", 'ws:', 'wss:'],
          mediaSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          fontSrc: ["'self'", 'data:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  const clientUrls = ['http://localhost:5173', 'http://localhost:3000'];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || clientUrls.includes(origin)) {
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

  app.use(
    rateLimit({
      windowMs: 10 * 1000,
      max: 300,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.use(express.json());

  app.get('/', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'WattWelten Metaverse Server',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    });
  });

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

    socket.on('disconnect', () => {
      const userInfo = presenceService.getUserInfo(socket.id);
      if (userInfo) {
        roomManager.leaveRoom(socket.id, userInfo.roomId, userInfo.userId);
        io.to(userInfo.roomId).emit('user-left', { userId: userInfo.userId, socketId: socket.id });
        presenceService.removeUser(socket.id);
      }
    });
  });

  return { httpServer, app, io };
}

describe('Server Integration Tests', () => {
  let server: ReturnType<typeof createTestServer>;
  let baseUrl: string;

  beforeAll(async () => {
    server = createTestServer();
    await new Promise<void>((resolve) => {
      server.httpServer.listen(0, () => {
        const address = server.httpServer.address();
        const port = typeof address === 'object' && address ? address.port : 3001;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.httpServer.close(() => resolve());
    });
  });

  describe('HTTP Health Check', () => {
    it('should return 200 OK for root endpoint', async () => {
      const response = await request(server.app).get('/');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service', 'WattWelten Metaverse Server');
    });

    it('should return detailed health information', async () => {
      const response = await request(server.app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('activeConnections');
      expect(response.body).toHaveProperty('memory');
      expect(response.body.memory).toHaveProperty('heapUsed');
      expect(response.body.memory).toHaveProperty('heapTotal');
      expect(response.body.memory).toHaveProperty('rss');
    });
  });

  describe('Socket.io Handshake', () => {
    it('should connect successfully', async () => {
      return new Promise<void>((resolve, reject) => {
        const client = ClientIO(baseUrl, {
          transports: ['websocket'],
        });

        client.on('connect', () => {
          expect(client.connected).toBe(true);
          client.disconnect();
          resolve();
        });

        client.on('connect_error', (error) => {
          client.disconnect();
          reject(error);
        });
      });
    });

    it('should join room and receive roster', async () => {
      return new Promise<void>((resolve, reject) => {
        const client = ClientIO(baseUrl, {
          transports: ['websocket'],
        });

        client.on('connect', () => {
          client.emit('join-room', {
            roomId: 'test-room',
            userId: 'test-user-1',
            avatar: { type: 'capsule' },
          });
        });

        client.on('room-state', (state) => {
          expect(state).toBeDefined();
          client.disconnect();
          resolve();
        });

        client.on('connect_error', (error) => {
          client.disconnect();
          reject(error);
        });
      });
    });

    it('should broadcast user-joined event to other clients', async () => {
      return new Promise<void>((resolve, reject) => {
        const client1 = ClientIO(baseUrl, { transports: ['websocket'] });
        const client2 = ClientIO(baseUrl, { transports: ['websocket'] });

        let client1Connected = false;
        let client2Connected = false;

        const cleanup = () => {
          client1.disconnect();
          client2.disconnect();
        };

        client1.on('connect', () => {
          client1Connected = true;
          if (client2Connected) {
            client1.emit('join-room', {
              roomId: 'test-room-2',
              userId: 'test-user-1',
              avatar: { type: 'capsule' },
            });
          }
        });

        client2.on('connect', () => {
          client2Connected = true;
          if (client1Connected) {
            client1.emit('join-room', {
              roomId: 'test-room-2',
              userId: 'test-user-1',
              avatar: { type: 'capsule' },
            });
          }
        });

        client2.on('user-joined', (data) => {
          expect(data).toHaveProperty('userId');
          expect(data).toHaveProperty('socketId');
          cleanup();
          resolve();
        });

        client1.on('connect_error', (error) => {
          cleanup();
          reject(error);
        });

        client2.on('connect_error', (error) => {
          cleanup();
          reject(error);
        });
      });
    });

    it('should handle transform round-trip', async () => {
      return new Promise<void>((resolve, reject) => {
        const client1 = ClientIO(baseUrl, { transports: ['websocket'] });
        const client2 = ClientIO(baseUrl, { transports: ['websocket'] });

        const cleanup = () => {
          client1.disconnect();
          client2.disconnect();
        };

        client1.on('connect', () => {
          client1.emit('join-room', {
            roomId: 'test-room-3',
            userId: 'test-user-1',
            avatar: { type: 'capsule' },
          });
        });

        client2.on('connect', () => {
          client2.emit('join-room', {
            roomId: 'test-room-3',
            userId: 'test-user-2',
            avatar: { type: 'capsule' },
          });
        });

        client2.on('avatar-update', (data) => {
          expect(data).toHaveProperty('userId', 'test-user-1');
          expect(data).toHaveProperty('position');
          expect(data).toHaveProperty('rotation');
          cleanup();
          resolve();
        });

        client1.on('room-state', () => {
          // Send transform after joining
          setTimeout(() => {
            client1.emit('avatar-update', {
              roomId: 'test-room-3',
              userId: 'test-user-1',
              position: { x: 1, y: 0, z: 2 },
              rotation: { x: 0, y: 0, z: 0 },
              animation: 'walk',
            });
          }, 100);
        });

        client1.on('connect_error', (error) => {
          cleanup();
          reject(error);
        });

        client2.on('connect_error', (error) => {
          cleanup();
          reject(error);
        });
      });
    });
  });
});
