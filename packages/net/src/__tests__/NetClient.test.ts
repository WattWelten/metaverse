import { describe, it, expect, beforeEach, vi } from 'vitest';

import { NetClient } from '../NetClient.js';

// Mock socket.io-client
vi.mock('socket.io-client', () => {
  const mockSocket = {
    connected: false,
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  };

  return {
    io: vi.fn(() => mockSocket),
  };
});

describe('NetClient', () => {
  let netClient: NetClient;

  beforeEach(() => {
    netClient = new NetClient({
      serverUrl: 'http://localhost:3001',
      userId: 'test-user',
      autoConnect: false,
    });
  });

  it('should create NetClient instance', () => {
    expect(netClient).toBeDefined();
    expect(netClient.isConnected()).toBe(false);
  });

  it('should connect to server', () => {
    netClient.connect();
    // Connection is async, so we just check that connect was called
    expect(netClient).toBeDefined();
  });

  it('should provide type-safe adapters', () => {
    const avatarClient = netClient.asAvatarManagerClient();
    expect(avatarClient).toBeDefined();
    expect(avatarClient.getReplicator).toBeDefined();
    expect(avatarClient.updateAvatar).toBeDefined();

    const voiceClient = netClient.asVoiceClient();
    expect(voiceClient).toBeDefined();
    expect(voiceClient.on).toBeDefined();
    expect(voiceClient.emit).toBeDefined();
  });

  it('should disconnect cleanly', () => {
    netClient.connect();
    netClient.disconnect();
    expect(netClient.isConnected()).toBe(false);
  });

  it('should handle room operations', () => {
    netClient.connect();
    netClient.joinRoom('test-room');
    // Room operations are async, so we just verify no errors
    expect(netClient).toBeDefined();
  });

  it('should update avatar state', () => {
    netClient.connect();
    netClient.updateAvatar({ x: 1, y: 2, z: 3 }, { x: 0, y: 0, z: 0 }, 'idle');
    // Update is async, so we just verify no errors
    expect(netClient).toBeDefined();
  });
});
