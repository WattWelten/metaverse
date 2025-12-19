import type { ContentProvider } from '../ContentProvider.js';

export interface StrapiProviderConfig {
  baseUrl: string;
  token: string;
}

export class StrapiProvider implements ContentProvider {
  private config: StrapiProviderConfig;

  constructor(config: StrapiProviderConfig) {
    this.config = config;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.token}`,
    };
  }

  async getEntry<T = unknown>(type: string, id: string): Promise<T | null> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/${type}/${id}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as { data: T };
      return data.data;
    } catch (error) {
      console.error(`Failed to get entry ${type}/${id}:`, error);
      return null;
    }
  }

  async list<T = unknown>(type: string, q?: Record<string, unknown>): Promise<T[]> {
    try {
      const url = new URL(`${this.config.baseUrl}/api/${type}`);
      if (q) {
        Object.entries(q).forEach(([key, value]) => {
          url.searchParams.set(`filters[${key}][$eq]`, String(value));
        });
      }

      const response = await fetch(url.toString(), {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return [];
      }

      const data = (await response.json()) as { data: T[] };
      return data.data;
    } catch (error) {
      console.error(`Failed to list entries for ${type}:`, error);
      return [];
    }
  }

  async create<T = unknown>(type: string, data: T): Promise<T> {
    const response = await fetch(`${this.config.baseUrl}/api/${type}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create ${type}: ${response.statusText}`);
    }

    const result = (await response.json()) as { data: T };
    return result.data;
  }

  async update<T = unknown>(type: string, id: string, data: Partial<T>): Promise<T> {
    const response = await fetch(`${this.config.baseUrl}/api/${type}/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update ${type}/${id}: ${response.statusText}`);
    }

    const result = (await response.json()) as { data: T };
    return result.data;
  }

  async uploadAsset(file: File | Blob, path?: string): Promise<{ url: string; id: string }> {
    const formData = new FormData();
    formData.append('files', file);
    if (path) {
      formData.append('path', path);
    }

    const response = await fetch(`${this.config.baseUrl}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload asset: ${response.statusText}`);
    }

    const result = (await response.json()) as Array<{ url: string; id: number }>;
    return {
      url: result[0]?.url || '',
      id: String(result[0]?.id || ''),
    };
  }
}

