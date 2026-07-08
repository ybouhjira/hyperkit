import type { JSX } from 'solid-js';

// ─── Anatomy Definition ─────────────────────────────────────────────────────

/** Defines the anatomy (parts) of a component */
export function defineAnatomy<T extends string>(
  name: string,
  parts: readonly T[]
): ComponentAnatomy<T> {
  return { name, parts };
}

export interface ComponentAnatomy<T extends string> {
  readonly name: string;
  readonly parts: readonly T[];
}

// ─── Part Configuration ─────────────────────────────────────────────────────

/** Configuration for a single part */
export interface PartConfig {
  /** Whether this part is enabled (default: true). When false, part doesn't render AND associated logic doesn't run */
  readonly enabled?: boolean;
  /** Additional CSS styles to apply to the part */
  readonly style?: JSX.CSSProperties;
  /** Additional CSS class name */
  readonly class?: string;
  /** Additional HTML attributes */
  readonly attrs?: Record<string, string>;
}

/** Parts configuration — map of part name to config. `false` is shorthand for { enabled: false } */
export type PartsConfig<T extends string> = {
  readonly [K in T]?: PartConfig | false;
};

// ─── Preset Definition ──────────────────────────────────────────────────────

/** A named bundle of parts configuration */
export interface ComponentPreset<T extends string> {
  readonly name: string;
  readonly description?: string;
  readonly parts: PartsConfig<T>;
}

/** Creates a named preset */
export function definePreset<T extends string>(
  name: string,
  parts: PartsConfig<T>,
  description?: string
): ComponentPreset<T> {
  return { name, parts, description };
}

// ─── Resolution ─────────────────────────────────────────────────────────────

/** Resolved state for a single part — always has concrete boolean `enabled` */
export interface ResolvedPart {
  readonly enabled: boolean;
  readonly style: JSX.CSSProperties;
  readonly class: string;
  readonly attrs: Record<string, string>;
}

/** Resolves parts config by merging preset defaults with user overrides */
export function resolveParts<T extends string>(
  anatomy: ComponentAnatomy<T>,
  preset?: ComponentPreset<T>,
  overrides?: PartsConfig<T>
): Record<T, ResolvedPart> {
  const result = {} as Record<T, ResolvedPart>;

  for (const part of anatomy.parts) {
    // Start with default (everything enabled, no styles)
    let config: PartConfig = { enabled: true };

    // Apply preset
    const presetConfig = preset?.parts[part];
    if (presetConfig === false) {
      config = { enabled: false };
    } else if (presetConfig) {
      config = { ...config, ...presetConfig };
    }

    // Apply user overrides (highest priority)
    const overrideConfig = overrides?.[part];
    if (overrideConfig === false) {
      config = { enabled: false };
    } else if (overrideConfig) {
      config = { ...config, ...overrideConfig };
    }

    result[part] = {
      enabled: config.enabled !== false,
      style: config.style ?? {},
      class: config.class ?? '',
      attrs: config.attrs ?? {},
    };
  }

  return result;
}

/** Helper: check if a part is enabled */
export function isPartEnabled<T extends string>(
  resolved: Record<T, ResolvedPart>,
  part: T
): boolean {
  return resolved[part]?.enabled ?? true;
}
