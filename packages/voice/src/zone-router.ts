/**
 * ZoneRouter: Manages audio subscriptions based on zone membership
 *
 * The ZoneRouter ensures audio isolation between different zones:
 * - **Cross-zone**: Unsubscribe (no audio leak between zones)
 * - **Same zone**: Subscribe with distance-based attenuation (handled by zone-engine)
 *
 * ## Requirements
 *
 * - Requires RTCClient to be initialized (for `setSubscribedFor()`)
 * - Requires audio zones to be defined in scene manifest
 * - Automatically updates subscriptions when:
 *   - User changes zone (`updateMyZone()`)
 *   - Peer positions/zone memberships change (`updatePeers()`)
 *
 * ## Usage
 *
 * ```typescript
 * const router = new ZoneRouter(
 *   () => Array.from(peerMetaMap.values()),
 *   (sid, subscribed) => rtcClient.setSubscribedFor(sid, subscribed)
 * );
 *
 * // When zone changes
 * router.updateMyZone(newZoneId);
 *
 * // When peers update (call in animation loop)
 * router.updatePeers();
 * ```
 *
 * ## Integration
 *
 * Integrated in `apps/web/src/World.ts`:
 * - Initialized when RTCClient and audioZones are available
 * - Automatically updates on zone changes and peer updates
 */

export type Vec2 = [number, number];

/**
 * Metadata for a peer participant
 */
export type PeerMeta = {
  /** User ID */
  userId: string;
  /** 2D position [x, z] */
  pos: Vec2;
  /** Current zone ID (null if not in any zone) */
  zone: string | null;
  /** Participant SID from LiveKit (required for subscription management) */
  sid?: string;
};

/**
 * ZoneRouter manages audio subscriptions based on zone membership
 *
 * Performance optimizations:
 * - Throttles subscription updates to avoid excessive RTC calls
 * - Tracks previous state to only update when changes occur
 * - Batches subscription changes
 */
export class ZoneRouter {
  private myZone: string | null = null;
  private lastSubscriptionState = new Map<string, boolean>();
  private lastUpdateTime = 0;
  private readonly UPDATE_THROTTLE_MS = 100; // Update max every 100ms (10 Hz)

  /**
   * Create a new ZoneRouter
   *
   * @param getPeers - Function that returns current peer metadata
   * @param setSubscribed - Function to set subscription state for a participant SID
   */
  constructor(
    private getPeers: () => PeerMeta[],
    private setSubscribed: (sid: string, subscribed: boolean) => void
  ) {}

  /**
   * Update my current zone
   * Immediately applies subscription changes (not throttled)
   */
  updateMyZone(zone: string | null): void {
    if (this.myZone === zone) {
      return; // No change, skip update
    }
    this.myZone = zone;
    this.lastUpdateTime = Date.now(); // Reset throttle to allow immediate update
    this.apply();
  }

  /**
   * Update peer list and reapply subscriptions
   * Throttled to avoid excessive updates (max 10 Hz)
   */
  updatePeers(): void {
    const now = Date.now();
    if (now - this.lastUpdateTime < this.UPDATE_THROTTLE_MS) {
      return; // Throttle updates
    }
    this.lastUpdateTime = now;
    this.apply();
  }

  /**
   * Apply subscription rules based on zone membership
   * Only updates subscriptions that have changed to minimize RTC calls
   */
  private apply(): void {
    const peers = this.getPeers();
    const newSubscriptionState = new Map<string, boolean>();

    // Calculate desired subscription state
    for (const peer of peers) {
      if (!peer.sid) {
        continue; // Skip peers without SID
      }

      const sameZone = !!(this.myZone && peer.zone && this.myZone === peer.zone);
      newSubscriptionState.set(peer.sid, sameZone);
    }

    // Update only changed subscriptions
    for (const [sid, shouldSubscribe] of newSubscriptionState.entries()) {
      const wasSubscribed = this.lastSubscriptionState.get(sid) ?? false;
      if (shouldSubscribe !== wasSubscribed) {
        this.setSubscribed(sid, shouldSubscribe);
      }
    }

    // Unsubscribe from peers that are no longer in the list
    for (const [sid, wasSubscribed] of this.lastSubscriptionState.entries()) {
      if (!newSubscriptionState.has(sid) && wasSubscribed) {
        this.setSubscribed(sid, false);
      }
    }

    // Update state cache
    this.lastSubscriptionState = newSubscriptionState;
  }

  /**
   * Get current zone
   */
  getMyZone(): string | null {
    return this.myZone;
  }

  /**
   * Dispose and cleanup resources
   */
  dispose(): void {
    // Unsubscribe from all peers before cleanup
    for (const [sid, subscribed] of this.lastSubscriptionState.entries()) {
      if (subscribed) {
        try {
          this.setSubscribed(sid, false);
        } catch (error) {
          // Ignore errors during cleanup
        }
      }
    }
    this.lastSubscriptionState.clear();
    this.myZone = null;
    // Note: getPeers and setSubscribed are external functions, not owned by ZoneRouter
  }
}
