import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
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
    },
  },
});

