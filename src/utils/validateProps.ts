import { DEV } from 'solid-js';
import { logger } from './logger';

/** A single prop validation rule */
export interface PropRule {
  /** Prop is required (not null/undefined) */
  required?: boolean;
  /** Value must be one of these */
  oneOf?: readonly unknown[];
  /** typeof check */
  type?: 'string' | 'number' | 'boolean' | 'object' | 'function';
  /** Custom validator. Return error string or null/undefined if valid */
  validate?: (value: unknown, propName: string) => string | null | undefined;
}

/** Schema = map of prop name to rule */
export type PropSchema = Record<string, PropRule>;

/**
 * Validate component props at dev time. Zero-cost in production.
 * Logs console.warn for each violation.
 */
export function validateProps(componentName: string, props: object, schema: PropSchema): void {
  if (!DEV) return; // tree-shaken in production

  const record = props as Record<string, unknown>;
  for (const [key, rule] of Object.entries(schema)) {
    const value = record[key];

    if (rule.required && (value === undefined || value === null)) {
      logger.warn(`[SolidKit] ${componentName}: required prop "${key}" is missing`);
      continue; // skip further checks if missing
    }

    // Only validate further if value is provided
    if (value === undefined || value === null) continue;

    if (rule.oneOf && !rule.oneOf.includes(value)) {
      logger.warn(
        `[SolidKit] ${componentName}: prop "${key}" must be one of [${rule.oneOf.join(', ')}], got "${value}"`
      );
    }

    if (rule.type && typeof value !== rule.type) {
      logger.warn(
        `[SolidKit] ${componentName}: prop "${key}" expected ${rule.type}, got ${typeof value}`
      );
    }

    if (rule.validate) {
      const error = rule.validate(value, key);
      if (error) {
        logger.warn(`[SolidKit] ${componentName}: ${error}`);
      }
    }
  }
}
