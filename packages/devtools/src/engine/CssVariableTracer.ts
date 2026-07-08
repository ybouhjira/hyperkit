import type { CssVarTrace, InspectedProperty, VarSource } from '../context/types';
import { parseCssValue, extractVarNames, containsVar } from './css-parser';
import { resolveVarSource, isThemeToken, getAllTokenNames } from './TokenRegistry';
import { getRawStyles } from './StylesheetMatcher';

/**
 * Trace all CSS properties of an element, resolving var() chains.
 */
export function traceElementStyles(
  element: HTMLElement,
  themeName: string,
): InspectedProperty[] {
  const rawStyles = getRawStyles(element);
  const computed = getComputedStyle(element);
  const properties: InspectedProperty[] = [];

  for (const [name, { value, source }] of rawStyles) {
    const computedValue = computed.getPropertyValue(name).trim();
    const traces = containsVar(value)
      ? traceVarChain(element, value, themeName)
      : [];

    properties.push({
      name,
      computedValue,
      rawValue: value,
      traces,
      source,
    });
  }

  return properties;
}

/**
 * Trace a single CSS value's var() chain.
 * Returns an array of CssVarTrace for each var() found.
 */
export function traceVarChain(
  element: HTMLElement,
  rawValue: string,
  themeName: string,
): CssVarTrace[] {
  const parsed = parseCssValue(rawValue);
  const varNames = extractVarNames(parsed);
  const traces: CssVarTrace[] = [];

  for (const varName of varNames) {
    traces.push(traceSingleVar(element, varName, themeName, new Set()));
  }

  return traces;
}

/**
 * Trace a single CSS variable, recursively resolving fallbacks.
 */
function traceSingleVar(
  element: HTMLElement,
  varName: string,
  themeName: string,
  visited: Set<string>,
): CssVarTrace {
  // Prevent infinite loops
  if (visited.has(varName)) {
    return {
      variable: varName,
      value: null,
      isSet: false,
      source: { type: 'unset' },
    };
  }
  visited.add(varName);

  const computed = getComputedStyle(element);
  const rawValue = computed.getPropertyValue(varName).trim();
  const isSet = rawValue !== '';
  const source = isSet
    ? resolveVarSource(varName, themeName)
    : ({ type: 'unset' } as VarSource);

  const trace: CssVarTrace = {
    variable: varName,
    value: isSet ? rawValue : null,
    isSet,
    source,
  };

  // If the resolved value itself contains var(), trace the fallback chain
  if (isSet && containsVar(rawValue)) {
    const innerVars = extractVarNames(parseCssValue(rawValue));
    if (innerVars.length > 0 && innerVars[0]) {
      trace.fallbackTrace = traceSingleVar(element, innerVars[0], themeName, visited);
    }
  }

  return trace;
}

/**
 * Resolve all theme token values for a root element.
 * Returns a map of variable name → current value.
 */
export function resolveAllTokens(root?: HTMLElement): Map<string, string> {
  const el = root ?? document.documentElement;
  const computed = getComputedStyle(el);
  const tokens = new Map<string, string>();

  for (const varName of getAllTokenNames()) {
    const value = computed.getPropertyValue(varName).trim();
    if (value) {
      tokens.set(varName, value);
    }
  }

  return tokens;
}

/**
 * Get a human-readable description of where a CSS value comes from.
 */
export function describeTrace(trace: CssVarTrace): string {
  const parts: string[] = [];
  let current: CssVarTrace | undefined = trace;

  while (current) {
    const status = current.isSet ? `= ${current.value}` : '(not set)';
    const sourceDesc = describeSource(current.source);
    parts.push(`${current.variable}: ${status}${sourceDesc ? ` ← ${sourceDesc}` : ''}`);
    current = current.fallbackTrace;
  }

  return parts.join('\n  → fallback: ');
}

function describeSource(source: VarSource): string {
  switch (source.type) {
    case 'theme':
      return `${source.key} (${source.themeName})`;
    case 'component-override':
      return `component override`;
    case 'custom-property':
      return `custom property`;
    case 'inline':
      return `inline style`;
    case 'unset':
      return '';
  }
}
