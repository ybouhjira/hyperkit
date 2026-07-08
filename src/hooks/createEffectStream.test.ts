import { describe, it, expect, vi } from 'vitest';
import { Effect, Stream, Schedule } from 'effect';
import { createEffectStream } from './createEffectStream';
import { createRoot } from 'solid-js';

describe('createEffectStream', () => {
  it('should collect stream items', async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const stream = Stream.make(1, 2, 3);
        const result = createEffectStream(stream);

        setTimeout(() => {
          expect(result.items()).toEqual([1, 2, 3]);
          expect(result.latest()).toBe(3);
          expect(result.active()).toBe(false); // stream completed
          dispose();
          resolve();
        }, 100);
      });
    });
  });

  it('should handle stream errors', async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const stream = Stream.fail('stream error');
        const result = createEffectStream(stream);

        setTimeout(() => {
          expect(result.error()).toBe('stream error');
          expect(result.active()).toBe(false);
          dispose();
          resolve();
        }, 50);
      });
    });
  });

  it('should call onItem callback', async () => {
    const onItem = vi.fn();
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const stream = Stream.make('a', 'b');
        createEffectStream(stream, { onItem });

        setTimeout(() => {
          expect(onItem).toHaveBeenCalledTimes(2);
          expect(onItem).toHaveBeenCalledWith('a');
          expect(onItem).toHaveBeenCalledWith('b');
          dispose();
          resolve();
        }, 100);
      });
    });
  });

  it('should stop stream on demand', async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        // Use a repeating stream
        const stream = Stream.fromEffect(Effect.succeed(1)).pipe(
          Stream.repeatWith(Schedule.spaced('100 millis'))
        );
        const result = createEffectStream(stream);

        expect(result.active()).toBe(true);
        result.stop();

        setTimeout(() => {
          expect(result.active()).toBe(false);
          dispose();
          resolve();
        }, 50);
      });
    });
  });
});
