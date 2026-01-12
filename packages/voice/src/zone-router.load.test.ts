import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ZoneRouter, type PeerMeta } from './zone-router';

/**
 * Load tests for ZoneRouter
 * Tests performance with many peers and frequent updates
 */

describe('ZoneRouter Load Tests', () => {
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

  it('should handle 100 peers efficiently', () => {
    const peers: PeerMeta[] = [];
    for (let i = 0; i < 100; i++) {
      peers.push({
        userId: `user${i}`,
        pos: [Math.random() * 100, Math.random() * 100],
        zone: i < 50 ? 'zone1' : 'zone2',
        sid: `sid${i}`,
      });
    }

    getPeers = vi.fn(() => peers);
    router = new ZoneRouter(getPeers, setSubscribed);

    router.updateMyZone('zone1');
    router.updatePeers();

    // Should only subscribe to peers in zone1 (50 peers)
    const subscribed = subscribedCalls.filter((c) => c.subscribed).length;
    expect(subscribed).toBe(50);
  });

  it('should throttle updates correctly under load', () => {
    const peers: PeerMeta[] = [];
    for (let i = 0; i < 50; i++) {
      peers.push({
        userId: `user${i}`,
        pos: [0, 0],
        zone: 'zone1',
        sid: `sid${i}`,
      });
    }

    getPeers = vi.fn(() => peers);
    router = new ZoneRouter(getPeers, setSubscribed);
    router.updateMyZone('zone1');

    subscribedCalls = [];

    // Simulate rapid updates (should be throttled)
    const startTime = Date.now();
    for (let i = 0; i < 100; i++) {
      router.updatePeers();
    }
    const endTime = Date.now();

    // Should complete quickly (throttling prevents excessive calls)
    expect(endTime - startTime).toBeLessThan(100); // Should be < 100ms due to throttling

    // Should only have called setSubscribed once per peer (not 100 times)
    expect(subscribedCalls.length).toBeLessThan(100);
  });

  it('should handle zone changes efficiently with many peers', () => {
    const peers: PeerMeta[] = [];
    for (let i = 0; i < 200; i++) {
      peers.push({
        userId: `user${i}`,
        pos: [0, 0],
        zone: i < 100 ? 'zone1' : 'zone2',
        sid: `sid${i}`,
      });
    }

    getPeers = vi.fn(() => peers);
    router = new ZoneRouter(getPeers, setSubscribed);

    // Start in zone1
    router.updateMyZone('zone1');
    router.updatePeers();
    subscribedCalls = [];

    // Change to zone2
    const startTime = Date.now();
    router.updateMyZone('zone2');
    const endTime = Date.now();

    // Should complete quickly (< 10ms)
    expect(endTime - startTime).toBeLessThan(10);

    // Should unsubscribe from zone1 peers and subscribe to zone2 peers
    const unsubscribed = subscribedCalls.filter((c) => !c.subscribed).length;
    const subscribed = subscribedCalls.filter((c) => c.subscribed).length;
    expect(unsubscribed).toBe(100); // zone1 peers
    expect(subscribed).toBe(100); // zone2 peers
  });

  it('should handle rapid peer list changes', () => {
    router.updateMyZone('zone1');

    // Simulate peers joining/leaving rapidly
    for (let i = 0; i < 10; i++) {
      const peers: PeerMeta[] = [];
      for (let j = 0; j < 20 + i; j++) {
        peers.push({
          userId: `user${j}`,
          pos: [0, 0],
          zone: 'zone1',
          sid: `sid${j}`,
        });
      }
      getPeers = vi.fn(() => peers);
      router = new ZoneRouter(getPeers, setSubscribed);
      router.updateMyZone('zone1');
      router.updatePeers();
    }

    // Should handle all updates without errors
    expect(subscribedCalls.length).toBeGreaterThan(0);
  });

  it('should maintain performance with frequent zone changes', () => {
    const peers: PeerMeta[] = [];
    for (let i = 0; i < 50; i++) {
      peers.push({
        userId: `user${i}`,
        pos: [0, 0],
        zone: i % 2 === 0 ? 'zone1' : 'zone2',
        sid: `sid${i}`,
      });
    }

    getPeers = vi.fn(() => peers);
    router = new ZoneRouter(getPeers, setSubscribed);

    const startTime = Date.now();
    // Simulate frequent zone changes
    for (let i = 0; i < 100; i++) {
      router.updateMyZone(i % 2 === 0 ? 'zone1' : 'zone2');
    }
    const endTime = Date.now();

    // Should complete in reasonable time (< 100ms)
    expect(endTime - startTime).toBeLessThan(100);
  });
});
