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

/**
 * Lädt die Template-Index-Datei vom Server
 */
export async function loadIndex(): Promise<TemplateIndex> {
  if (cachedIndex) {
    return cachedIndex;
  }

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
 * Lädt das Manifest für eine Template-ID
 */
export async function loadManifest(id: string): Promise<any> {
  const idx = await loadIndex();
  const item = idx.items.find((i) => i.id === id) ?? idx.items.find((i) => i.id === idx.default);

  if (!item) {
    throw new Error(`Template "${id}" not found in index`);
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
