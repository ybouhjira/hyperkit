import { describe, it, expect } from 'vitest';
import { Effect, Layer, Ref } from 'effect';
import { ClipboardService } from './ClipboardService';
import { ClipboardError } from './errors';

const makeTestClipboardService = Effect.gen(function* () {
  const clipboard = yield* Ref.make<string>('');

  return ClipboardService.of({
    copy: (text) =>
      Effect.gen(function* () {
        yield* Ref.set(clipboard, text);
      }),
    paste: Effect.gen(function* () {
      const text = yield* Ref.get(clipboard);
      if (text === '') {
        return yield* Effect.fail(new ClipboardError({ reason: 'Clipboard is empty' }));
      }
      return text;
    }),
  });
});

const TestClipboardServiceLayer = Layer.effect(ClipboardService, makeTestClipboardService);

describe('ClipboardService', () => {
  it('copy stores text', async () => {
    const program = Effect.gen(function* () {
      const clipboard = yield* ClipboardService;
      yield* clipboard.copy('Hello, World!');
      const text = yield* clipboard.paste;
      return text;
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(TestClipboardServiceLayer)));

    expect(result).toBe('Hello, World!');
  });

  it('paste retrieves text', async () => {
    const program = Effect.gen(function* () {
      const clipboard = yield* ClipboardService;
      yield* clipboard.copy('Test content');
      const text = yield* clipboard.paste;
      return text;
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(TestClipboardServiceLayer)));

    expect(result).toBe('Test content');
  });

  it('paste fails when empty', async () => {
    const program = Effect.gen(function* () {
      const clipboard = yield* ClipboardService;
      return yield* clipboard.paste;
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(TestClipboardServiceLayer), Effect.flip)
    );

    expect(result).toBeInstanceOf(ClipboardError);
    expect((result as ClipboardError).reason).toBe('Clipboard is empty');
  });
});
