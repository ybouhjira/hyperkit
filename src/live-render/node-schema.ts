// DEV-ONLY. See packages/ai-renderer/SECURITY.md before exposing beyond 127.0.0.1.

import { Schema as S, Effect, Data } from 'effect';

// ── Error type ────────────────────────────────────────────────────────────────

export class LiveRenderError extends Data.TaggedError('LiveRenderError')<{
  readonly reason: string;
}> {}

// ── Forbidden key guard ───────────────────────────────────────────────────────

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function hasForbiddenKey(obj: Record<string, unknown>): boolean {
  for (const key of Object.keys(obj)) {
    if (FORBIDDEN_KEYS.has(key)) return true;
  }
  return false;
}

// ── Schema ────────────────────────────────────────────────────────────────────

/**
 * UINode schema: a string leaf or an object node.
 * Depth + node-count limits are enforced in validateUINode, not the schema,
 * because Effect Schema doesn't expose recursive counters directly.
 */
export type UINode =
  string | { component: string; props?: Record<string, unknown>; children?: UINode[] };

// We accept `unknown` at the schema boundary and validate manually to keep
// full control over depth/count/key restrictions.

const MAX_DEPTH = 20;
const MAX_NODES = 500;
const MAX_STRING_LEN = 10_000;

function validateNode(input: unknown, depth: number, counter: { count: number }): UINode {
  if (typeof input === 'string') {
    if (input.length > MAX_STRING_LEN) {
      throw new LiveRenderError({
        reason: `String value exceeds max length ${MAX_STRING_LEN}`,
      });
    }
    counter.count += 1;
    if (counter.count > MAX_NODES) {
      throw new LiveRenderError({ reason: `Tree exceeds max node count ${MAX_NODES}` });
    }
    return input;
  }

  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new LiveRenderError({
      reason: `UINode must be a string or object, got ${Array.isArray(input) ? 'array' : String(input === null ? 'null' : typeof input)}`,
    });
  }

  if (depth > MAX_DEPTH) {
    throw new LiveRenderError({ reason: `Tree exceeds max depth ${MAX_DEPTH}` });
  }

  counter.count += 1;
  if (counter.count > MAX_NODES) {
    throw new LiveRenderError({ reason: `Tree exceeds max node count ${MAX_NODES}` });
  }

  const obj = input as Record<string, unknown>;

  if (hasForbiddenKey(obj)) {
    throw new LiveRenderError({
      reason: 'Forbidden key detected (__proto__, constructor, or prototype)',
    });
  }

  if (typeof obj['component'] !== 'string' || obj['component'].length === 0) {
    throw new LiveRenderError({
      reason: 'UINode object must have a non-empty string "component" field',
    });
  }

  const component = obj['component'] as string;

  let props: Record<string, unknown> | undefined;
  if (obj['props'] !== undefined) {
    if (obj['props'] === null || typeof obj['props'] !== 'object' || Array.isArray(obj['props'])) {
      throw new LiveRenderError({ reason: '"props" must be a plain object' });
    }
    const propsObj = obj['props'] as Record<string, unknown>;
    if (hasForbiddenKey(propsObj)) {
      throw new LiveRenderError({
        reason: 'Forbidden key detected in props (__proto__, constructor, or prototype)',
      });
    }
    // Validate prop value string lengths
    for (const [k, v] of Object.entries(propsObj)) {
      if (typeof v === 'string' && v.length > MAX_STRING_LEN) {
        throw new LiveRenderError({
          reason: `Prop "${k}" string value exceeds max length ${MAX_STRING_LEN}`,
        });
      }
    }
    props = propsObj;
  }

  let children: UINode[] | undefined;
  if (obj['children'] !== undefined) {
    if (!Array.isArray(obj['children'])) {
      // Allow a single UINode as children (string)
      children = [validateNode(obj['children'], depth + 1, counter)];
    } else {
      children = (obj['children'] as unknown[]).map((child) =>
        validateNode(child, depth + 1, counter)
      );
    }
  }

  return {
    component,
    ...(props !== undefined ? { props } : {}),
    ...(children !== undefined ? { children } : {}),
  };
}

/**
 * Validate an unknown input as a UINode tree.
 * Enforces: max depth 20, max total nodes 500, max string length 10000,
 * and rejects __proto__ / constructor / prototype at any level.
 */
export function validateUINode(input: unknown): Effect.Effect<UINode, LiveRenderError> {
  return Effect.try({
    try: () => {
      const counter = { count: 0 };
      return validateNode(input, 1, counter);
    },
    catch: (err) => {
      if (err instanceof LiveRenderError) return err;
      return new LiveRenderError({ reason: String(err) });
    },
  });
}

// Re-export the S namespace to allow callers to reference the schema
export { S };
