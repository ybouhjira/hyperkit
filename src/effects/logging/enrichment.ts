import { HashMap, type Logger } from 'effect';

/**
 * Creates a transform that merges global context into log annotations.
 * Log-site annotations take precedence (no overwrite of existing keys).
 */
export const enrichOptions =
  (context: Readonly<Record<string, unknown>>) =>
  <M>(options: Logger.Logger.Options<M>): Logger.Logger.Options<M> => {
    let annotations = options.annotations;
    for (const [key, value] of Object.entries(context)) {
      if (!HashMap.has(annotations, key)) {
        annotations = HashMap.set(annotations, key, value);
      }
    }
    return { ...options, annotations };
  };
