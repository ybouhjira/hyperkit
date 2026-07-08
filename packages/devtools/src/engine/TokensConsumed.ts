import { findMatchingRules } from './StylesheetMatcher';

/** A design token (`--sk-*` custom property) an element's styles reference. */
export interface ConsumedToken {
  /** Token name, e.g. "--sk-bg-secondary" */
  name: string;
  /** Resolved value (from the token map or the element's computed style), or null when unset */
  value: string | null;
  /** True when the resolved value parses as a color (renderable as a swatch) */
  isColor: boolean;
  /** CSS properties whose declarations reference this token, e.g. ["background", "border-color"] */
  properties: string[];
}

const SK_VAR_RE = /var\(\s*(--sk-[a-z0-9-]+)/gi;
const COLOR_VALUE_RE = /^(#|rgba?\(|hsla?\(|oklch\(|oklab\(|color-mix\(|color\(|light-dark\()/i;

/**
 * List every `--sk-*` design token the element's matched CSS rules (and
 * inline styles) actually reference, with each token resolved to its
 * current value. This is the "what HyperKit is doing on this element"
 * data: the exact theme tokens the component consumes.
 *
 * @param element  The inspected element.
 * @param tokenMap Resolved token values, e.g. from `resolveAllTokens()`.
 */
export function tokensConsumed(
  element: HTMLElement,
  tokenMap: Map<string, string>,
): ConsumedToken[] {
  const tokenProps = new Map<string, Set<string>>();

  const record = (property: string, rawValue: string): void => {
    SK_VAR_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = SK_VAR_RE.exec(rawValue)) !== null) {
      const token = match[1]!;
      let props = tokenProps.get(token);
      if (!props) {
        props = new Set<string>();
        tokenProps.set(token, props);
      }
      props.add(property);
    }
  };

  for (const rule of findMatchingRules(element)) {
    for (const [property, value] of Object.entries(rule.properties)) {
      record(property, value);
    }
  }

  for (let i = 0; i < element.style.length; i++) {
    const property = element.style.item(i);
    record(property, element.style.getPropertyValue(property));
  }

  const computed = getComputedStyle(element);
  const tokens: ConsumedToken[] = [];

  for (const [name, props] of tokenProps) {
    const resolved = tokenMap.get(name) ?? computed.getPropertyValue(name).trim();
    const value = resolved !== '' ? resolved : null;
    tokens.push({
      name,
      value,
      isColor: value !== null && COLOR_VALUE_RE.test(value),
      properties: [...props].sort(),
    });
  }

  return tokens.sort((a, b) => a.name.localeCompare(b.name));
}
