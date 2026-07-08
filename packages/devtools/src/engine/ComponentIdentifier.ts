import type { InspectedComponent } from '../context/types';
import { COMPONENT_MAP } from './component-map.generated';

/**
 * Complete map of sk-* block class → HyperKit component name.
 * Generated from the HyperKit source CSS — see scripts/generate-component-map.mjs.
 */
const COMPONENT_NAMES: Readonly<Record<string, string>> = COMPONENT_MAP;

/** Known size modifier values */
const SIZE_VALUES = new Set(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']);

/** Known variant modifier values */
const VARIANT_VALUES = new Set([
  'primary', 'secondary', 'ghost', 'outline', 'outlined', 'link', 'danger', 'destructive',
  'default', 'subtle', 'filled', 'elevated', 'flat',
  'success', 'warning', 'error', 'info',
]);

/** Known state modifier values (interaction / lifecycle states, not visual variants) */
const STATE_VALUES = new Set([
  'active', 'inactive', 'open', 'closed', 'selected', 'checked', 'unchecked',
  'disabled', 'loading', 'dragging', 'drag-over', 'collapsed', 'expanded',
  'focused', 'hover', 'pressed', 'visible', 'hidden', 'current', 'empty',
  'invalid', 'readonly', 'indeterminate', 'pinned', 'dirty', 'sticky',
]);

/** A BEM element part extracted from a class like `sk-card__header`. */
export interface BemElementPart {
  /** Element name, e.g. "header" */
  name: string;
  /** Full source class, e.g. "sk-card__header" */
  raw: string;
}

/** A BEM modifier part extracted from a class like `sk-card--outlined`. */
export interface BemModifierPart {
  /** Modifier value, e.g. "outlined" or "sm" */
  name: string;
  /** Semantic classification of the modifier */
  kind: 'variant' | 'size' | 'state' | 'other';
  /** Full source class, e.g. "sk-card--outlined" */
  raw: string;
}

/** Structured BEM breakdown of an element's class list. */
export interface BemDescription {
  /** The BEM block class, e.g. "sk-card" — null when no sk-* class exists */
  block: string | null;
  /** HyperKit component name for the block, e.g. "Card" */
  name: string | null;
  /** True when the block resolves through the generated component map */
  isKnown: boolean;
  /** BEM elements (parts), e.g. sk-card__header → "header" */
  elements: BemElementPart[];
  /** BEM modifiers, e.g. sk-card--outlined → variant "outlined" */
  modifiers: BemModifierPart[];
  /** Non-HyperKit (non sk-*) classes on the element */
  others: string[];
}

/**
 * Break a class list into its BEM parts: block (→ component name),
 * elements, and classified modifiers. This is the framework-aware view of
 * what an element's classes mean in HyperKit terms.
 */
export function describeBem(classes: string[]): BemDescription {
  const skClasses = classes.filter((c) => c.startsWith('sk-'));
  const others = classes.filter((c) => !c.startsWith('sk-'));
  const block = findBlockClass(skClasses);

  const elements: BemElementPart[] = [];
  const modifiers: BemModifierPart[] = [];
  const seenElements = new Set<string>();
  const seenModifiers = new Set<string>();

  for (const cls of skClasses) {
    const elementIdx = cls.indexOf('__');
    const modifierIdx = cls.indexOf('--');

    if (modifierIdx !== -1) {
      const name = cls.slice(modifierIdx + 2);
      if (name && !seenModifiers.has(cls)) {
        seenModifiers.add(cls);
        modifiers.push({ name, kind: classifyModifier(name), raw: cls });
      }
    }

    if (elementIdx !== -1) {
      const afterElement = cls.slice(elementIdx + 2);
      const name = afterElement.split('--')[0]!;
      if (name && !seenElements.has(name)) {
        seenElements.add(name);
        elements.push({ name, raw: cls });
      }
    }
  }

  return {
    block,
    name: block ? (COMPONENT_NAMES[block] ?? formatClassName(block)) : null,
    isKnown: block !== null && block in COMPONENT_NAMES,
    elements,
    modifiers,
    others,
  };
}

function classifyModifier(name: string): BemModifierPart['kind'] {
  if (SIZE_VALUES.has(name)) return 'size';
  if (VARIANT_VALUES.has(name)) return 'variant';
  if (STATE_VALUES.has(name)) return 'state';
  return 'other';
}

/**
 * Identify a SolidKit component from a DOM element's CSS classes.
 * Returns null if the element has no sk-* classes.
 */
export function identifyComponent(element: HTMLElement): InspectedComponent | null {
  const classes = Array.from(element.classList);
  const skClasses = classes.filter(c => c.startsWith('sk-'));

  if (skClasses.length === 0) return null;

  // Find the block class (no -- or __ in it). findBlockClass always resolves
  // a block for a non-empty sk-* class list: every sk-* class is either a
  // plain block or carries a __/-- separator the block is derived from.
  const blockClass = findBlockClass(skClasses)!;

  const name = COMPONENT_NAMES[blockClass] ?? formatClassName(blockClass);
  const variant = findModifier(skClasses, blockClass, VARIANT_VALUES);
  const size = findModifier(skClasses, blockClass, SIZE_VALUES);
  const subPart = findSubPart(skClasses);
  const parentComponent = findParentComponent(element);

  return {
    name,
    element,
    classes: skClasses,
    variant,
    size,
    subPart,
    parentComponent,
  };
}

/**
 * Find the BEM block class from a list of sk-* classes.
 * The block class has no __ (element separator) and no -- (modifier separator).
 */
function findBlockClass(skClasses: string[]): string | null {
  // First try: find a class that is a known component
  for (const cls of skClasses) {
    if (!cls.includes('__') && !cls.includes('--') && COMPONENT_NAMES[cls]) {
      return cls;
    }
  }
  // Fallback: find any block class (no __ or --)
  for (const cls of skClasses) {
    if (!cls.includes('__') && !cls.includes('--')) {
      return cls;
    }
  }
  // Only element/modifier classes remain (plain blocks returned above) —
  // derive the block from the first one's prefix.
  for (const cls of skClasses) {
    if (cls.includes('__')) {
      return cls.split('__')[0]!;
    }
    return cls.split('--')[0]!;
  }
  return null;
}

/**
 * Find a BEM modifier value from a specific set of known values.
 */
function findModifier(
  skClasses: string[],
  blockClass: string,
  knownValues: Set<string>,
): string | null {
  const prefix = blockClass + '--';
  for (const cls of skClasses) {
    if (cls.startsWith(prefix)) {
      const value = cls.slice(prefix.length);
      if (knownValues.has(value)) return value;
    }
  }
  return null;
}

/**
 * Find BEM element (sub-part) from classes like sk-card__header.
 */
function findSubPart(skClasses: string[]): string | null {
  for (const cls of skClasses) {
    if (cls.includes('__')) {
      const parts = cls.split('__');
      if (parts[1]) return parts[1].split('--')[0]!;
    }
  }
  return null;
}

/**
 * Walk up the DOM to find the nearest parent SolidKit component.
 */
function findParentComponent(element: HTMLElement): string | null {
  let parent = element.parentElement;
  while (parent) {
    const classes = Array.from(parent.classList);
    const blockClass = findBlockClass(classes.filter(c => c.startsWith('sk-')));
    if (blockClass) {
      return COMPONENT_NAMES[blockClass] ?? formatClassName(blockClass);
    }
    parent = parent.parentElement;
  }
  return null;
}

/**
 * Format a sk-* class name into a readable component name.
 * E.g., "sk-tag-input" → "TagInput"
 */
function formatClassName(cls: string): string {
  return cls
    .replace(/^sk-/, '')
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Check if a DOM element is a SolidKit component.
 */
export function isSolidKitElement(element: Element): boolean {
  return Array.from(element.classList).some(c => c.startsWith('sk-'));
}

/**
 * Get a display label for a component: "Button (primary, md)" or "Card > header"
 */
export function getComponentLabel(info: InspectedComponent): string {
  const parts: string[] = [];
  if (info.subPart) {
    // It's a sub-element
    const parentName = info.classes
      .filter(c => c.includes('__'))
      .map(c => COMPONENT_NAMES[c.split('__')[0]!] ?? formatClassName(c.split('__')[0]!))
      [0] ?? info.name;
    return `${parentName} > ${info.subPart}`;
  }
  parts.push(info.name);
  const modifiers: string[] = [];
  if (info.variant) modifiers.push(info.variant);
  if (info.size) modifiers.push(info.size);
  if (modifiers.length > 0) {
    parts.push(`(${modifiers.join(', ')})`);
  }
  return parts.join(' ');
}

/**
 * Get all registered component block names.
 */
export function getRegisteredComponents(): Record<string, string> {
  return { ...COMPONENT_NAMES };
}
