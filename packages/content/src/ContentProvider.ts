export interface ContentProvider {
  getEntry<T = unknown>(type: string, id: string): Promise<T | null>;
  list<T = unknown>(type: string, q?: Record<string, unknown>): Promise<T[]>;
  create<T = unknown>(type: string, data: T): Promise<T>;
  update<T = unknown>(type: string, id: string, data: Partial<T>): Promise<T>;
  uploadAsset(file: File | Blob, path?: string): Promise<{ url: string; id: string }>;
}

