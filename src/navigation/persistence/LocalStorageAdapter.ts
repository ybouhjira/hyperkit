import type { StateStorageAdapter } from './types';

export class LocalStorageAdapter implements StateStorageAdapter {
  private prefix: string;

  constructor(prefix = 'sk-state') {
    this.prefix = prefix;
  }

  private fullKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  save(key: string, state: unknown): Promise<void> {
    try {
      localStorage.setItem(this.fullKey(key), JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
    return Promise.resolve();
  }

  load(key: string): Promise<unknown | null> {
    try {
      const raw = localStorage.getItem(this.fullKey(key));
      return Promise.resolve(raw ? (JSON.parse(raw) as unknown) : null);
    } catch {
      return Promise.resolve(null);
    }
  }

  remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.fullKey(key));
    } catch {
      /* ignore */
    }
    return Promise.resolve();
  }

  clear(): Promise<void> {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(this.prefix + ':')) keysToRemove.push(k);
      }
      for (const k of keysToRemove) localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
    return Promise.resolve();
  }
}
