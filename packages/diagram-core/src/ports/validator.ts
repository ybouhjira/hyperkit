import { Effect } from 'effect';
import type { Port, Graph, ConnectionValidator } from '../graph/types';
import { ValidationError } from '../errors';

/** Validates that port directions are compatible (east→west, south→north) */
export const directionValidator: ConnectionValidator = (source, target, _graph) => {
  const compatiblePairs: Record<string, string> = {
    east: 'west',
    west: 'east',
    south: 'north',
    north: 'south',
  };
  return Effect.succeed(compatiblePairs[source.direction] === target.direction);
};

/** Validates that port data types match (undefined = wildcard, matches anything) */
export const dataTypeValidator: ConnectionValidator = (source, target, _graph) => {
  if (!source.dataType || !target.dataType) return Effect.succeed(true);
  return Effect.succeed(source.dataType === target.dataType);
};

/** Validates that target port hasn't exceeded maxConnections */
export const maxConnectionsValidator: ConnectionValidator = (source, target, graph) => {
  if (target.maxConnections == null) return Effect.succeed(true);
  let count = 0;
  for (const edge of graph.edges.values()) {
    if (edge.targetPort === target.id) count++;
  }
  return Effect.succeed(count < target.maxConnections);
};

/** Validates that no duplicate connection exists between same source and target ports */
export const noDuplicateValidator: ConnectionValidator = (source, target, graph) => {
  for (const edge of graph.edges.values()) {
    if (edge.sourcePort === source.id && edge.targetPort === target.id) {
      return Effect.succeed(false);
    }
  }
  return Effect.succeed(true);
};

/** Compose multiple validators — all must pass for connection to be valid */
export const composeValidators = (validators: ReadonlyArray<ConnectionValidator>): ConnectionValidator => {
  return (source, target, graph) => {
    if (validators.length === 0) return Effect.succeed(true);
    let result: Effect.Effect<boolean, ValidationError> = Effect.succeed(true);
    for (const validator of validators) {
      result = Effect.flatMap(result, (passed) => {
        if (!passed) return Effect.succeed(false);
        return validator(source, target, graph);
      });
    }
    return result;
  };
};

/** Default validator: direction + dataType + maxConnections + noDuplicate */
export const defaultConnectionValidator: ConnectionValidator = composeValidators([
  directionValidator,
  dataTypeValidator,
  maxConnectionsValidator,
  noDuplicateValidator,
]);
