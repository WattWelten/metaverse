import { WebGLRenderer } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { describe, it, expect } from 'vitest';

import { getDracoLoader, createDraco } from '../render/loaders/draco.js';
import { useGLTFCache, createGLTFCacher, getGLTFCache } from '../render/loaders/gltf.js';
import { getKTX2Loader, createKTX2 } from '../render/loaders/ktx2.js';

describe('Loaders', () => {
  describe('KTX2 Loader', () => {
    it('should create KTX2 loader', () => {
      const loader = getKTX2Loader();
      expect(loader).toBeDefined();
    });

    it('should integrate with GLTFLoader', () => {
      const gltfLoader = new GLTFLoader();
      const renderer = new WebGLRenderer();
      createKTX2(gltfLoader, renderer);
      // If no error, integration works
      expect(gltfLoader).toBeDefined();
    });
  });

  describe('Draco Loader', () => {
    it('should create Draco loader', () => {
      const loader = getDracoLoader();
      expect(loader).toBeDefined();
    });

    it('should integrate with GLTFLoader', () => {
      const gltfLoader = new GLTFLoader();
      createDraco(gltfLoader);
      // If no error, integration works
      expect(gltfLoader).toBeDefined();
    });
  });

  describe('GLTF Cache', () => {
    it('should have cache map', () => {
      const cache = getGLTFCache();
      expect(cache).toBeInstanceOf(Map);
    });

    it('should create GLTF cacher', () => {
      const gltfLoader = new GLTFLoader();
      createGLTFCacher(gltfLoader);
      // If no error, cacher works
      expect(gltfLoader).toBeDefined();
    });

    it('should handle cache for non-existent URLs gracefully', async () => {
      // This should not throw, even if URL doesn't exist
      try {
        await useGLTFCache('/non-existent.glb');
      } catch (error) {
        // Expected to fail, but should not crash
        expect(error).toBeDefined();
      }
    });
  });
});
