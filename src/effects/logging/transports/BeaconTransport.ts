import { Effect, Logger, LogLevel, Ref, Scope } from 'effect';
import type { LogTransportDef } from '../types';
import { ScopedTransport } from '../types';

export interface BeaconTransportConfig {
  /** Endpoint URL for `navigator.sendBeacon()`. */
  readonly url: string;

  /** Minimum log level to buffer. Default: all levels. */
  readonly minLevel?: LogLevel.LogLevel;
}

/**
 * Beacon transport that buffers log entries and flushes via
 * `navigator.sendBeacon()` on `visibilitychange` (hidden) and `pagehide`.
 *
 * Designed for guaranteed delivery of critical logs when the user
 * navigates away or closes the tab. Uses `addFinalizer` for scope cleanup.
 *
 * SSR-safe: returns a no-op logger when `navigator.sendBeacon` is unavailable.
 */
export const BeaconTransport = (config: BeaconTransportConfig): LogTransportDef => {
  const effect: Effect.Effect<Logger.Logger<unknown, void>, never, Scope.Scope> = Effect.gen(
    function* () {
      // SSR guard
      if (typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') {
        return Logger.make(() => {});
      }

      const buffer = yield* Ref.make<Array<unknown>>([]);

      const flush = () => {
        const entries = Effect.runSync(Ref.getAndSet(buffer, []));
        if (entries.length === 0) return;
        const blob = new Blob([JSON.stringify(entries)], { type: 'application/json' });
        navigator.sendBeacon(config.url, blob);
      };

      const onVisibilityChange = () => {
        if (document.visibilityState === 'hidden') flush();
      };
      const onPageHide = () => flush();

      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', onVisibilityChange);
      }
      if (typeof window !== 'undefined') {
        window.addEventListener('pagehide', onPageHide);
      }

      // Cleanup on scope close
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          flush();
          if (typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', onVisibilityChange);
          }
          if (typeof window !== 'undefined') {
            window.removeEventListener('pagehide', onPageHide);
          }
        })
      );

      const logger = Logger.make<unknown, void>((options) => {
        if (config.minLevel && !LogLevel.greaterThanEqual(options.logLevel, config.minLevel)) {
          return;
        }

        const entry = {
          timestamp: options.date.toISOString(),
          level: options.logLevel._tag,
          message: options.message,
        };

        Effect.runSync(Ref.update(buffer, (buf) => [...buf, entry]));
      });

      return logger;
    }
  );

  return ScopedTransport(effect);
};
