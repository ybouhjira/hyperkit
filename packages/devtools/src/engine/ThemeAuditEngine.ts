import { parseCssValue, extractVarNames, containsVar } from './css-parser';
import { getRawStyles } from './StylesheetMatcher';
import type { CssValue } from '../context/types';

/**
 * ThemeAuditEngine — classifies every visual CSS property of an element as
 * on-theme (resolves through a --sk-* token), off-theme (hardcoded literal),
 * tiny-text (font-size below the 12px readability floor) or default
 * (browser default / absence of styling — not a theme signal either way).
 */

/** Classification result for a single audited property. */
export type ThemeAuditStatus = 'on-theme' | 'off-theme' | 'tiny-text' | 'default';

export interface ThemeAuditRow {
  /** CSS property name, e.g. "background-color" */
  property: string;
  /** Computed value from getComputedStyle */
  computedValue: string;
  /** Raw declared value (stylesheet/inline) when one exists, else null */
  rawValue: string | null;
  status: ThemeAuditStatus;
  /** Matched --sk-* token name when the value resolves through the theme */
  token: string | null;
  /** Human-readable note (e.g. tiny-text explanation) */
  note: string | null;
}

export interface ThemeAuditSummary {
  onTheme: number;
  offTheme: number;
  tinyText: number;
  defaults: number;
  total: number;
}

export type PropertyKind = 'color' | 'length' | 'font-size' | 'font-weight' | 'radius' | 'shadow';

export interface AuditedProperty {
  name: string;
  kind: PropertyKind;
  /** Shorthand properties that can set this longhand */
  shorthands: string[];
}

/** The readability floor for font-size (px). Anything smaller is flagged. */
export const READABILITY_FLOOR_PX = 12;

const BORDER_SIDES = ['top', 'right', 'bottom', 'left'] as const;
const BOX_SIDES = ['top', 'right', 'bottom', 'left'] as const;

/** The set of visual properties the audit inspects, in display order. */
export const AUDITED_PROPERTIES: readonly AuditedProperty[] = [
  { name: 'color', kind: 'color', shorthands: [] },
  { name: 'background-color', kind: 'color', shorthands: ['background'] },
  ...BORDER_SIDES.map((side) => ({
    name: `border-${side}-color`,
    kind: 'color' as const,
    shorthands: ['border-color', `border-${side}`, 'border'],
  })),
  ...BORDER_SIDES.map((side) => ({
    name: `border-${side}-width`,
    kind: 'length' as const,
    shorthands: ['border-width', `border-${side}`, 'border'],
  })),
  { name: 'font-size', kind: 'font-size', shorthands: ['font'] },
  { name: 'font-weight', kind: 'font-weight', shorthands: ['font'] },
  ...BOX_SIDES.map((side) => ({
    name: `padding-${side}`,
    kind: 'length' as const,
    shorthands: ['padding'],
  })),
  ...BOX_SIDES.map((side) => ({
    name: `margin-${side}`,
    kind: 'length' as const,
    shorthands: ['margin'],
  })),
  { name: 'gap', kind: 'length', shorthands: [] },
  { name: 'row-gap', kind: 'length', shorthands: ['gap'] },
  { name: 'column-gap', kind: 'length', shorthands: ['gap'] },
  { name: 'border-radius', kind: 'radius', shorthands: [] },
  { name: 'box-shadow', kind: 'shadow', shorthands: [] },
  { name: 'outline-color', kind: 'color', shorthands: ['outline'] },
];

/** Values that mean "no styling applied" — neither on- nor off-theme. */
const NEUTRAL_VALUES = new Set([
  '',
  'none',
  'normal',
  'auto',
  '0',
  '0px',
  'transparent',
  'rgba(0, 0, 0, 0)',
  'currentcolor',
  'initial',
  'inherit',
  'unset',
]);

/** Browser defaults that only count as neutral when nothing declared them. */
const IMPLICIT_DEFAULTS: Record<string, readonly string[]> = {
  'font-weight': ['400', 'normal'],
};

/** Token-name hints used to pick the most relevant token on value collisions. */
const TOKEN_HINTS: Record<PropertyKind, readonly string[]> = {
  color: ['color', 'bg-', 'text-', 'accent', 'border', 'success', 'warning', 'error', 'info'],
  length: ['space', 'gap', 'width', 'height', 'size'],
  'font-size': ['font-size'],
  'font-weight': ['font-weight'],
  radius: ['radius'],
  shadow: ['shadow'],
};

