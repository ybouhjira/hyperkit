import { Cause, Effect, FiberId, Layer, Logger, LogLevel, PubSub, Ref, Stream } from 'effect';
import type { LoggingServiceConfig } from './types';
import { LoggingService } from './service';
import type { LogEntry } from './service';
import { enrichOptions } from './enrichment';
import { redactOptions } from './redaction';
import { shouldSample } from './sampling';

// ── Internal ────────────────────────────────────────────

const DEFAULT_MAX_HISTORY = 500;

function optionsToLogEntry(
  options: {
    readonly fiberId: FiberId.FiberId;
    readonly logLevel: LogLevel.LogLevel;
    readonly message: unknown;
    readonly cause: Cause.Cause<unknown>;
    readonly spans: Iterable<{ readonly label: string; readonly startTime: number }>;
    readonly annotations: Iterable<readonly [string, unknown]>;
    readonly date: Date;
  },
  id: number
): LogEntry {
  const now = options.date.getTime();

  const spans: Array<{ label: string; durationMs: number }> = [];
  for (const span of options.spans) {
    spans.push({ label: span.label, durationMs: now - span.startTime });
  }

  const annotations: Record<string, unknown> = {};
  for (const [key, value] of options.annotations) {
    annotations[key] = value;
  }

  const message = Array.isArray(options.message)
    ? options.message.length === 1
      ? options.message[0]
      : options.message
    : options.message;

  return {
    id: `log-${String(id).padStart(6, '0')}`,
    timestamp: options.date,
    level: options.logLevel._tag,
    message,
    fiberId: FiberId.threadName(options.fiberId),
    spans,
    annotations,
    cause: Cause.isEmpty(options.cause) ? undefined : Cause.pretty(options.cause),
  };
}

// ── Build Transform Pipeline ────────────────────────────

type OptionsTransform = <M>(options: Logger.Logger.Options<M>) => Logger.Logger.Options<M>;

function buildPipeline(config: LoggingServiceConfig): OptionsTransform | undefined {
  const transforms: Array<OptionsTransform> = [];

  if (config.context && Object.keys(config.context).length > 0) {
    transforms.push(enrichOptions(config.context));
  }

  if (config.redact && config.redact.length > 0) {
    transforms.push(redactOptions(config.redact));
  }

  if (transforms.length === 0) return undefined;
  const first = transforms[0];
  if (transforms.length === 1 && first) return first;

  return <M>(options: Logger.Logger.Options<M>): Logger.Logger.Options<M> =>
    transforms.reduce((opts, fn) => fn(opts), options);
}

// ── Apply Transform to Logger ───────────────────────────

function applyTransform<M, O>(
  logger: Logger.Logger<M, O>,
  transform: OptionsTransform | undefined
): Logger.Logger<M, O> {
  if (!transform) return logger;
  return Logger.mapInputOptions(logger, transform);
}

// ── Public API ──────────────────────────────────────────

/**
 * Creates a Layer that provides `LoggingService` with optional enrichment,
 * redaction, sampling, and external transports.
 *
 * Backward compatible: `makeLoggingLayer()` with no args produces exactly
 * the same behavior as the original implementation.
 */
export const makeLoggingLayer = (config?: LoggingServiceConfig): Layer.Layer<LoggingService> => {
  const maxHistory = config?.maxHistory ?? DEFAULT_MAX_HISTORY;
  const transform = config ? buildPipeline(config) : undefined;

  // Determine if external transports should be active (sampling)
  const externalActive = config?.sampling != null ? shouldSample(config.sampling.rate) : true;

  return Layer.unwrapEffect(
    Effect.gen(function* () {
      // ── Memory transport (always active) ────────────
      const pubsub = yield* PubSub.sliding<LogEntry>({ capacity: maxHistory });
      const history = yield* Ref.make<ReadonlyArray<LogEntry>>([]);
      const counter = yield* Ref.make(0);

      const memoryLogger = Logger.make<unknown, void>((options) => {
        const id = Effect.runSync(Ref.getAndUpdate(counter, (n) => n + 1));
        const entry = optionsToLogEntry(options, id);

        Effect.runSync(
          Effect.all([
            PubSub.publish(pubsub, entry),
            Ref.update(history, (h) => {
              const next = [...h, entry];
              return next.length > maxHistory ? next.slice(next.length - maxHistory) : next;
            }),
          ])
        );
      });

      const transformedMemoryLogger = applyTransform(memoryLogger, transform);

      const service: LoggingService = {
        stream: Stream.fromPubSub(pubsub),
        getHistory: Ref.get(history),
        clear: Ref.set(history, []),
      };

      // ── Base layer: service + memory logger ─────────
      let resultLayer: Layer.Layer<LoggingService> = Layer.merge(
        Layer.succeed(LoggingService, service),
        Logger.add(transformedMemoryLogger)
      );

      // ── External transports (if sampling passes) ────
      if (externalActive && config?.transports) {
        for (const transport of config.transports) {
          if (transport._tag === 'Simple') {
            const transformedLogger = applyTransform(transport.logger, transform);
            resultLayer = Layer.merge(resultLayer, Logger.add(transformedLogger));
          } else {
            const transformedEffect = Effect.map(transport.effect, (logger) =>
              applyTransform(logger, transform)
            );
            resultLayer = Layer.merge(resultLayer, Logger.addScoped(transformedEffect));
          }
        }
      }

      return resultLayer;
    })
  );
};
