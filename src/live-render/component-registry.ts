// DEV-ONLY. See packages/ai-renderer/SECURITY.md before exposing beyond 127.0.0.1.

import type { Component } from 'solid-js';
// Dynamic import of the entire public barrel — iterate its named exports.
// Only keep function/class values (i.e. actual components, not strings / objects).
//
// IMPORTANT: this module is re-exported from the same barrel it imports, which
// creates a circular dependency. Building the registry at module-init time
// evaluates Object.entries() before the namespace is populated and crashes
// with "Cannot convert undefined or null to object" in consumer bundles.
// The registry is therefore built lazily on first access.
import * as HyperKit from '../index.js';

let REGISTRY: ReadonlyMap<string, Component> | null = null;

function getRegistry(): ReadonlyMap<string, Component> {
  if (REGISTRY) return REGISTRY;
  const map = new Map<string, Component>();
  // The namespace import is always defined; circular-init shows up as
  // missing per-export keys, which the typeof === 'function' filter handles.
  const entries = Object.entries(HyperKit);
  for (const [name, value] of entries) {
    if (typeof value === 'function') {
      // SolidJS components are plain functions; class components have .prototype.
      map.set(name, value as Component);
    }
  }
  REGISTRY = map;
  return map;
}

/**
 * Lookup a component by its exported name.
 * Returns null for unknown or non-function exports.
 */
export function getComponent(name: string): Component | null {
  return getRegistry().get(name) ?? null;
}

/**
 * List all registered component names (for debugging / explorers).
 */
export function listComponents(): string[] {
  return Array.from(getRegistry().keys());
}
