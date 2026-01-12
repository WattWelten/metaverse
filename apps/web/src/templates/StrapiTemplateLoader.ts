import { getFeatureFlags } from '../FeatureFlags';
import type { TemplateIndex, TemplateInfo } from './TemplateRegistry';

// StrapiProvider wird lazy geladen für Code-Splitting (Performance-Optimierung)

/**
 * Lädt Templates aus Strapi CMS
 * Konvertiert Strapi Scenes zu Template-Manifests
 */
export class StrapiTemplateLoader {
  private cache: Map<string, any> = new Map();
  private cacheTTL = 5 * 60 * 1000; // 5 Minuten

  constructor() {
    // Provider wird lazy geladen wenn benötigt (Performance-Optimierung)
  }

  /**
   * Lädt alle Scenes aus Strapi und konvertiert sie zu Template-Index
   */
  async loadIndex(): Promise<TemplateIndex | null> {
    const flags = getFeatureFlags();
    if (flags.CMS_PROVIDER !== 'strapi') {
      return null;
    }

    const cacheKey = 'strapi-index';
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    try {
      const strapiUrl = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';
      const strapiToken = import.meta.env.VITE_STRAPI_TOKEN || '';

      // Lazy-Load StrapiProvider (Code-Splitting)
      const { StrapiSceneProvider } = await import('@metaverse/content');
      const provider = new StrapiSceneProvider(strapiUrl, strapiToken);
      const scenes = await provider.fetchScenes();

      if (scenes.length === 0) {
        return null;
      }

      const items: TemplateInfo[] = scenes.map((scene, index) => ({
        id: `strapi-${scene.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: scene.name,
        path: `strapi://${scene.name}`, // Custom protocol für Strapi-Scenes
      }));

      const index: TemplateIndex = {
        default: items[0]?.id || 'watt-eco',
        items,
      };

      this.cache.set(cacheKey, { data: index, timestamp: Date.now() });
      return index;
    } catch (error) {
      console.error('[StrapiTemplateLoader] Failed to load index:', error);
      return null;
    }
  }

  /**
   * Lädt ein Template-Manifest aus Strapi
   */
  async loadManifest(id: string): Promise<any | null> {
    const flags = getFeatureFlags();
    if (flags.CMS_PROVIDER !== 'strapi' || !id.startsWith('strapi-')) {
      return null;
    }

    const cacheKey = `strapi-manifest-${id}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    try {
      const strapiUrl = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';
      const strapiToken = import.meta.env.VITE_STRAPI_TOKEN || '';

      // Lazy-Load StrapiProvider (Code-Splitting)
      const { StrapiSceneProvider } = await import('@metaverse/content');
      const provider = new StrapiSceneProvider(strapiUrl, strapiToken);
      const scenes = await provider.fetchScenes();
      const sceneName = id.replace('strapi-', '').replace(/-/g, ' ');
      const scene = scenes.find((s) => s.name.toLowerCase() === sceneName.toLowerCase());

      if (!scene) {
        return null;
      }

      // Konvertiere Scene zu Manifest-Format
      const manifest = {
        id: id,
        name: scene.name,
        version: '1.0.0',
        assets: scene.assets || [],
        spawn: scene.spawn || { x: 0, y: 0, z: 3 },
        zones: scene.zones || [],
        portals: scene.portals || [],
        audioBeacons: scene.audioBeacons || [],
        ui: scene.ui || {},
      };

      this.cache.set(cacheKey, { data: manifest, timestamp: Date.now() });
      return manifest;
    } catch (error) {
      console.error(`[StrapiTemplateLoader] Failed to load manifest for "${id}":`, error);
      return null;
    }
  }

  /**
   * Invalidiert den Cache (wird vom Webhook aufgerufen)
   */
  invalidateCache(): void {
    this.cache.clear();
  }
}
