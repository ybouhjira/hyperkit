import rawData from '../../COMPONENTS.json';

// ── Types ─────────────────────────────────────────────────────────────────────

/** The component type tier — primitives are single-responsibility atoms,
 *  composites are higher-order components built from multiple primitives. */
export type ComponentType = 'primitive' | 'composite';

/** Export kind recorded per export in the component's barrel file. */
export type ExportKind = 'const' | 'interface' | 'type' | 'function';

/** Full metadata for a single SolidKit component as stored in COMPONENTS.json. */
export interface ComponentMetadata {
  /** PascalCase component name (e.g. "Button", "ChatWindow"). */
  readonly name: string;
  /** Source path relative to the repo root (e.g. "src/primitives/Button"). */
  readonly path: string;
  /** Tier in the component hierarchy. */
  readonly type: ComponentType;
  /** Human-readable description of the component's purpose. */
  readonly description: string;
  /** List of prop names accepted by the primary component in this directory. */
  readonly props: readonly string[];
  /** What each top-level export is — aligns positionally with the exports array. */
  readonly exports: readonly ExportKind[];
  /** Whether the component ships with a test file. */
  readonly hasTests: boolean;
  /** Whether the component ships with a stories file. */
  readonly hasStories: boolean;
  /** CSS custom properties (`--sk-*`) consumed by the component's stylesheet. */
  readonly cssTokens: readonly string[];
  /**
   * Variant prop map: keys are prop names, values are the accepted string literals.
   * Empty object when the component has no variant props.
   */
  readonly variants: Readonly<Record<string, readonly string[]>>;
}

// ── Internal data ─────────────────────────────────────────────────────────────

const components = rawData as ComponentMetadata[];

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Return all components from the registry.
 *
 * @returns A new array containing every `ComponentMetadata` entry.
 */
export function getAllComponents(): ComponentMetadata[] {
  return [...components];
}

/**
 * Look up a component by its exact PascalCase name.
 *
 * @param name - The exact component name, e.g. `"Button"` or `"ChatWindow"`.
 * @returns The matching `ComponentMetadata`, or `undefined` if not found.
 */
export function getComponent(name: string): ComponentMetadata | undefined {
  return components.find((c) => c.name === name);
}

/**
 * Filter components by their type tier.
 *
 * `getCategory('primitive')` returns all layout/input/display/feedback components.
 * `getCategory('composite')` returns chat, navigation, data, and utility components.
 *
 * @param category - Either `"primitive"` or `"composite"`.
 * @returns An array of matching components (may be empty for unknown values).
 */
export function getCategory(category: string): ComponentMetadata[] {
  return components.filter((c) => c.type === category);
}

/**
 * Fuzzy search across component names, descriptions, and category (type).
 *
 * The search is case-insensitive and matches any component where at least one
 * of the following fields contains the query as a substring:
 * - `name`
 * - `description`
 * - `type` (category)
 *
 * @param query - The search string. Whitespace-trimmed before matching.
 * @returns Components whose name, description, or type contain the query.
 */
export function searchComponents(query: string): ComponentMetadata[] {
  const normalised = query.trim().toLowerCase();
  if (normalised.length === 0) return [...components];

  return components.filter((c) => {
    const nameMatch = c.name.toLowerCase().includes(normalised);
    const descriptionMatch = c.description.toLowerCase().includes(normalised);
    const typeMatch = c.type.toLowerCase().includes(normalised);
    return nameMatch || descriptionMatch || typeMatch;
  });
}
