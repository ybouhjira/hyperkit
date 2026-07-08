import { createSignal, Accessor } from 'solid-js';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UseRemoteActionOptions {
  /** Endpoint to POST to */
  url: string;

  /** Called with the parsed response body on every successful execution */
  onSuccess?: (result: unknown) => void;

  /** Called with the thrown Error on every failed execution */
  onError?: (error: Error) => void;
}

export interface UseRemoteActionReturn {
  /** Execute the action — POSTs `payload` as JSON, returns the parsed response */
  execute: (payload?: Record<string, unknown>) => Promise<unknown>;

  /** True while the most-recent execution is in-flight */
  executing: Accessor<boolean>;

  /** Error from the most-recent failed execution, or null */
  error: Accessor<Error | null>;

  /** Parsed response body from the most-recent successful execution, or undefined */
  result: Accessor<unknown>;
}

// ── Implementation ────────────────────────────────────────────────────────────

/**
 * Imperative hook for posting JSON actions to a server endpoint.
 *
 * Maintains reactive `executing`, `error`, and `result` signals so the
 * calling component can reflect the action lifecycle in the UI without
 * manually managing loading state.
 *
 * @example
 * ```tsx
 * const { execute, executing, error } = useRemoteAction({
 *   url: '/api/send-email',
 *   onSuccess: () => toast.success('Sent!'),
 *   onError: (err) => toast.error(err.message),
 * });
 *
 * <Button disabled={executing()} onClick={() => execute({ to: 'a@b.com' })}>
 *   Send
 * </Button>
 * ```
 */
export function useRemoteAction(options: UseRemoteActionOptions): UseRemoteActionReturn {
  const { url, onSuccess, onError } = options;

  const [executing, setExecuting] = createSignal(false);
  const [error, setError] = createSignal<Error | null>(null);
  const [result, setResult] = createSignal<unknown>(undefined);

  async function execute(payload?: Record<string, unknown>): Promise<unknown> {
    setExecuting(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload !== undefined ? JSON.stringify(payload) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      // Gracefully handle non-JSON responses (e.g. 204 No Content).
      let parsed: unknown = undefined;
      const contentType = response.headers.get('Content-Type') ?? '';
      if (contentType.includes('application/json')) {
        parsed = await response.json();
      }

      setResult(() => parsed);
      onSuccess?.(parsed);
      return parsed;
    } catch (err: unknown) {
      const wrapped = err instanceof Error ? err : new Error(String(err));
      setError(wrapped);
      onError?.(wrapped);
      throw wrapped;
    } finally {
      setExecuting(false);
    }
  }

  return { execute, executing, error, result };
}
