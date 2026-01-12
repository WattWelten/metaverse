import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis', // Fix für "global is not defined" Fehler
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, '../../packages/core/src'),
      '@ui': resolve(__dirname, '../../packages/ui/src'),
      '@avatars': resolve(__dirname, '../../packages/avatars/src'),
      '@voice': resolve(__dirname, '../../packages/voice/src'),
      '@audio': resolve(__dirname, '../../packages/audio/src'),
      '@net': resolve(__dirname, '../../packages/net/src'),
      '@ai': resolve(__dirname, '../../packages/ai/src'),
      '@content': resolve(__dirname, '../../packages/content/src'),
      '@assets': resolve(__dirname, '../../packages/assets'),
      // Fix für simple-peer Node 'util' Warnungen
      'simple-peer': 'simple-peer/simplepeer.min.js',
      // Polyfills für Node.js-Module (Socket.io benötigt diese, aber Warnungen sind harmlos)
      // events und util werden von Vite automatisch externalized, das ist OK
    },
  },
  server: {
    port: 5173,
    https: false,
    host: true,
    strictPort: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    minify: 'esbuild', // Schnell und effizient
    // Chunk-Size-Warnung erhöhen (Three.js ist groß, aber wir optimieren)
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      external: ['@pixiv/three-vrm'], // Optional dependency, not bundled
      treeshake: {
        moduleSideEffects: (id) => {
          // Three.js Examples können side effects haben
          if (id.includes('three/examples')) {
            return false; // Tree-shake wenn möglich
          }
          return false; // Aggressives Tree-Shaking
        },
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
      output: {
        manualChunks: (id) => {
          // Three.js in separaten Chunk (optimiert für Tree-Shaking)
          if (id.includes('three')) {
            // Three.js Core (nur benötigte Module)
            if (id.includes('three/src') && !id.includes('examples')) {
              return 'three-core';
            }
            // Three.js Examples (Controls, Loaders, etc.) - lazy loaded
            if (id.includes('three/examples/jsm/controls')) {
              return 'three-controls';
            }
            if (id.includes('three/examples/jsm/loaders')) {
              return 'three-loaders';
            }
            if (id.includes('three/examples/jsm/objects')) {
              return 'three-objects';
            }
            if (id.includes('three/examples')) {
              return 'three-examples';
            }
            return 'three';
          }
          // React in separaten Chunk
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react';
          }
          // Packages in separate Chunks für Lazy-Loading
          if (id.includes('@metaverse/')) {
            const packageName = id.split('@metaverse/')[1]?.split('/')[0];
            if (packageName && ['ai', 'voice', 'xr', 'content'].includes(packageName)) {
              // Feature-Packages können lazy geladen werden (inkl. StrapiProvider)
              return `metaverse-${packageName}`;
            }
            return 'metaverse-core';
          }
          // StrapiProvider lazy loading
          if (id.includes('strapi') || id.includes('StrapiTemplateLoader')) {
            return 'metaverse-strapi';
          }
        },
      },
    },
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    include: ['three'],
    exclude: ['@pixiv/three-vrm'], // Don't pre-bundle optional dependency
  },
});
