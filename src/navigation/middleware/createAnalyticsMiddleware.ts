import type { ActionMiddleware } from '../NavigableRegistry';

export interface AnalyticsMetrics {
  totalActions: number;
  actionCounts: Record<string, number>;
  averageDuration: Record<string, number>;
  errorRates: Record<string, number>;
  topActions: Array<{ target: string; action: string; count: number }>;
}

export interface AnalyticsMiddlewareOptions {
  onFlush?: (metrics: AnalyticsMetrics) => void;
  flushInterval?: number;
}

interface ActionStats {
  count: number;
  totalDuration: number;
  errors: number;
}

export interface AnalyticsMiddlewareHandle {
  middleware: ActionMiddleware;
  getMetrics(): AnalyticsMetrics;
  flush(): void;
  dispose(): void;
}

export function createAnalyticsMiddleware(
  options: AnalyticsMiddlewareOptions = {}
): AnalyticsMiddlewareHandle {
  const { onFlush, flushInterval = 30_000 } = options;
  const stats = new Map<string, ActionStats>();
  let totalActions = 0;
  let flushTimer: ReturnType<typeof setInterval> | null = null;

  if (onFlush && flushInterval > 0) {
    flushTimer = setInterval(() => flush(), flushInterval);
  }

  function getKey(target: string, action: string): string {
    return `${target}.${action}`;
  }

  function getMetrics(): AnalyticsMetrics {
    const actionCounts: Record<string, number> = {};
    const averageDuration: Record<string, number> = {};
    const errorRates: Record<string, number> = {};
    const topActions: Array<{ target: string; action: string; count: number }> = [];

    for (const [key, stat] of stats) {
      actionCounts[key] = stat.count;
      averageDuration[key] = stat.count > 0 ? stat.totalDuration / stat.count : 0;
      errorRates[key] = stat.count > 0 ? stat.errors / stat.count : 0;
      const dotIndex = key.indexOf('.');
      const target = dotIndex >= 0 ? key.slice(0, dotIndex) : key;
      const action = dotIndex >= 0 ? key.slice(dotIndex + 1) : '';
      topActions.push({ target, action, count: stat.count });
    }

    topActions.sort((a, b) => b.count - a.count);

    return { totalActions, actionCounts, averageDuration, errorRates, topActions };
  }

  function flush(): void {
    if (onFlush) onFlush(getMetrics());
  }

  function dispose(): void {
    if (flushTimer) clearInterval(flushTimer);
  }

  const middleware: ActionMiddleware = async (context, next) => {
    const key = getKey(context.target, context.action);
    const startTime = performance.now();
    const result = await next();
    const duration = performance.now() - startTime;

    totalActions++;
    let stat = stats.get(key);
    if (!stat) {
      stat = { count: 0, totalDuration: 0, errors: 0 };
      stats.set(key, stat);
    }
    stat.count++;
    stat.totalDuration += duration;
    if (!result.ok) stat.errors++;

    return result;
  };

  return { middleware, getMetrics, flush, dispose };
}
