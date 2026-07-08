import { describe, it, expect, vi } from 'vitest';
import { Effect, Duration } from 'effect';
import { createEffectResource } from './createEffectResource';
import { createRoot } from 'solid-js';

describe('createEffectResource', () => {
  it('should resolve with data on success', async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const result = createEffectResource(() => Effect.succeed(42));

        // Give effect time to complete
        setTimeout(() => {
          expect(result.data()).toBe(42);
          expect(result.loading()).toBe(false);
          expect(result.error()).toBeUndefined();
          dispose();
          resolve();
        }, 50);
      });
    });
  });

  it('should set error on failure', async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const result = createEffectResource(() => Effect.fail('boom'));

        setTimeout(() => {
          expect(result.error()).toBe('boom');
          expect(result.data()).toBeUndefined();
          expect(result.loading()).toBe(false);
          dispose();
          resolve();
        }, 50);
      });
    });
  });

  it('should show loading initially', () => {
    createRoot((dispose) => {
      const result = createEffectResource(() =>
        Effect.sleep(Duration.seconds(1)).pipe(Effect.as(1))
      );
      expect(result.loading()).toBe(true);
      dispose();
    });
  });

  it('should call onSuccess callback', async () => {
    const onSuccess = vi.fn();
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        createEffectResource(() => Effect.succeed('hello'), { onSuccess });

        setTimeout(() => {
          expect(onSuccess).toHaveBeenCalledWith('hello');
          dispose();
          resolve();
        }, 50);
      });
    });
  });

  it('should call onError callback', async () => {
    const onError = vi.fn();
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        createEffectResource(() => Effect.fail('oops'), { onError });

        setTimeout(() => {
          expect(onError).toHaveBeenCalledWith('oops');
          dispose();
          resolve();
        }, 50);
      });
    });
  });
});
