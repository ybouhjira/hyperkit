import { Logger, LogLevel } from 'effect';
import type { LogTransportDef } from '../types';
import { SimpleTransport } from '../types';

export interface ConsoleTransportConfig {
  /** Output format. Default: 'pretty' */
  readonly format?: 'pretty' | 'json' | 'logfmt';

  /** Minimum log level to emit. Default: all levels. */
  readonly minLevel?: LogLevel.LogLevel;
}

/**
 * Console transport using Effect's built-in logger formatters.
 *
 * - `pretty`: Human-readable colored output (default)
 * - `json`: Structured JSON — ideal for log aggregators
 * - `logfmt`: Key=value format — compact, parseable
 */
export const ConsoleTransport = (config?: ConsoleTransportConfig): LogTransportDef => {
  const format = config?.format ?? 'pretty';

  let logger: Logger.Logger<unknown, unknown> =
    format === 'json'
      ? Logger.withConsoleLog(Logger.jsonLogger)
      : format === 'logfmt'
        ? Logger.withConsoleLog(Logger.logfmtLogger)
        : Logger.prettyLoggerDefault;

  if (config?.minLevel != null) {
    const minLevel = config.minLevel;
    logger = Logger.filterLogLevel(logger, (level) => LogLevel.greaterThanEqual(level, minLevel));
  }

  return SimpleTransport(logger);
};
