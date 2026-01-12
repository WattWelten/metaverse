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
  documentId?: string;
  name?: string; // Strapi v5: Felder können direkt auf der Scene stehen
  attributes?: {
    name: string;
    sceneJson?: unknown; // Validated against scene.schema.json
    spawn?: { x?: number; y?: number; z?: number };
    assets?: Array<{ idStr?: string; id?: number; src: string; draco?: boolean; ktx2?: boolean }>;
    audioBeacons?: Array<{
      idStr?: string;
      id?: number;
      pos: [number, number, number];
      url: string;
      radius: number;
    }>;
    portals?: Array<{ to: string; position: [number, number, number] }>;
    zones?: Array<{
      idStr?: string;
      id?: number;
      shape: 'circle' | 'polygon';
      center?: [number, number];
      radius?: number;
      points?: Array<[number, number]>;
      isStage?: boolean;
    }>;
    ui?: Record<string, unknown>;
    publishedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  // Strapi v5: Felder können auch direkt auf der Scene stehen (ohne attributes)
  spawn?: { x?: number; y?: number; z?: number };
  assets?: Array<{ idStr?: string; id?: number; src: string; draco?: boolean; ktx2?: boolean }>;
  audioBeacons?: Array<{
    idStr?: string;
    id?: number;
    pos: [number, number, number];
    url: string;
    radius: number;
  }>;
  portals?: Array<{ to: string; position: [number, number, number] }>;
  zones?: Array<{
    idStr?: string;
    id?: number;
    shape: 'circle' | 'polygon';
    center?: [number, number];
    radius?: number;
    points?: Array<[number, number]>;
    isStage?: boolean;
  }>;
  ui?: Record<string, unknown>;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
   * Fetch all published scenes from Strapi and normalize them
   */
  async fetchScenes(): Promise<ReturnType<typeof normalizeScene>[]> {
    const cacheKey = 'scenes';
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as ReturnType<typeof normalizeScene>[];
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
      const normalized = data.data.map((d) => normalizeScene(d));
      this.cache.set(cacheKey, { data: normalized, timestamp: Date.now() });
      return normalized;
    } catch (error) {
      console.error('[StrapiProvider] Failed to fetch scenes:', error);
      throw error;
    }
  }

  /**
   * Fetch a single scene by ID
   */
  async fetchScene(id: number | string): Promise<ReturnType<typeof normalizeScene> | null> {
    const cacheKey = `scene-${id}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as ReturnType<typeof normalizeScene>;
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
      const normalized = normalizeScene(data.data);
      this.cache.set(cacheKey, { data: normalized, timestamp: Date.now() });
      return normalized;
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

/**
 * Normalize Strapi scene data to client format
 *
 * Converts Strapi API response format to client-friendly format:
 * - Maps nested attributes to flat structure
 * - Converts IDs to strings
 * - Handles missing/optional fields with defaults
 * - Normalizes zone shapes (circle/polygon)
 *
 * @param d - Strapi scene response
 * @returns Normalized scene data
 */
export function normalizeScene(d: StrapiScene): {
  name: string;
  spawn: { x?: number; y?: number; z?: number };
  assets: Array<{ id: string; src: string; draco?: boolean; ktx2?: boolean }>;
  audioBeacons: Array<{
    id: string;
    pos: [number, number, number];
    url: string;
    radius: number;
  }>;
  portals: Array<{ to: string; position: [number, number, number] }>;
  zones: Array<{
    id: string;
    shape: 'circle' | 'polygon';
    center?: [number, number];
    radius?: number;
    points?: Array<[number, number]>;
    isStage?: boolean;
  }>;
  ui: Record<string, unknown>;
} {
  // Strapi v5: Felder können direkt auf der Scene stehen oder unter attributes
  const attrs = d.attributes || ({} as StrapiScene['attributes']);
  const name = d.name || attrs?.name || 'Unnamed Scene';
  const spawn = d.spawn || attrs?.spawn || {};
  const assets = d.assets || attrs?.assets || [];
  const audioBeacons = d.audioBeacons || attrs?.audioBeacons || [];
  const portals = d.portals || attrs?.portals || [];
  const zones = d.zones || attrs?.zones || [];
  const ui = d.ui || attrs?.ui || {};

  const arrayOrEmpty = <T>(x: T[] | undefined | null): T[] => x || [];

  return {
    name,
    spawn: (spawn as { x?: number; y?: number; z?: number }) || {},
    assets: arrayOrEmpty(assets).map((a: any) => ({
      id: a.idStr || a.id?.toString() || '',
      src: a.src || '',
      draco: a.draco || false,
      ktx2: a.ktx2 || false,
    })),
    audioBeacons: arrayOrEmpty(audioBeacons).map((b: any) => ({
      id: b.idStr || b.id?.toString() || '',
      pos: (b.pos as [number, number, number]) || [0, 0, 0],
      url: b.url || '',
      radius: Number(b.radius || 0),
    })),
    portals: arrayOrEmpty(portals).map((p: any) => ({
      to: p.to || '',
      position: (p.position as [number, number, number]) || [0, 0, 0],
    })),
    zones: arrayOrEmpty(zones).map((z: any) => ({
      id: z.idStr || z.id?.toString() || '',
      shape: (z.shape as 'circle' | 'polygon') || 'circle',
      center: z.center as [number, number] | undefined,
      radius: z.radius ? Number(z.radius) : undefined,
      points: z.points as Array<[number, number]> | undefined,
      isStage: !!z.isStage,
    })),
    ui: (ui as Record<string, unknown>) || {},
  };
}

// Singleton instance
let strapiProvider: StrapiProvider | null = null;

export function getStrapiProvider(): StrapiProvider {
  if (!strapiProvider) {
    strapiProvider = new StrapiProvider();
  }
  return strapiProvider;
}
