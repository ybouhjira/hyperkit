import { createSignal, createEffect as solidCreateEffect, onCleanup } from 'solid-js';
import { Effect, Fiber } from 'effect';

export interface EffectResourceOptions<A, E> {
  /** Called when the effect succeeds */
  onSuccess?: (value: A) => void;
  /** Called when the effect fails */
  onError?: (error: E) => void;
}

export interface EffectResourceResult<A, E> {
  /** The current data (undefined while loading) */
  readonly data: () => A | undefined;
  /** The current error (undefined if no error) */
  readonly error: () => E | undefined;
  /** Whether the effect is currently running */
  readonly loading: () => boolean;
  /** Re-run the effect */
  readonly refetch: () => void;
}

/**
 * Bridges an Effect program to SolidJS reactive state.
 * Runs the effect and exposes data/error/loading signals.
 */
export function createEffectResource<A, E>(
  effectFn: () => Effect.Effect<A, E>,
  options?: EffectResourceOptions<A, E>
): EffectResourceResult<A, E> {
  const [data, setData] = createSignal<A | undefined>(undefined);
  const [error, setError] = createSignal<E | undefined>(undefined);
  const [loading, setLoading] = createSignal(true);
  let currentFiber: Fiber.RuntimeFiber<unknown, unknown> | null = null;

  const run = () => {
    // Cancel previous run
    if (currentFiber) {
      Effect.runFork(Fiber.interrupt(currentFiber));
      currentFiber = null;
    }

    setLoading(true);
    setError(undefined);

    const program = effectFn();
    currentFiber = Effect.runFork(
      Effect.matchEffect(program, {
        onFailure: (err) =>
          Effect.sync(() => {
            setError(() => err);
            setLoading(false);
            options?.onError?.(err);
          }),
        onSuccess: (value) =>
          Effect.sync(() => {
            setData(() => value);
            setLoading(false);
            options?.onSuccess?.(value);
          }),
      })
    );
  };

  // Run on mount
  solidCreateEffect(() => {
    run();
  });

  // Cleanup on unmount
  onCleanup(() => {
    if (currentFiber) {
      Effect.runFork(Fiber.interrupt(currentFiber));
    }
  });

  return {
    data: data as () => A | undefined,
    error: error as () => E | undefined,
    loading,
    refetch: run,
  };
}
