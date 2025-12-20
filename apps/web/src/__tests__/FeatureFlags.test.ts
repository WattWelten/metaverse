import { describe, it, expect } from 'vitest';
import { getFeatureFlags, setFeatureFlags } from '../FeatureFlags';

describe('FeatureFlags', () => {
  it('should return default flags', () => {
    const flags = getFeatureFlags();
    expect(flags).toBeDefined();
    expect(flags.MULTIPLAYER_ENABLED).toBe(true);
    expect(flags.VOICE_ENABLED).toBe(true);
  });

  it('should allow setting flags', () => {
    setFeatureFlags({ AI_ENABLED: true });
    const flags = getFeatureFlags();
    expect(flags.AI_ENABLED).toBe(true);
  });
});



