import { describe, it, expect } from 'vitest';
import { Effect, Layer } from 'effect';
import { FileSystemService, type FileEntry } from './FileSystemService';
import { DirectoryNotFoundError } from './errors';

const makeTestFileSystemService = Effect.sync(() => {
  const files = new Map<string, FileEntry[]>([
    [
      '/home',
      [
        { name: 'docs', path: '/home/docs', isDirectory: true },
        { name: 'file.txt', path: '/home/file.txt', isDirectory: false, size: 100 },
      ],
    ],
    [
      '/home/docs',
      [{ name: 'readme.md', path: '/home/docs/readme.md', isDirectory: false, size: 50 }],
    ],
  ]);

  return FileSystemService.of({
    listDirectory: (path) =>
      Effect.gen(function* () {
        const entries = files.get(path);
        if (!entries) {
          return yield* Effect.fail(new DirectoryNotFoundError({ path }));
        }
        return entries;
      }),
    getParentDirectory: (path) => Effect.succeed(path.split('/').slice(0, -1).join('/') || '/'),
    isDirectory: (path) => Effect.succeed(files.has(path)),
  });
});

const TestFileSystemServiceLayer = Layer.effect(FileSystemService, makeTestFileSystemService);

describe('FileSystemService', () => {
  it('listDirectory returns entries for valid path', async () => {
    const program = Effect.gen(function* () {
      const fs = yield* FileSystemService;
      const entries = yield* fs.listDirectory('/home');
      return entries;
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(TestFileSystemServiceLayer))
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: 'docs',
      path: '/home/docs',
      isDirectory: true,
    });
    expect(result[1]).toEqual({
      name: 'file.txt',
      path: '/home/file.txt',
      isDirectory: false,
      size: 100,
    });
  });

  it('listDirectory fails for non-existent path', async () => {
    const program = Effect.gen(function* () {
      const fs = yield* FileSystemService;
      return yield* fs.listDirectory('/nonexistent');
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(TestFileSystemServiceLayer), Effect.flip)
    );

    expect(result).toBeInstanceOf(DirectoryNotFoundError);
    expect((result as DirectoryNotFoundError).path).toBe('/nonexistent');
  });

  it('getParentDirectory returns parent path', async () => {
    const program = Effect.gen(function* () {
      const fs = yield* FileSystemService;
      const parent1 = yield* fs.getParentDirectory('/home/docs');
      const parent2 = yield* fs.getParentDirectory('/home');
      return { parent1, parent2 };
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(TestFileSystemServiceLayer))
    );

    expect(result.parent1).toBe('/home');
    expect(result.parent2).toBe('/');
  });

  it('isDirectory returns correct boolean', async () => {
    const program = Effect.gen(function* () {
      const fs = yield* FileSystemService;
      const isDir1 = yield* fs.isDirectory('/home');
      const isDir2 = yield* fs.isDirectory('/home/docs');
      const isDir3 = yield* fs.isDirectory('/nonexistent');
      return { isDir1, isDir2, isDir3 };
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(TestFileSystemServiceLayer))
    );

    expect(result.isDir1).toBe(true);
    expect(result.isDir2).toBe(true);
    expect(result.isDir3).toBe(false);
  });
});
