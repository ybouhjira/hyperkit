import { Effect } from 'effect';
import { composeValidators, directionValidator, maxConnectionsValidator, noDuplicateValidator } from '@ybouhjira/diagram-core';
import type { ConnectionValidator } from '@ybouhjira/diagram-core';
import type { TypeCompatibilityMap } from './types.js';

/**
 * Creates a ConnectionValidator from an optional TypeCompatibilityMap.
 *
 * Rules:
 * - If no map: allow same types OR when either is undefined (wildcard)
 * - If map: check if source type is in compatibility[targetType]
 * - '*' in source list means accept anything
 * - 'any' as target type means accept anything
 */
export function createTypeValidator(compatibility?: TypeCompatibilityMap): ConnectionValidator {
  const typeCompatibilityValidator: ConnectionValidator = (source, target, _graph) => {
    const sourceType = source.dataType;
    const targetType = target.dataType;

    // If no types defined, allow connection
    if (!sourceType || !targetType) return Effect.succeed(true);

    if (!compatibility) {
      // Default: allow when types are equal
      return Effect.succeed(sourceType === targetType);
    }

    // Check 'any' target accepts everything
    const anyCompatible = compatibility['any'];
    if (anyCompatible && (anyCompatible.includes('*') || anyCompatible.includes(sourceType))) {
      return Effect.succeed(true);
    }

    // Check specific target type compatibility
    const compatible = compatibility[targetType];
    if (!compatible) return Effect.succeed(false);

    // '*' wildcard accepts anything
    if (compatible.includes('*')) return Effect.succeed(true);

    return Effect.succeed(compatible.includes(sourceType));
  };

  return composeValidators([
    directionValidator,
    typeCompatibilityValidator,
    maxConnectionsValidator,
    noDuplicateValidator,
  ]);
}
