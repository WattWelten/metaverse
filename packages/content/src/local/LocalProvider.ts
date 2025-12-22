import type { ContentProvider } from '../ContentProvider.js';

const db: Record<string, Record<string, unknown>> = {};
let idCounter = 0;

export class LocalProvider implements ContentProvider {
  async getEntry<T = unknown>(type: string, id: string): Promise<T | null> {
    return (db[type]?.[id] ?? null) as T | null;
  }

  async list<T = unknown>(type: string): Promise<T[]> {
    return Object.values(db[type] ?? {}) as T[];
  }

  async create<T = unknown>(type: string, data: T): Promise<T> {
    const id = (++idCounter).toString();
    db[type] ??= {};
    db[type][id] = { id, ...data };
    return db[type][id] as T;
  }

  async update<T = unknown>(type: string, id: string, data: Partial<T>): Promise<T> {
    db[type] ??= {};
    db[type][id] = { ...((db[type][id] as object) || {}), ...data };
    return db[type][id] as T;
  }

  async uploadAsset(file: Blob | File): Promise<{ url: string; id: string }> {
    const id = `asset-${++idCounter}`;
    const url = URL.createObjectURL(file);
    return { url, id };
  }
}
