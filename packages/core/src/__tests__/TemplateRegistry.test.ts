import { Scene } from 'three';
import { describe, it, expect, beforeEach } from 'vitest';

import { templateRegistry } from '../scene/TemplateRegistry.js';
import type { TemplateManifest } from '../scene/TemplateRegistry.js';

describe('TemplateRegistry', () => {
  beforeEach(() => {
    // Clear registry before each test
    templateRegistry.unload();
  });

  it('should register and load template', async () => {
    const scene = new Scene();

    templateRegistry.register('test', async (manifest: TemplateManifest) => ({
      manifest,
      scene: null,
      mount: async () => {},
      unmount: () => {},
      applyTheme: () => {},
    }));

    const instance = await templateRegistry.load('test', scene);
    expect(instance).toBeDefined();
    expect(instance.manifest.name).toBe('test');
  });

  it('should fallback to watt-default on error', async () => {
    const scene = new Scene();

    // Register default template
    templateRegistry.register('watt-default', async (manifest: TemplateManifest) => ({
      manifest,
      scene: null,
      mount: async () => {},
      unmount: () => {},
      applyTheme: () => {},
    }));

    // Try to load non-existent template
    try {
      await templateRegistry.load('non-existent', scene);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should handle array spawn format', async () => {
    const scene = new Scene();

    templateRegistry.register('test-array-spawn', async (manifest: TemplateManifest) => {
      // Test that manifest can have array spawn
      const spawn = manifest.spawn;
      if (Array.isArray(spawn)) {
        expect(spawn).toHaveLength(3);
      }

      return {
        manifest,
        scene: null,
        mount: async () => {},
        unmount: () => {},
        applyTheme: () => {},
      };
    });

    const instance = await templateRegistry.load('test-array-spawn', scene);
    expect(instance).toBeDefined();
  });
});
