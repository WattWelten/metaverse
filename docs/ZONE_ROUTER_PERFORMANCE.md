# ZoneRouter Performance Optimizations

## Overview

The `ZoneRouter` manages audio subscriptions based on zone membership, ensuring audio isolation between different zones. This document describes the performance optimizations implemented.

## Performance Issues Addressed

### 1. Excessive Update Calls

**Problem**: `updatePeers()` was called every frame (60fps), causing unnecessary RTC subscription updates.

**Solution**: Implemented throttling mechanism:

- Updates are throttled to max 10 Hz (every 100ms)
- `updateMyZone()` bypasses throttle for immediate updates on zone changes

### 2. Redundant Subscription Updates

**Problem**: Subscriptions were updated even when state hadn't changed.

**Solution**: State tracking:

- Tracks previous subscription state in `lastSubscriptionState` Map
- Only calls `setSubscribed()` when subscription state actually changes
- Automatically unsubscribes from peers that are no longer in the list

### 3. Inefficient Peer Lookups

**Problem**: Participant SID lookup in RTCClient was done every frame for every peer.

**Solution**: Caching:

- Peer metadata cached in `peerMetaMap` in `World.ts`
- Lookup uses cache first, falls back to RTCClient only when needed
- Error handling prevents crashes on lookup failures

## Implementation Details

### Throttling

```typescript
private lastUpdateTime = 0;
private readonly UPDATE_THROTTLE_MS = 100; // 10 Hz

updatePeers(): void {
  const now = Date.now();
  if (now - this.lastUpdateTime < this.UPDATE_THROTTLE_MS) {
    return; // Throttle updates
  }
  this.lastUpdateTime = now;
  this.apply();
}
```

### Change Detection

```typescript
private lastSubscriptionState = new Map<string, boolean>();

private apply(): void {
  // Calculate desired state
  const newSubscriptionState = new Map<string, boolean>();
  // ... calculate subscriptions ...

  // Update only changed subscriptions
  for (const [sid, shouldSubscribe] of newSubscriptionState.entries()) {
    const wasSubscribed = this.lastSubscriptionState.get(sid) ?? false;
    if (shouldSubscribe !== wasSubscribed) {
      this.setSubscribed(sid, shouldSubscribe);
    }
  }

  // Update state cache
  this.lastSubscriptionState = newSubscriptionState;
}
```

### Error Handling

```typescript
(sid: string, subscribed: boolean) => {
  try {
    if (this.rtcClient) {
      this.rtcClient.setSubscribedFor(sid, subscribed);
    }
  } catch (error) {
    logger.error(`[World] Failed to set subscription for ${sid}:`, error);
  }
};
```

## Performance Metrics

- **Before**: ~60 subscription updates/second (every frame)
- **After**: ~10 subscription updates/second (throttled) + only on changes
- **Reduction**: ~83% fewer RTC calls

## Testing

Unit tests in `packages/voice/src/zone-router.test.ts` verify:

- Throttling behavior
- Change detection
- State tracking
- Edge cases (empty lists, null zones, removed peers)

## Future Optimizations

1. **Batch Updates**: Group multiple subscription changes into a single RTC call
2. **Zone Prediction**: Pre-subscribe when approaching zone boundaries
3. **Adaptive Throttling**: Adjust throttle rate based on zone change frequency
