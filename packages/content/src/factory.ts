import type { ContentProvider } from './ContentProvider.js';
import { LocalProvider } from './local/LocalProvider.js';
import { StrapiProvider, type StrapiProviderConfig } from './strapi/StrapiProvider.js';

export type ProviderType = 'local' | 'strapi';

export function createContentProvider(
  type: ProviderType,
  config?: StrapiProviderConfig
): ContentProvider {
  switch (type) {
    case 'local':
      return new LocalProvider();
    case 'strapi':
      if (!config) {
        throw new Error('StrapiProvider requires config');
      }
      return new StrapiProvider(config);
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}

