import type { ActionMiddleware, DispatchResult } from '../NavigableRegistry';

export interface RateLimitRule {
  target: string; // '*' for wildcard
  action: string; // '*' for wildcard
  debounce?: number; // ms
  maxPerSecond?: number; // token bucket
}

export interface RateLimitMiddlewareOptions {
  rules: RateLimitRule[];
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
  maxTokens: number;
  refillRate: number; // tokens per ms
}

export function createRateLimitMiddleware(options: RateLimitMiddlewareOptions): ActionMiddleware {
  const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const debouncePending = new Map<string, { resolve: (r: DispatchResult) => void }>();
  /** Tracks keys where next() is currently awaiting — prevents concurrent in-flight calls */
  const debounceInFlight = new Set<string>();
  const buckets = new Map<string, TokenBucket>();

  function matchRule(rule: RateLimitRule, target: string, action: string): boolean {
    return (
      (rule.target === '*' || rule.target === target) &&
      (rule.action === '*' || rule.action === action)
    );
  }

  function getKey(target: string, action: string): string {
    return `${target}.${action}`;
  }

  function getBucket(key: string, maxPerSecond: number): TokenBucket {
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        tokens: maxPerSecond,
        lastRefill: performance.now(),
        maxTokens: maxPerSecond,
        refillRate: maxPerSecond / 1000,
      };
      buckets.set(key, bucket);
    }
    return bucket;
  }

  function tryConsume(bucket: TokenBucket): boolean {
    const now = performance.now();
    const elapsed = now - bucket.lastRefill;
    bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + elapsed * bucket.refillRate);
    bucket.lastRefill = now;
    if (bucket.tokens >= 1) {
      bucket.tokens--;
      return true;
    }
    return false;
  }

  return async (context, next): Promise<DispatchResult> => {
    const key = getKey(context.target, context.action);

    for (const rule of options.rules) {
      if (!matchRule(rule, context.target, context.action)) continue;

      // Rate limit check
      if (rule.maxPerSecond !== undefined) {
        const ruleKey = `rate:${rule.target}.${rule.action}`;
        const bucket = getBucket(ruleKey, rule.maxPerSecond);
        if (!tryConsume(bucket)) {
          return { ok: false, error: 'rate_limited' };
        }
      }

      // Debounce check
      if (rule.debounce !== undefined) {
        const debounceKey = `debounce:${key}`;
        // Cancel previous pending
        const prev = debouncePending.get(debounceKey);
        if (prev) {
          prev.resolve({ ok: false, error: 'debounced' });
        }
        const existing = debounceTimers.get(debounceKey);
        if (existing) clearTimeout(existing);

        return new Promise<DispatchResult>((resolve) => {
          debouncePending.set(debounceKey, { resolve });
          debounceTimers.set(
            debounceKey,
            setTimeout(
              () =>
                void (async () => {
                  // Guard: if another call is already in-flight for this key, skip
                  if (debounceInFlight.has(debounceKey)) {
                    resolve({ ok: false, error: 'debounced' });
                    return;
                  }

                  // Remove pending/timer entries now that we are about to execute,
                  // but only mark in-flight — do NOT allow new calls to sneak in
                  debounceTimers.delete(debounceKey);
                  debouncePending.delete(debounceKey);
                  debounceInFlight.add(debounceKey);

                  let result: DispatchResult;
                  try {
                    result = await next();
                  } finally {
                    // Release the in-flight lock only after next() fully resolves
                    debounceInFlight.delete(debounceKey);
                  }

                  resolve(result);
                })(),
              rule.debounce
            )
          );
        });
      }
    }

    return next();
  };
}
