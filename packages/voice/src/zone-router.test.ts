import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ZoneRouter, type PeerMeta } from './zone-router';

describe('ZoneRouter', () => {
  let getPeers: () => PeerMeta[];
  let setSubscribed: (sid: string, subscribed: boolean) => void;
  let router: ZoneRouter;
  let subscribedCalls: Array<{ sid: string; subscribed: boolean }>;

  beforeEach(() => {
    subscribedCalls = [];
    getPeers = vi.fn(() => []);
    setSubscribed = vi.fn((sid: string, subscribed: boolean) => {
      subscribedCalls.push({ sid, subscribed });
    });
    router = new ZoneRouter(getPeers, setSubscribed);
  });

  it('should initialize with no zone', () => {
    expect(router.getMyZone()).toBeNull();
  });

  it('should update my zone', () => {
    router.updateMyZone('zone1');
    expect(router.getMyZone()).toBe('zone1');
  });

  it('should subscribe to peers in same zone', () => {
    router.updateMyZone('zone1');
    getPeers = vi.fn(() => [
      { userId: 'user1', pos: [0, 0], zone: 'zone1', sid: 'sid1' },
      { userId: 'user2', pos: [1, 1], zone: 'zone1', sid: 'sid2' },
    ]);
    router = new ZoneRouter(getPeers, setSubscribed);
    router.updateMyZone('zone1');
    router.updatePeers();

    expect(subscribedCalls).toEqual([
      { sid: 'sid1', subscribed: true },
      { sid: 'sid2', subscribed: true },
    ]);
  });

  it('should unsubscribe from peers in different zones', () => {
    router.updateMyZone('zone1');
    getPeers = vi.fn(() => [
      { userId: 'user1', pos: [0, 0], zone: 'zone1', sid: 'sid1' },
      { userId: 'user2', pos: [1, 1], zone: 'zone2', sid: 'sid2' },
    ]);
    router = new ZoneRouter(getPeers, setSubscribed);
    router.updateMyZone('zone1');
    router.updatePeers();

    expect(subscribedCalls).toEqual([
      { sid: 'sid1', subscribed: true },
      { sid: 'sid2', subscribed: false },
    ]);
  });

  it('should unsubscribe from all peers when changing zones', () => {
    getPeers = vi.fn(() => [
      { userId: 'user1', pos: [0, 0], zone: 'zone1', sid: 'sid1' },
      { userId: 'user2', pos: [1, 1], zone: 'zone2', sid: 'sid2' },
    ]);
    router = new ZoneRouter(getPeers, setSubscribed);

    // Start in zone1
    router.updateMyZone('zone1');
    router.updatePeers();
    subscribedCalls = [];

    // Move to zone2
    router.updateMyZone('zone2');
    router.updatePeers();

    expect(subscribedCalls).toEqual([
      { sid: 'sid1', subscribed: false },
      { sid: 'sid2', subscribed: true },
    ]);
  });

  it('should skip peers without SID', () => {
    router.updateMyZone('zone1');
    getPeers = vi.fn(() => [
      { userId: 'user1', pos: [0, 0], zone: 'zone1', sid: 'sid1' },
      { userId: 'user2', pos: [1, 1], zone: 'zone1' }, // No SID
    ]);
    router = new ZoneRouter(getPeers, setSubscribed);
    router.updateMyZone('zone1');
    router.updatePeers();

    expect(subscribedCalls).toEqual([{ sid: 'sid1', subscribed: true }]);
  });

  it('should handle null zone (no zone)', () => {
    router.updateMyZone(null);
    getPeers = vi.fn(() => [
      { userId: 'user1', pos: [0, 0], zone: 'zone1', sid: 'sid1' },
      { userId: 'user2', pos: [1, 1], zone: null, sid: 'sid2' },
    ]);
    router = new ZoneRouter(getPeers, setSubscribed);
    router.updateMyZone(null);
    router.updatePeers();

    // No zone = no subscriptions
    expect(subscribedCalls).toEqual([
      { sid: 'sid1', subscribed: false },
      { sid: 'sid2', subscribed: false },
    ]);
  });

  it('should handle empty peer list', () => {
    router.updateMyZone('zone1');
    getPeers = vi.fn(() => []);
    router = new ZoneRouter(getPeers, setSubscribed);
    router.updateMyZone('zone1');
    router.updatePeers();

    expect(subscribedCalls).toEqual([]);
  });

  it('should throttle updatePeers calls', () => {
    router.updateMyZone('zone1');
    getPeers = vi.fn(() => [{ userId: 'user1', pos: [0, 0], zone: 'zone1', sid: 'sid1' }]);
    router = new ZoneRouter(getPeers, setSubscribed);
    router.updateMyZone('zone1');

    subscribedCalls = [];
    router.updatePeers();
    const firstCallCount = subscribedCalls.length;

    // Call again immediately (should be throttled)
    router.updatePeers();
    expect(subscribedCalls.length).toBe(firstCallCount);
  });

  it('should only update changed subscriptions', () => {
    getPeers = vi.fn(() => [{ userId: 'user1', pos: [0, 0], zone: 'zone1', sid: 'sid1' }]);
    router = new ZoneRouter(getPeers, setSubscribed);
    router.updateMyZone('zone1');
    router.updatePeers();

    subscribedCalls = [];
    // Call again with same state (should not trigger updates)
    router.updatePeers();
    expect(subscribedCalls.length).toBe(0);
  });

  it('should skip updateMyZone if zone unchanged', () => {
    router.updateMyZone('zone1');
    subscribedCalls = [];
    router.updateMyZone('zone1'); // Same zone
    expect(subscribedCalls.length).toBe(0);
  });

  it('should unsubscribe from removed peers', () => {
    getPeers = vi.fn(() => [{ userId: 'user1', pos: [0, 0], zone: 'zone1', sid: 'sid1' }]);
    router = new ZoneRouter(getPeers, setSubscribed);
    router.updateMyZone('zone1');
    router.updatePeers();
    subscribedCalls = [];

    // Remove peer
    getPeers = vi.fn(() => []);
    router = new ZoneRouter(getPeers, setSubscribed);
    router.updateMyZone('zone1');
    router.updatePeers();

    expect(subscribedCalls).toEqual([{ sid: 'sid1', subscribed: false }]);
  });
});
