import { describe, it, expect } from 'vitest';
import { MemoryStorageAdapter } from './MemoryStorageAdapter';

describe('MemoryStorageAdapter', () => {
  it('save and load', async () => {
    const adapter = new MemoryStorageAdapter();
    await adapter.save('key1', { data: 'hello' });
    expect(await adapter.load('key1')).toEqual({ data: 'hello' });
  });

  it('load returns null for missing key', async () => {
    const adapter = new MemoryStorageAdapter();
    expect(await adapter.load('missing')).toBeNull();
  });

  it('remove deletes key', async () => {
    const adapter = new MemoryStorageAdapter();
    await adapter.save('key1', 'value');
    await adapter.remove('key1');
    expect(await adapter.load('key1')).toBeNull();
  });

  it('clear removes all keys', async () => {
    const adapter = new MemoryStorageAdapter();
    await adapter.save('a', 1);
    await adapter.save('b', 2);
    await adapter.clear();
    expect(adapter.size).toBe(0);
  });

  it('deep clones data on save', async () => {
    const adapter = new MemoryStorageAdapter();
    const obj = { nested: { value: 1 } };
    await adapter.save('key', obj);
    obj.nested.value = 999;
    const loaded = (await adapter.load('key')) as any;
    expect(loaded.nested.value).toBe(1);
  });
});
