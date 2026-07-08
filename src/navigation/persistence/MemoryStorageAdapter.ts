import type { StateStorageAdapter } from './types';

export class MemoryStorageAdapter implements StateStorageAdapter {
  private store = new Map<string, unknown>();

  save(key: string, state: unknown): Promise<void> {
    this.store.set(key, JSON.parse(JSON.stringify(state)));
    return Promise.resolve();
  }

  load(key: string): Promise<unknown | null> {
    return Promise.resolve(this.store.get(key) ?? null);
  }

  remove(key: string): Promise<void> {
    this.store.delete(key);
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.store.clear();
    return Promise.resolve();
  }

  get size(): number {
    return this.store.size;
  }
}
