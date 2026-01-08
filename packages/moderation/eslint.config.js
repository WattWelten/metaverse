import baseConfig from '@metaverse/eslint-config/eslint.config.js';

export default [
  ...baseConfig,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
