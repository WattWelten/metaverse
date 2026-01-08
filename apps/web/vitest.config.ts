import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 60000, // 60 Sekunden Standard-Timeout
    hookTimeout: 10000, // 10 Sekunden für Hooks
    // Test-Dateien finden
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/__tests__/**/*.{ts,tsx}',
    ],
    // Helper-Dateien ausschließen
    exclude: ['node_modules', 'dist', '**/setup.ts', '**/helpers/heartbeat.ts', '**/mocks.ts'],
    // Progress-Reporting für lange Tests
    reporters: ['verbose'],
    // Output während Tests
    silent: false,
    // Log-Level für bessere Sichtbarkeit
    logLevel: 'info',
    // Watch-Mode deaktivieren für CI/Non-Interactive
    watch: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/__tests__/**',
        '**/dist/**',
        '**/build/**',
      ],
    },
    setupFiles: ['./src/__tests__/setup.ts'],
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
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
});
