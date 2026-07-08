import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageAdapter } from './LocalStorageAdapter';

// ── localStorage mock ────────────────────────────────────────────────────────

function createMockLocalStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    key: vi.fn((index: number) => {
      const keys = [...store.keys()];
      return keys[index] ?? null;
    }),
    get length() {
      return store.size;
    },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LocalStorageAdapter', () => {
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorage = createMockLocalStorage();
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
  });

  // ── constructor ───────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('uses default prefix "sk-state"', async () => {
      const adapter = new LocalStorageAdapter();
      await adapter.save('test', 42);
      expect(mockStorage.setItem).toHaveBeenCalledWith('sk-state:test', '42');
    });

    it('accepts a custom prefix', async () => {
      const adapter = new LocalStorageAdapter('my-app');
      await adapter.save('test', 42);
      expect(mockStorage.setItem).toHaveBeenCalledWith('my-app:test', '42');
    });
  });

  // ── save ──────────────────────────────────────────────────────────────────

  describe('save()', () => {
    it('serialises value as JSON and stores with prefixed key', async () => {
      const adapter = new LocalStorageAdapter();
      await adapter.save('nav', { path: '/home', index: 0 });

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'sk-state:nav',
        JSON.stringify({ path: '/home', index: 0 })
      );
    });

    it('handles primitive values', async () => {
      const adapter = new LocalStorageAdapter();
      await adapter.save('count', 7);
      expect(mockStorage.setItem).toHaveBeenCalledWith('sk-state:count', '7');
    });

    it('handles null value', async () => {
      const adapter = new LocalStorageAdapter();
      await adapter.save('empty', null);
      expect(mockStorage.setItem).toHaveBeenCalledWith('sk-state:empty', 'null');
    });

    it('handles array values', async () => {
      const adapter = new LocalStorageAdapter();
      await adapter.save('list', [1, 2, 3]);
      expect(mockStorage.setItem).toHaveBeenCalledWith('sk-state:list', '[1,2,3]');
    });

    it('swallows errors when localStorage throws (e.g. quota exceeded)', async () => {
      vi.mocked(mockStorage.setItem).mockImplementation(() => {
        throw new DOMException('quota exceeded', 'QuotaExceededError');
      });

      const adapter = new LocalStorageAdapter();
      await expect(adapter.save('key', 'value')).resolves.toBeUndefined();
    });
  });

  // ── load ──────────────────────────────────────────────────────────────────

  describe('load()', () => {
    it('returns parsed JSON for existing key', async () => {
      const adapter = new LocalStorageAdapter();
      await adapter.save('data', { x: 1 });

      const result = await adapter.load('data');
      expect(result).toEqual({ x: 1 });
    });

    it('returns null for missing key', async () => {
      const adapter = new LocalStorageAdapter();
      const result = await adapter.load('nonexistent');
      expect(result).toBeNull();
    });

    it('returns null when getItem returns null', async () => {
      vi.mocked(mockStorage.getItem).mockReturnValue(null);

      const adapter = new LocalStorageAdapter();
      const result = await adapter.load('missing');
      expect(result).toBeNull();
    });

    it('returns null on JSON parse errors (corrupted data)', async () => {
      vi.mocked(mockStorage.getItem).mockReturnValue('not valid json{{{');

      const adapter = new LocalStorageAdapter();
      const result = await adapter.load('corrupt');
      expect(result).toBeNull();
    });

    it('returns null when localStorage throws', async () => {
      vi.mocked(mockStorage.getItem).mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const adapter = new LocalStorageAdapter();
      const result = await adapter.load('key');
      expect(result).toBeNull();
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('removes the prefixed key from localStorage', async () => {
      const adapter = new LocalStorageAdapter();
      await adapter.save('nav', { path: '/' });
      await adapter.remove('nav');

      expect(mockStorage.removeItem).toHaveBeenCalledWith('sk-state:nav');
    });

    it('value is gone after removal', async () => {
      const adapter = new LocalStorageAdapter();
      await adapter.save('nav', 'data');
      await adapter.remove('nav');

      const result = await adapter.load('nav');
      expect(result).toBeNull();
    });

    it('swallows errors when localStorage throws', async () => {
      vi.mocked(mockStorage.removeItem).mockImplementation(() => {
        throw new Error('storage error');
      });

      const adapter = new LocalStorageAdapter();
      await expect(adapter.remove('key')).resolves.toBeUndefined();
    });
  });

  // ── clear ─────────────────────────────────────────────────────────────────

  describe('clear()', () => {
    it('removes only keys matching the prefix', async () => {
      const adapter = new LocalStorageAdapter('myapp');

      // Directly populate store with mixed keys
      mockStorage.setItem('myapp:a', '"1"');
      mockStorage.setItem('myapp:b', '"2"');
      mockStorage.setItem('other:c', '"3"');

      // Reset mock call counts so we only track clear() calls
      vi.mocked(mockStorage.removeItem).mockClear();

      await adapter.clear();

      expect(mockStorage.removeItem).toHaveBeenCalledWith('myapp:a');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('myapp:b');
      expect(mockStorage.removeItem).not.toHaveBeenCalledWith('other:c');
    });

    it('does not remove keys from a different prefix', async () => {
      const adapter = new LocalStorageAdapter('app1');

      mockStorage.setItem('app2:key', '"val"');

      await adapter.clear();

      // The other-prefix key should remain
      expect(mockStorage.getItem('app2:key')).toBe('"val"');
    });

    it('handles empty localStorage', async () => {
      const adapter = new LocalStorageAdapter();
      await expect(adapter.clear()).resolves.toBeUndefined();
    });

    it('swallows errors when localStorage throws during iteration', async () => {
      // Make key() throw on first call
      vi.mocked(mockStorage.key).mockImplementation(() => {
        throw new Error('storage error');
      });

      const adapter = new LocalStorageAdapter();
      await expect(adapter.clear()).resolves.toBeUndefined();
    });
  });

  // ── prefix isolation ──────────────────────────────────────────────────────

  describe('prefix isolation', () => {
    it('two adapters with different prefixes do not interfere', async () => {
      const adapter1 = new LocalStorageAdapter('ns1');
      const adapter2 = new LocalStorageAdapter('ns2');

      await adapter1.save('key', 'from-ns1');
      await adapter2.save('key', 'from-ns2');

      expect(await adapter1.load('key')).toBe('from-ns1');
      expect(await adapter2.load('key')).toBe('from-ns2');
    });

    it('clear on one adapter does not affect another', async () => {
      const adapter1 = new LocalStorageAdapter('ns1');
      const adapter2 = new LocalStorageAdapter('ns2');

      await adapter1.save('key', 'v1');
      await adapter2.save('key', 'v2');

      await adapter1.clear();

      expect(await adapter1.load('key')).toBeNull();
      expect(await adapter2.load('key')).toBe('v2');
    });
  });
});
