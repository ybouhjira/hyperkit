import { createSignal, onCleanup } from 'solid-js';
import { Effect, Stream, Fiber } from 'effect';

export interface EffectStreamOptions<A, E> {
  onItem?: (item: A) => void;
  onError?: (error: E) => void;
  onComplete?: () => void;
}

export interface EffectStreamResult<A, E> {
  /** All items received so far */
  readonly items: () => ReadonlyArray<A>;
  /** The latest item */
  readonly latest: () => A | undefined;
  /** Current error if any */
  readonly error: () => E | undefined;
  /** Whether the stream is still active */
  readonly active: () => boolean;
  /** Stop the stream */
  readonly stop: () => void;
}

export function createEffectStream<A, E>(
  stream: Stream.Stream<A, E>,
  options?: EffectStreamOptions<A, E>
): EffectStreamResult<A, E> {
  const [items, setItems] = createSignal<ReadonlyArray<A>>([]);
  const [latest, setLatest] = createSignal<A | undefined>(undefined);
  const [error, setError] = createSignal<E | undefined>(undefined);
  const [active, setActive] = createSignal(true);

  const fiber = Effect.runFork(
    stream.pipe(
      Stream.tap((item) =>
        Effect.sync(() => {
          setItems((prev) => [...prev, item]);
          setLatest(() => item);
          options?.onItem?.(item);
        })
      ),
      Stream.runDrain,
      Effect.tap(() =>
        Effect.sync(() => {
          setActive(false);
          options?.onComplete?.();
        })
      ),
      Effect.catchAll((err) =>
        Effect.sync(() => {
          setError(() => err);
          setActive(false);
          options?.onError?.(err);
        })
      )
    )
  );

  const stop = () => {
    Effect.runFork(Fiber.interrupt(fiber));
    setActive(false);
  };

  onCleanup(stop);

  return {
    items: items as () => ReadonlyArray<A>,
    latest: latest as () => A | undefined,
    error: error as () => E | undefined,
    active,
    stop,
  };
}
