import type { MatchedRule } from '../context/types';

/**
 * Find all CSS rules from document stylesheets that match a given element.
 * Skips cross-origin stylesheets that would throw SecurityError.
 */
export function findMatchingRules(element: HTMLElement): MatchedRule[] {
  const matched: MatchedRule[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      // Cross-origin stylesheet — skip
      continue;
    }

    const source = sheet.href ?? sheet.ownerNode?.textContent?.slice(0, 50) ?? 'inline';
    collectMatchingRules(element, rules, source, matched);
  }

  // Sort by specificity (highest first)
  matched.sort((a, b) => compareSpecificity(b.specificity, a.specificity));
  return matched;
}

function collectMatchingRules(
  element: HTMLElement,
  rules: CSSRuleList,
  source: string,
  matched: MatchedRule[],
): void {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      if (elementMatchesSelector(element, rule.selectorText)) {
        matched.push({
          selector: rule.selectorText,
          specificity: calculateSpecificity(rule.selectorText),
          properties: extractProperties(rule.style),
          source,
        });
      }
    } else if (rule instanceof CSSMediaRule) {
      // Recurse into @media blocks if the media matches
      if (window.matchMedia(rule.conditionText).matches) {
        collectMatchingRules(element, rule.cssRules, source, matched);
      }
    } else if (rule instanceof CSSLayerBlockRule) {
      collectMatchingRules(element, rule.cssRules, source, matched);
    }
  }
}

function elementMatchesSelector(element: HTMLElement, selectorText: string): boolean {
  try {
    // selectorText may contain multiple selectors separated by commas
    return element.matches(selectorText);
  } catch {
    return false;
  }
}

/**
 * Extract all declared properties from a CSSStyleDeclaration.
 * Returns raw values (before computation) to preserve var() references.
 */
function extractProperties(style: CSSStyleDeclaration): Record<string, string> {
  const props: Record<string, string> = {};
  for (let i = 0; i < style.length; i++) {
    const name = style.item(i);
    const value = style.getPropertyValue(name);
    if (value) {
      props[name] = value;
    }
  }
  return props;
}

/**
 * Calculate CSS specificity as [id, class, element] tuple.
 * Simplified implementation — handles most common selectors.
 */
export function calculateSpecificity(selector: string): [number, number, number] {
  // Take only the first selector if comma-separated
  const first = selector.split(',')[0]!.trim();

  let ids = 0;
  let classes = 0;
  let elements = 0;

  // Remove :not() content but count its internals
  const withoutNot = first.replace(/:not\(([^)]*)\)/g, (_, inner: string) => {
    const [i, c, e] = calculateSpecificity(inner);
    ids += i;
    classes += c;
    elements += e;
    return '';
  });

  // Count #id selectors
  ids += (withoutNot.match(/#[a-zA-Z_][\w-]*/g) ?? []).length;

  // Count .class, [attr], :pseudo-class selectors
  classes += (withoutNot.match(/\.[a-zA-Z_][\w-]*/g) ?? []).length;
  classes += (withoutNot.match(/\[[^\]]*\]/g) ?? []).length;
  classes += (withoutNot.match(/:[a-zA-Z][\w-]*(?!\()/g) ?? []).length;

  // Count element and ::pseudo-element selectors
  const cleaned = withoutNot
    .replace(/#[a-zA-Z_][\w-]*/g, '')
    .replace(/\.[a-zA-Z_][\w-]*/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/:[a-zA-Z][\w-]*/g, '')
    .replace(/::[a-zA-Z][\w-]*/g, (m) => { elements++; return ''; })
    .trim();

  // Count remaining element selectors
  const elementParts = cleaned.split(/[\s>+~]+/).filter(s => s && s !== '*');
  elements += elementParts.length;

  return [ids, classes, elements];
}

function compareSpecificity(
  a: [number, number, number],
  b: [number, number, number],
): number {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1] - b[1];
  return a[2] - b[2];
}

/**
 * Get all raw CSS property values for an element (before var() resolution).
 * Combines matching stylesheet rules and inline styles.
 */
export function getRawStyles(element: HTMLElement): Map<string, { value: string; source: 'stylesheet' | 'inline' }> {
  const styles = new Map<string, { value: string; source: 'stylesheet' | 'inline' }>();

  // Stylesheet rules (sorted by specificity, lower first so higher overwrites)
  const rules = findMatchingRules(element).reverse();
  for (const rule of rules) {
    for (const [prop, value] of Object.entries(rule.properties)) {
      styles.set(prop, { value, source: 'stylesheet' });
    }
  }

  // Inline styles override everything
  for (let i = 0; i < element.style.length; i++) {
    const name = element.style.item(i);
    const value = element.style.getPropertyValue(name);
    if (value) {
      styles.set(name, { value, source: 'inline' });
    }
  }

  return styles;
}