/** CSS named colors (CSS Color Module Level 4) mapped to hex. */
const NAMED_COLORS: Record<string, string> = {
  aliceblue: '#f0f8ff', antiquewhite: '#faebd7', aqua: '#00ffff', aquamarine: '#7fffd4',
  azure: '#f0ffff', beige: '#f5f5dc', bisque: '#ffe4c4', black: '#000000',
  blanchedalmond: '#ffebcd', blue: '#0000ff', blueviolet: '#8a2be2', brown: '#a52a2a',
  burlywood: '#deb887', cadetblue: '#5f9ea0', chartreuse: '#7fff00', chocolate: '#d2691e',
  coral: '#ff7f50', cornflowerblue: '#6495ed', cornsilk: '#fff8dc', crimson: '#dc143c',
  cyan: '#00ffff', darkblue: '#00008b', darkcyan: '#008b8b', darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9', darkgreen: '#006400', darkgrey: '#a9a9a9', darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b', darkolivegreen: '#556b2f', darkorange: '#ff8c00',
  darkorchid: '#9932cc', darkred: '#8b0000', darksalmon: '#e9967a', darkseagreen: '#8fbc8f',
  darkslateblue: '#483d8b', darkslategray: '#2f4f4f', darkslategrey: '#2f4f4f',
  darkturquoise: '#00ced1', darkviolet: '#9400d3', deeppink: '#ff1493',
  deepskyblue: '#00bfff', dimgray: '#696969', dimgrey: '#696969', dodgerblue: '#1e90ff',
  firebrick: '#b22222', floralwhite: '#fffaf0', forestgreen: '#228b22', fuchsia: '#ff00ff',
  gainsboro: '#dcdcdc', ghostwhite: '#f8f8ff', gold: '#ffd700', goldenrod: '#daa520',
  gray: '#808080', green: '#008000', greenyellow: '#adff2f', grey: '#808080',
  honeydew: '#f0fff0', hotpink: '#ff69b4', indianred: '#cd5c5c', indigo: '#4b0082',
  ivory: '#fffff0', khaki: '#f0e68c', lavender: '#e6e6fa', lavenderblush: '#fff0f5',
  lawngreen: '#7cfc00', lemonchiffon: '#fffacd', lightblue: '#add8e6', lightcoral: '#f08080',
  lightcyan: '#e0ffff', lightgoldenrodyellow: '#fafad2', lightgray: '#d3d3d3',
  lightgreen: '#90ee90', lightgrey: '#d3d3d3', lightpink: '#ffb6c1', lightsalmon: '#ffa07a',
  lightseagreen: '#20b2aa', lightskyblue: '#87cefa', lightslategray: '#778899',
  lightslategrey: '#778899', lightsteelblue: '#b0c4de', lightyellow: '#ffffe0',
  lime: '#00ff00', limegreen: '#32cd32', linen: '#faf0e6', magenta: '#ff00ff',
  maroon: '#800000', mediumaquamarine: '#66cdaa', mediumblue: '#0000cd',
  mediumorchid: '#ba55d3', mediumpurple: '#9370db', mediumseagreen: '#3cb371',
  mediumslateblue: '#7b68ee', mediumspringgreen: '#00fa9a', mediumturquoise: '#48d1cc',
  mediumvioletred: '#c71585', midnightblue: '#191970', mintcream: '#f5fffa',
  mistyrose: '#ffe4e1', moccasin: '#ffe4b5', navajowhite: '#ffdead', navy: '#000080',
  oldlace: '#fdf5e6', olive: '#808000', olivedrab: '#6b8e23', orange: '#ffa500',
  orangered: '#ff4500', orchid: '#da70d6', palegoldenrod: '#eee8aa', palegreen: '#98fb98',
  paleturquoise: '#afeeee', palevioletred: '#db7093', papayawhip: '#ffefd5',
  peachpuff: '#ffdab9', peru: '#cd853f', pink: '#ffc0cb', plum: '#dda0dd',
  powderblue: '#b0e0e6', purple: '#800080', rebeccapurple: '#663399', red: '#ff0000',
  rosybrown: '#bc8f8f', royalblue: '#4169e1', saddlebrown: '#8b4513', salmon: '#fa8072',
  sandybrown: '#f4a460', seagreen: '#2e8b57', seashell: '#fff5ee', sienna: '#a0522d',
  silver: '#c0c0c0', skyblue: '#87ceeb', slateblue: '#6a5acd', slategray: '#708090',
  slategrey: '#708090', snow: '#fffafa', springgreen: '#00ff7f', steelblue: '#4682b4',
  tan: '#d2b48c', teal: '#008080', thistle: '#d8bfd8', tomato: '#ff6347',
  turquoise: '#40e0d0', violet: '#ee82ee', wheat: '#f5deb3', white: '#ffffff',
  whitesmoke: '#f5f5f5', yellow: '#ffff00', yellowgreen: '#9acd32',
};

const ROOT_FONT_SIZE_PX = 16;

