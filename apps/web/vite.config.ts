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
      // Polyfills für Node.js-Module (Socket.io benötigt diese, aber Warnungen sind harmlos)
      // events und util werden von Vite automatisch externalized, das ist OK
    },
  },
  server: {
    port: 5173,
    https: false,
    host: true,
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    minify: 'esbuild', // Schnell und effizient
    // Chunk-Size-Warnung erhöhen (Three.js ist groß)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      external: ['@pixiv/three-vrm'], // Optional dependency, not bundled
      output: {
        manualChunks: (id) => {
          // Three.js in separaten Chunk
          if (id.includes('three')) {
            // Three.js Core
            if (id.includes('three/examples/jsm') || id.includes('three/src')) {
              return 'three-core';
            }
            // Three.js Examples (Controls, Loaders, etc.)
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
            if (packageName && ['ai', 'voice', 'xr'].includes(packageName)) {
              // Feature-Packages können lazy geladen werden
              return `metaverse-${packageName}`;
            }
            return 'metaverse-core';
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
