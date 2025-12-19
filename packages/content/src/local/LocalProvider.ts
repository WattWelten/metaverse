import type { ContentProvider } from '../ContentProvider.js';

export class LocalProvider implements ContentProvider {
  private basePath: string;

  constructor(basePath = '/content/local') {
    this.basePath = basePath;
  }

  async getEntry<T = unknown>(type: string, id: string): Promise<T | null> {
    try {
      const response = await fetch(`${this.basePath}/${type}/${id}.json`);
      if (!response.ok) {
        return null;
      }
      return (await response.json()) as T;
    } catch (error) {
      console.error(`Failed to get entry ${type}/${id}:`, error);
      return null;
    }
  }

  async list<T = unknown>(type: string, q?: Record<string, unknown>): Promise<T[]> {
    try {
      const response = await fetch(`${this.basePath}/${type}/index.json`);
      if (!response.ok) {
        return [];
      }
      const data = (await response.json()) as T[];
      
      // Simple query filtering
      if (q) {
        return data.filter((item) => {
          return Object.entries(q).every(([key, value]) => {
            return (item as Record<string, unknown>)[key] === value;
          });
        });
      }
      
      return data;
    } catch (error) {
      console.error(`Failed to list entries for ${type}:`, error);
      return [];
    }
  }

  async create<T = unknown>(_type: string, _data: T): Promise<T> {
    // Local provider doesn't support creation in MVP
    // This would require a backend or file system access
    throw new Error('LocalProvider does not support create operations');
  }

  async update<T = unknown>(_type: string, _id: string, _data: Partial<T>): Promise<T> {
    // Local provider doesn't support updates in MVP
    throw new Error('LocalProvider does not support update operations');
  }

  async uploadAsset(_file: File | Blob, _path?: string): Promise<{ url: string; id: string }> {
    // Local provider doesn't support uploads in MVP
    throw new Error('LocalProvider does not support upload operations');
  }
}