function hexToRgbString(hex: string): string {
  let h = hex.replace('#', '');
  if (h.length === 3 || h.length === 4) {
    h = h.split('').map((c) => c + c).join('');
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (h.length === 8) {
    const a = parseFloat((parseInt(h.slice(6, 8), 16) / 255).toFixed(3));
    return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Normalize a CSS value for equality comparison: lowercase, named colors and
 * hex → rgb()/rgba(), rem → px (16px root), uniform function spacing.
 */
export function normalizeCssValue(value: string): string {
  let v = value.trim().toLowerCase();
  if (v === '') return '';

  // Named colors → hex (whole-word only)
  v = v.replace(/\b[a-z]+\b/g, (word) => NAMED_COLORS[word] ?? word);

  // Hex → rgb()/rgba()
  v = v.replace(/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})\b/g, (m) =>
    hexToRgbString(m),
  );

  // rem → px (root font-size assumed 16px)
  v = v.replace(/(\d*\.?\d+)rem\b/g, (_, n: string) => `${parseFloat(n) * ROOT_FONT_SIZE_PX}px`);

  // Uniform whitespace inside/around functions and commas
  v = v
    .replace(/\s*,\s*/g, ', ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s+/g, ' ');

  // rgba(r, g, b, 1) serializes as rgb(r, g, b)
  v = v.replace(/rgba\(([^)]+), 1\)/g, 'rgb($1)');

  return v;
}

const COLOR_FUNCTION_RE = /\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color)\(/;
const HEX_COLOR_RE = /#[0-9a-f]{3,8}\b/i;
const LENGTH_RE = /(?:^|[\s,(])(\d*\.?\d+)(px|rem|em|pt|%|vw|vh|vmin|vmax|ch|ex)\b/i;

/**
 * Is this value a raw hardcoded literal (hex, rgb/hsl, named color, raw
 * length, or — for font-weight — a bare numeric/keyword weight)?
 */
export function isRawLiteral(value: string, kind: PropertyKind): boolean {
  const v = value.trim().toLowerCase();
  if (v === '') return false;
  if (HEX_COLOR_RE.test(v)) return true;
  if (COLOR_FUNCTION_RE.test(v)) return true;
  if (LENGTH_RE.test(v)) return true;
  const words = v.split(/[\s,()/]+/);
  if (words.some((w) => w in NAMED_COLORS)) return true;
  if (kind === 'font-weight' && (/^\d+$/.test(v) || v === 'bold' || v === 'bolder' || v === 'lighter')) {
    return true;
  }
  return false;
}

/**
 * Find the --sk-* token whose resolved value equals the computed value.
 * On collisions, prefers (1) a token the declaration actually references,
 * then (2) tokens whose name matches the property kind.
 */
export function findMatchingToken(
  computedValue: string,
  tokenMap: ReadonlyMap<string, string>,
  kind: PropertyKind,
  declaredVars: readonly string[] = [],
): string | null {
  const normalized = normalizeCssValue(computedValue);
  if (normalized === '') return null;

  const matches: string[] = [];
  for (const [name, value] of tokenMap) {
    if (normalizeCssValue(value) === normalized) {
      matches.push(name);
    }
  }
  if (matches.length === 0) return null;

  const declared = matches.find((name) => declaredVars.includes(name));
  if (declared) return declared;

  const hints = TOKEN_HINTS[kind];
  const preferred = matches.find((name) => hints.some((hint) => name.includes(hint)));
  return preferred ?? matches[0]!;
}

/** Extract the first --sk-* variable name referenced by a raw CSS value. */
function firstSkVar(rawValue: string): string | null {
  const names = extractVarNames(parseCssValue(rawValue));
  return names.find((n) => n.startsWith('--sk-')) ?? null;
}

/** Collect the literal (non-var) text of a parsed CSS value. */
function literalText(value: CssValue): string {
  switch (value.type) {
    case 'literal':
      return value.value;
    case 'var':
      return '';
    case 'composite':
      return value.parts.map(literalText).filter(Boolean).join(' ');
  }
}

/**
 * A shorthand declaration is "safe" to attribute to its token when it
 * consists ONLY of var() expressions — e.g. `padding: var(--sk-space-sm)`.
 * `border: 1.5px solid var(--sk-border)` is NOT safe: the 1.5px is hardcoded.
 */
function isSafeShorthand(rawValue: string): boolean {
  if (!containsVar(rawValue)) return false;
  return literalText(parseCssValue(rawValue)).trim() === '';
}

interface Declaration {
  value: string;
  fromShorthand: boolean;
}

function findDeclaration(
  rawStyles: ReadonlyMap<string, { value: string; source: 'stylesheet' | 'inline' }>,
  prop: AuditedProperty,
): Declaration | null {
  const direct = rawStyles.get(prop.name);
  if (direct) return { value: direct.value, fromShorthand: false };
  for (const shorthand of prop.shorthands) {
    const decl = rawStyles.get(shorthand);
    if (decl) return { value: decl.value, fromShorthand: true };
  }
  return null;
}

function classifyProperty(
  prop: AuditedProperty,
  computedValue: string,
  declaration: Declaration | null,
  tokenMap: ReadonlyMap<string, string>,
): Pick<ThemeAuditRow, 'status' | 'token' | 'note'> {
  // 1. Direct longhand declaration through a --sk-* token
  if (declaration && !declaration.fromShorthand && containsVar(declaration.value)) {
    const token = firstSkVar(declaration.value);
    if (token) return { status: 'on-theme', token, note: null };
  }

  // 1b. Computed value still carries the var() reference (engine quirk guard)
  if (computedValue.includes('var(--sk-')) {
    return { status: 'on-theme', token: firstSkVar(computedValue), note: null };
  }

  // 2. Computed value exactly equals a resolved --sk-* token value.
  //    Tokens referenced by the declaration (incl. shorthands) win collisions.
  const declaredVars = declaration
    ? extractVarNames(parseCssValue(declaration.value)).filter((n) => n.startsWith('--sk-'))
    : [];
  const matchedToken = findMatchingToken(computedValue, tokenMap, prop.kind, declaredVars);
  if (matchedToken) return { status: 'on-theme', token: matchedToken, note: null };

  // 3. Token-only shorthand (e.g. `padding: var(--sk-space-sm)`)
  if (declaration?.fromShorthand && isSafeShorthand(declaration.value)) {
    const token = firstSkVar(declaration.value);
    if (token) return { status: 'on-theme', token, note: 'via shorthand' };
  }

  // 4. Neutral values — absence of styling
  const normalized = normalizeCssValue(computedValue);
  if (NEUTRAL_VALUES.has(normalized)) {
    return { status: 'default', token: null, note: null };
  }
  if (!declaration && (IMPLICIT_DEFAULTS[prop.name] ?? []).includes(normalized)) {
    return { status: 'default', token: null, note: null };
  }

  // 5. Hardcoded literal or any non-token declaration → off-theme
  if (isRawLiteral(computedValue, prop.kind) || declaration) {
    return { status: 'off-theme', token: null, note: 'hardcoded — not from a --sk-* token' };
  }

  // 6. Anything else (keywords like `invert`) is not a theme signal
  return { status: 'default', token: null, note: null };
}

/** Parse a computed font-size into px, handling rem via normalization. */
function fontSizePx(computedValue: string): number | null {
  const match = normalizeCssValue(computedValue).match(/^(\d*\.?\d+)px$/);
  return match ? parseFloat(match[1]!) : null;
}

/**
 * Audit every visual CSS property of an element against the theme tokens.
 *
 * @param element  The inspected element.
 * @param tokenMap Resolved --sk-* token values (from `resolveAllTokens()`).
 */
export function auditThemeCompliance(
  element: HTMLElement,
  tokenMap: ReadonlyMap<string, string>,
): ThemeAuditRow[] {
  const computed = getComputedStyle(element);
  const rawStyles = getRawStyles(element);
  const rows: ThemeAuditRow[] = [];

  for (const prop of AUDITED_PROPERTIES) {
    const computedValue = computed.getPropertyValue(prop.name).trim();
    const declaration = findDeclaration(rawStyles, prop);
    const classification = classifyProperty(prop, computedValue, declaration, tokenMap);

    const row: ThemeAuditRow = {
      property: prop.name,
      computedValue,
      rawValue: declaration?.value ?? null,
      ...classification,
    };

    // Tiny-text floor applies regardless of token status
    if (prop.kind === 'font-size') {
      const px = fontSizePx(computedValue);
      if (px !== null && px < READABILITY_FLOOR_PX) {
        row.status = 'tiny-text';
        row.note = `${computedValue} — below the ${READABILITY_FLOOR_PX}px readability floor`;
      }
    }

    rows.push(row);
  }

  return rows;
}

/** Tally a set of audit rows into the headline summary counts. */
export function summarizeThemeAudit(rows: readonly ThemeAuditRow[]): ThemeAuditSummary {
  const summary: ThemeAuditSummary = {
    onTheme: 0,
    offTheme: 0,
    tinyText: 0,
    defaults: 0,
    total: rows.length,
  };
  for (const row of rows) {
    switch (row.status) {
      case 'on-theme':
        summary.onTheme += 1;
        break;
      case 'off-theme':
        summary.offTheme += 1;
        break;
      case 'tiny-text':
        summary.tinyText += 1;
        break;
      case 'default':
        summary.defaults += 1;
        break;
    }
  }
  return summary;
}
