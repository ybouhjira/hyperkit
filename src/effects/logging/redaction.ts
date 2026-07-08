import { HashMap, type Logger } from 'effect';

const REDACTED = '[REDACTED]';

/**
 * Recursively redact values whose keys match any path in `lowerPaths`.
 */
function redactValue(value: unknown, lowerPaths: ReadonlySet<string>): unknown {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, lowerPaths));
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(record)) {
      result[key] = lowerPaths.has(key.toLowerCase()) ? REDACTED : redactValue(val, lowerPaths);
    }
    return result;
  }

  return value;
}

/**
 * Creates a transform that masks sensitive keys in annotations and message.
 * Key matching is case-insensitive. Nested objects are traversed recursively.
 */
export const redactOptions = (paths: ReadonlyArray<string>) => {
  const lowerPaths = new Set(paths.map((p) => p.toLowerCase()));

  return <M>(options: Logger.Logger.Options<M>): Logger.Logger.Options<M> => {
    // Redact annotations
    let annotations = options.annotations;
    for (const [key] of HashMap.entries(annotations)) {
      if (lowerPaths.has(key.toLowerCase())) {
        annotations = HashMap.set(annotations, key, REDACTED);
      }
    }

    // Redact message if it's an object
    const message = redactValue(options.message, lowerPaths) as M;

    return { ...options, annotations, message };
  };
};
