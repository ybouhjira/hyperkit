import type { CssValue, VarExpression } from '../context/types';

/**
 * Parse a CSS value string into a tree of CssValue nodes.
 * Handles nested var() with fallback chains.
 *
 * Examples:
 *   "red" → { type: 'literal', value: 'red' }
 *   "var(--sk-accent)" → { type: 'var', name: '--sk-accent', fallback: null }
 *   "var(--a, var(--b, blue))" → nested VarExpression
 *   "1px solid var(--sk-border)" → composite with literal + var parts
 */
export function parseCssValue(input: string): CssValue {
  const trimmed = input.trim();
  if (trimmed === '') return { type: 'literal', value: '' };

  const parts = splitTopLevelParts(trimmed);
  if (parts.length === 1) {
    return parseSingleValue(parts[0]!);
  }
  return { type: 'composite', parts: parts.map(parseSingleValue) };
}

function parseSingleValue(input: string): CssValue {
  const trimmed = input.trim();
  if (trimmed.startsWith('var(')) {
    return parseVarExpression(trimmed);
  }
  return { type: 'literal', value: trimmed };
}

function parseVarExpression(input: string): VarExpression {
  // Strip outer var( ... )
  const inner = stripOuterVar(input);
  if (inner === null) {
    return { type: 'var', name: input, fallback: null };
  }

  const commaIdx = findTopLevelComma(inner);
  if (commaIdx === -1) {
    return { type: 'var', name: inner.trim(), fallback: null };
  }

  const name = inner.slice(0, commaIdx).trim();
  const fallbackStr = inner.slice(commaIdx + 1).trim();
  const fallback = parseCssValue(fallbackStr);

  return { type: 'var', name, fallback };
}

function stripOuterVar(input: string): string | null {
  if (!input.startsWith('var(') || !input.endsWith(')')) return null;
  return input.slice(4, -1);
}

function findTopLevelComma(input: string): number {
  let depth = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) return i;
  }
  return -1;
}

/**
 * Split a CSS value at top-level boundaries where var() begins,
 * preserving non-var() literal segments.
 */
function splitTopLevelParts(input: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  let i = 0;

  while (i < input.length) {
    if (depth === 0 && input.slice(i).startsWith('var(')) {
      const before = current.trim();
      if (before) parts.push(before);
      current = '';

      // Capture entire var(...) including nested parens
      const start = i;
      depth = 0;
      while (i < input.length) {
        if (input[i] === '(') depth++;
        else if (input[i] === ')') {
          depth--;
          if (depth === 0) { i++; break; }
        }
        i++;
      }
      parts.push(input.slice(start, i));
    } else {
      current += input[i];
      i++;
    }
  }

  const remaining = current.trim();
  if (remaining) parts.push(remaining);

  return parts.length === 0 ? [input] : parts;
}

/**
 * Extract all var() names from a parsed CssValue tree.
 */
export function extractVarNames(value: CssValue): string[] {
  const names: string[] = [];
  collectVarNames(value, names);
  return names;
}

function collectVarNames(value: CssValue, names: string[]): void {
  switch (value.type) {
    case 'var':
      names.push(value.name);
      if (value.fallback) collectVarNames(value.fallback, names);
      break;
    case 'composite':
      for (const part of value.parts) collectVarNames(part, names);
      break;
    case 'literal':
      break;
  }
}

/**
 * Check if a CSS value string contains any var() references.
 */
export function containsVar(input: string): boolean {
  return input.includes('var(');
}
