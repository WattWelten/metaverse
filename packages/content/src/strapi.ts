// Strapi Provider für No-Code Scene Management
// Lädt Scenes aus Strapi CMS und validiert sie gegen JSON Schema

const STRAPI_URL =
  process.env.STRAPI_URL ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_STRAPI_URL) ||
  '';
const STRAPI_TOKEN =
  process.env.STRAPI_TOKEN ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_STRAPI_TOKEN) ||
  '';

export interface StrapiScene {
  id: number;
  attributes: {
    name: string;
    sceneJson: unknown; // Validated against scene.schema.json
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export class StrapiProvider {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private baseUrl: string = STRAPI_URL || '',
    private token: string = STRAPI_TOKEN || ''
  ) {}

  /**
   * Fetch all published scenes from Strapi
   */
  async fetchScenes(): Promise<StrapiScene[]> {
    const cacheKey = 'scenes';
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as StrapiScene[];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/api/scenes?publicationState=live&sort=createdAt:desc`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Strapi API error: ${response.statusText}`);
      }

      const data: StrapiResponse<StrapiScene> = await response.json();
      this.cache.set(cacheKey, { data: data.data, timestamp: Date.now() });
      return data.data;
    } catch (error) {
      console.error('[StrapiProvider] Failed to fetch scenes:', error);
      throw error;
    }
  }

  /**
   * Fetch a single scene by ID
   */
  async fetchScene(id: number | string): Promise<StrapiScene | null> {
    const cacheKey = `scene-${id}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as StrapiScene;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/scenes/${id}?publicationState=live`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Strapi API error: ${response.statusText}`);
      }

      const data: { data: StrapiScene } = await response.json();
      this.cache.set(cacheKey, { data: data.data, timestamp: Date.now() });
      return data.data;
    } catch (error) {
      console.error(`[StrapiProvider] Failed to fetch scene ${id}:`, error);
      throw error;
    }
  }

  /**
   * Invalidate cache (call after scene updates)
   */
  invalidateCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Validate scene JSON against schema
   */
  validateScene(sceneJson: unknown): { valid: boolean; errors?: string[] } {
    // In production, use Ajv or zod with scene.schema.json
    // For now, basic validation
    if (!sceneJson || typeof sceneJson !== 'object') {
      return { valid: false, errors: ['Scene JSON must be an object'] };
    }

    const scene = sceneJson as Record<string, unknown>;
    if (!scene.name || typeof scene.name !== 'string') {
      return { valid: false, errors: ['Scene must have a name'] };
    }

    if (!scene.assets || !Array.isArray(scene.assets)) {
      return { valid: false, errors: ['Scene must have assets array'] };
    }

    if (!scene.spawn || typeof scene.spawn !== 'object') {
      return { valid: false, errors: ['Scene must have spawn point'] };
    }

    return { valid: true };
  }
}

// Singleton instance
let strapiProvider: StrapiProvider | null = null;

export function getStrapiProvider(): StrapiProvider {
  if (!strapiProvider) {
    strapiProvider = new StrapiProvider();
  }
  return strapiProvider;
}
