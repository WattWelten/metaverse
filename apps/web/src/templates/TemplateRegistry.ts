import { getFeatureFlags } from '../FeatureFlags';
import { StrapiTemplateLoader } from './StrapiTemplateLoader';

export type TemplateInfo = {
  id: string;
  name: string;
  path: string;
};

export type TemplateIndex = {
  default: string;
  items: TemplateInfo[];
};

let cachedIndex: TemplateIndex | null = null;
let strapiLoader: StrapiTemplateLoader | null = null;

// Expose StrapiTemplateLoader globally for testing
if (typeof window !== 'undefined') {
  (window as any).__strapiTemplateLoader = strapiLoader;
}

/**
 * Lädt die Template-Index-Datei vom Server oder Strapi
 */
export async function loadIndex(): Promise<TemplateIndex> {
  if (cachedIndex) {
    return cachedIndex;
  }

  const flags = getFeatureFlags();

  // Versuche Strapi zuerst, wenn aktiviert
  if (flags.CMS_PROVIDER === 'strapi') {
    if (!strapiLoader) {
      strapiLoader = new StrapiTemplateLoader();
      // Expose für Testing
      if (typeof window !== 'undefined') {
        (window as any).__strapiTemplateLoader = strapiLoader;
      }
    }

    const strapiIndex = await strapiLoader.loadIndex();
    if (strapiIndex) {
      cachedIndex = strapiIndex;
      return cachedIndex;
    }
  }

  // Fallback zu lokalen Templates
  try {
    const res = await fetch('/templates.json');
    if (!res.ok) {
      throw new Error(`Failed to load templates.json: ${res.statusText}`);
    }
    const data = await res.json();
    cachedIndex = data as TemplateIndex;
    return cachedIndex;
  } catch (error) {
    console.error('[TemplateRegistry] Failed to load templates.json:', error);
    // Fallback zu hartcodiertem Default
    return {
      default: 'watt-eco',
      items: [
        { id: 'watt-eco', name: 'Watt Eco', path: '/templates/watt-eco/manifest.json' },
        { id: 'watt-default', name: 'Watt Default', path: '/templates/watt-default/manifest.json' },
      ],
    };
  }
}

/**
 * Lädt das Manifest für eine Template-ID (von Strapi oder lokal)
 */
export async function loadManifest(id: string): Promise<any> {
  const flags = getFeatureFlags();

  // Versuche Strapi zuerst, wenn Template-ID mit 'strapi-' beginnt oder CMS_PROVIDER='strapi'
  if (id.startsWith('strapi-') || flags.CMS_PROVIDER === 'strapi') {
    if (!strapiLoader) {
      strapiLoader = new StrapiTemplateLoader();
    }

    const strapiManifest = await strapiLoader.loadManifest(id);
    if (strapiManifest) {
      return strapiManifest;
    }

    // Falls Strapi-Manifest nicht gefunden, versuche lokales Template
    if (id.startsWith('strapi-')) {
      console.warn(`[TemplateRegistry] Strapi template "${id}" not found, falling back to local`);
    }
  }

  // Lade lokales Template
  const idx = await loadIndex();
  const item = idx.items.find((i) => i.id === id) ?? idx.items.find((i) => i.id === idx.default);

  if (!item) {
    throw new Error(`Template "${id}" not found in index`);
  }

  // Wenn path mit 'strapi://' beginnt, nutze StrapiLoader
  if (item.path.startsWith('strapi://')) {
    if (!strapiLoader) {
      strapiLoader = new StrapiTemplateLoader();
    }
    const strapiManifest = await strapiLoader.loadManifest(item.id);
    if (strapiManifest) {
      return strapiManifest;
    }
  }

  try {
    const res = await fetch(item.path);
    if (!res.ok) {
      throw new Error(`Failed to load manifest: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`[TemplateRegistry] Failed to load manifest for "${id}":`, error);
    throw error;
  }
}

/**
 * Resolved Template-ID mit Priorität:
 * 1. Query-Param (?template=id)
 * 2. LocalStorage (template.id)
 * 3. Environment Variable (VITE_TEMPLATE_ID)
 * 4. Default aus templates.json
 */
export function resolveTemplateId(): string {
  // 1. Query-Param
  const query = new URLSearchParams(location.search).get('template');
  if (query) {
    return query;
  }

  // 2. LocalStorage
  try {
    const ls = localStorage.getItem('template.id');
    if (ls) {
      return ls;
    }
  } catch {
    // LocalStorage nicht verfügbar (z.B. in Tests)
  }

  // 3. Environment Variable
  const envId = import.meta.env.VITE_TEMPLATE_ID;
  if (envId) {
    return envId;
  }

  // 4. Default
  return 'watt-eco';
}

/**
 * Speichert Template-ID in LocalStorage
 */
export function persistTemplateId(id: string): void {
  try {
    localStorage.setItem('template.id', id);
  } catch (error) {
    console.warn('[TemplateRegistry] Failed to persist template ID:', error);
  }
}

/**
 * Setzt Query-Param für Template-ID (für Hot-Swap)
 */
export function setTemplateQueryParam(id: string): void {
  const url = new URL(location.href);
  url.searchParams.set('template', id);
  location.href = url.toString();
}
