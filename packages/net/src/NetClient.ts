import { io, Socket } from 'socket.io-client';

import { Presence } from './presence/Presence.js';
import { Replicator } from './replication/Replicator.js';
import { RoomManager } from './rooms/RoomManager.js';
import { StateSync } from './sync/StateSync.js';
import type { NetClientForAvatarManager, NetClientForVoice } from './types.js';

export interface NetClientConfig {
  serverUrl: string;
  userId: string;
  roomId?: string;
  autoConnect?: boolean;
}

export class NetClient {
  private socket: Socket | null = null;
  private config: NetClientConfig;
  private presence: Presence;
  private stateSync: StateSync;
  private roomManager: RoomManager;
  private replicator: Replicator;
  private connected = false;

  constructor(config: NetClientConfig) {
    this.config = config;
    this.presence = new Presence();
    this.stateSync = new StateSync();
    this.roomManager = new RoomManager();
    this.replicator = new Replicator();

    if (config.autoConnect !== false) {
      this.connect();
    }
  }

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.config.serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 2, // Reduziert auf 2 Retries (insgesamt 3 Versuche: initial + 2 retries)
      reconnectionDelayMax: 3000, // Max 3 Sekunden zwischen Versuchen
      timeout: 3000, // Connection timeout (3 Sekunden)
    });

    this.setupEventHandlers();

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('Connected to server');

      // Emit custom event for external listeners
      this.socket?.emit('connected');

      if (this.config.roomId) {
        this.joinRoom(this.config.roomId);
      }
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on(
      'room-state',
      (data: {
        roomId: string;
        users: Array<{ userId: string; socketId: string; avatar?: unknown }>;
      }) => {
        this.roomManager.handleRoomState(data);
      }
    );

    this.socket.on(
      'user-joined',
      (data: { userId: string; socketId: string; avatar?: unknown }) => {
        this.presence.addUser(data.userId, data.socketId, data.avatar);
        this.roomManager.handleUserJoined(data);
      }
    );

    this.socket.on('user-left', (data: { userId: string; socketId: string }) => {
      this.presence.removeUser(data.userId);
      this.roomManager.handleUserLeft(data);
    });

    this.socket.on('state-update', (data: { userId: string; state: unknown }) => {
      this.stateSync.handleStateUpdate(data.userId, data.state);
    });

    this.socket.on(
      'avatar-update',
      (data: {
        userId: string;
        position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number };
        animation?: string;
      }) => {
        this.replicator.handleAvatarUpdate(data.userId, data);
      }
    );
  }

  disconnect(): void {
    if (this.socket) {
      // Disconnect stoppt automatisch Reconnection
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = null;
    }
    this.connected = false;
  }

  joinRoom(roomId: string, avatar?: unknown): void {
    if (!this.socket?.connected) {
      console.warn('Cannot join room: not connected');
      return;
    }

    this.socket.emit('join-room', {
      roomId,
      userId: this.config.userId,
      avatar,
    });

    this.config.roomId = roomId;
  }

  leaveRoom(roomId: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('leave-room', {
      roomId,
      userId: this.config.userId,
    });
  }

  updateState(state: unknown): void {
    if (!this.socket?.connected || !this.config.roomId) {
      return;
    }

    this.socket.emit('state-update', {
      roomId: this.config.roomId,
      userId: this.config.userId,
      state,
    });
  }

  updateAvatar(
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number },
    animation?: string
  ): void {
    if (!this.socket?.connected || !this.config.roomId) {
      return;
    }

    this.socket.emit('avatar-update', {
      roomId: this.config.roomId,
      userId: this.config.userId,
      position,
      rotation,
      animation,
    });
  }

  sendChat(message: string): void {
    if (!this.socket?.connected || !this.config.roomId) {
      return;
    }

    this.socket.emit('chat-message', {
      roomId: this.config.roomId,
      userId: this.config.userId,
      message,
      timestamp: Date.now(),
    });
  }

  onChat(callback: (data: { userId: string; message: string; timestamp: number }) => void): void {
    this.socket?.on(
      'chat-message',
      (data: { userId: string; message: string; timestamp: number }) => {
        callback(data);
      }
    );
  }

  shareMedia(data: {
    url: string;
    type: 'image' | 'video';
    position: { x: number; y: number; z: number };
    width?: number;
    height?: number;
  }): void {
    if (!this.socket?.connected || !this.config.roomId) {
      return;
    }

    this.socket.emit('media-share', {
      roomId: this.config.roomId,
      userId: this.config.userId,
      ...data,
      timestamp: Date.now(),
    });
  }

  onMediaShare(
    callback: (data: {
      userId: string;
      url: string;
      type: 'image' | 'video';
      position: { x: number; y: number; z: number };
      width?: number;
      height?: number;
      timestamp: number;
    }) => void
  ): void {
    this.socket?.on('media-share', (data) => {
      callback(data);
    });
  }

  isConnected(): boolean {
    return this.connected;
  }

  getPresence(): Presence {
    return this.presence;
  }

  getStateSync(): StateSync {
    return this.stateSync;
  }

  getRoomManager(): RoomManager {
    return this.roomManager;
  }

  getReplicator(): Replicator {
    return this.replicator;
  }

  on(event: string, callback: (...args: unknown[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: unknown[]) => void): void {
    this.socket?.off(event, callback);
  }

  emit(event: string, data: unknown): void {
    this.socket?.emit(event, data);
  }

  // Type-safe adapters for different use cases
  asAvatarManagerClient(): NetClientForAvatarManager {
    return {
      getReplicator: () => this.replicator,
      updateAvatar: (position, rotation, animation) => {
        this.updateAvatar(position, rotation, animation);
      },
    };
  }

  asVoiceClient(): NetClientForVoice {
    return {
      on: (event, callback) => this.on(event, callback),
      off: (event, callback) => this.off(event, callback),
      emit: (event, data) => this.emit(event, data),
    };
  }

  getPlayerCount(): number {
    return this.roomManager.getUserCount();
  }
}
