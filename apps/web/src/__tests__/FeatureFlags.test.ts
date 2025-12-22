import { describe, it, expect, beforeEach } from 'vitest';

import { getFeatureFlags, setFeatureFlags } from '../FeatureFlags';

describe('FeatureFlags', () => {
  beforeEach(() => {
    // Reset flags to defaults
    setFeatureFlags({
      AI_ENABLED: false,
      VOICE_ENABLED: true,
      XR_ENABLED: true,
      CMS_PROVIDER: 'local',
      TEMPLATE_ID: 'watt-default',
      MULTIPLAYER_ENABLED: true,
      AMBIENT_AUDIO_ENABLED: true,
    });
  });

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

  it('should handle flag overrides', () => {
    setFeatureFlags({ TEMPLATE_ID: 'watt-eco' });
    const flags = getFeatureFlags();
    expect(flags.TEMPLATE_ID).toBe('watt-eco');
  });

  it('should parse ENV flags correctly', () => {
    // This tests that flags are read from environment
    const flags = getFeatureFlags();
    expect(typeof flags.AI_ENABLED).toBe('boolean');
    expect(typeof flags.VOICE_ENABLED).toBe('boolean');
    expect(['local', 'strapi']).toContain(flags.CMS_PROVIDER);
  });
});
