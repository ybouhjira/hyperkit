export interface StateStorageAdapter {
  save(key: string, state: unknown): Promise<void>;
  load(key: string): Promise<unknown | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface PersistenceOptions {
  adapter: StateStorageAdapter;
  key?: string;
  debounce?: number;
  include?: string[];
  exclude?: string[];
}
