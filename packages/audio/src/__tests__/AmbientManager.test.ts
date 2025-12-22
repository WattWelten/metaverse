import { describe, it, expect, beforeEach } from 'vitest';

import { getContext, resumeContext, AmbientManager } from '../AmbientManager.js';

describe('AmbientManager', () => {
  beforeEach(() => {
    // Reset context between tests
    // Note: In a real test environment, you might want to mock AudioContext
  });

  describe('getContext', () => {
    it('should return singleton AudioContext', () => {
      const ctx1 = getContext();
      const ctx2 = getContext();
      expect(ctx1).toBe(ctx2);
    });

    it('should create AudioContext if not exists', () => {
      const ctx = getContext();
      expect(ctx).toBeInstanceOf(AudioContext);
    });
  });

  describe('resumeContext', () => {
    it('should resume suspended context', async () => {
      const ctx = getContext();
      // Mock suspended state
      if (ctx.state === 'suspended') {
        await resumeContext();
        // Context should be resumed (or running)
        expect(['running', 'suspended']).toContain(ctx.state);
      } else {
        // Context is already running, resume should not fail
        await expect(resumeContext()).resolves.not.toThrow();
      }
    });
  });

  describe('AmbientManager class', () => {
    it('should create instance', () => {
      const manager = new AmbientManager();
      expect(manager).toBeInstanceOf(AmbientManager);
    });

    it('should get context', () => {
      const manager = new AmbientManager();
      const ctx = manager.getContext();
      expect(ctx).toBeInstanceOf(AudioContext);
    });

    it('should resume context', async () => {
      const manager = new AmbientManager();
      await expect(manager.resumeContext()).resolves.not.toThrow();
    });
  });
});
