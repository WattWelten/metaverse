import { describe, it, expect, beforeEach, vi } from 'vitest';

import { createXRAdapter } from '../createXR.js';
import { ThreeXRAdapter } from '../ThreeXRAdapter.js';

describe('XR Adapter', () => {
  beforeEach(() => {
    // Reset environment
    vi.resetModules();
  });

  it('returns null when XR disabled', async () => {
    // Mock environment
    const originalEnv = import.meta.env;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (import.meta as any).env = { VITE_XR_ENABLED: 'false' };

    const adapter = await createXRAdapter();
    expect(adapter).toBeNull();

    // Restore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (import.meta as any).env = originalEnv;
  });

  it('returns ThreeXRAdapter when XR enabled', async () => {
    // Mock environment
    const originalEnv = import.meta.env;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (import.meta as any).env = { VITE_XR_ENABLED: 'true', VITE_VE_ENABLED: 'false' };

    const adapter = await createXRAdapter();
    expect(adapter).toBeInstanceOf(ThreeXRAdapter);

    // Restore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (import.meta as any).env = originalEnv;
  });
});
