/**
 * RuleProvenance — pure classification of matched CSS rules by origin.
 *
 * Answers two questions for every `MatchedRule`:
 *  1. WHICH FILE does the rule come from? (`cleanSourceName`)
 *  2. Is it HyperKit component CSS or app/custom CSS? (`classifyRule`)
 *
 * The whole point is spotting app CSS that overrides HyperKit components:
 * a rule that physically lives in `app.css` is app/custom CSS even when its
 * selector targets a `.sk-*` class — that IS the override the user needs to see.
 */

/** Origin of a matched CSS rule. */
export type RuleOrigin = 'hyperkit' | 'app';

/** Vite content hash: trailing `-[A-Za-z0-9_]{6,}` right before `.css`. */
const VITE_HASH_RE = /-[A-Za-z0-9_]{6,}(?=\.css$)/;

/** A `.sk-` class token anywhere in a selector (`.sk-card`, `.plan .sk-badge:hover`). */
const SK_CLASS_TOKEN_RE = /\.sk-/;

/** Marker returned for non-file sources (`<style>` tags, inline styles). */
export const INLINE_SOURCE = 'inline';

/**
 * Turn a stylesheet source (href or `<style>` text snippet) into a readable
 * filename:
 * - `https://host/assets/Card-CyVyeno4.css` → `Card.css` (Vite hash stripped)
 * - `/assets/app-Bq3kV9Lm.css?v=2` → `app.css` (query/fragment dropped)
 * - `inline` / `<style>` text content / anything not ending in `.css` → `inline`
 *
 * The hash pattern requires 6+ chars so real kebab names survive:
 * `data-table.css` stays `data-table.css` (`table` is only 5 chars).
 */
export function cleanSourceName(source: string): string {
  const withoutQuery = source.split('?')[0]!.split('#')[0]!;
  if (!withoutQuery.endsWith('.css')) {
    return INLINE_SOURCE;
  }
  const segments = withoutQuery.split('/');
  const basename = segments[segments.length - 1]!;
  return basename.replace(VITE_HASH_RE, '');
}

/**
 * Classify a matched rule as HyperKit component CSS or app/custom CSS.
 *
 * - Source is a known `.css` file → filename casing decides:
 *   PascalCase (`Card.css`, `EmptyState.css`) = code-split HyperKit component
 *   CSS → `'hyperkit'`; lowercase/kebab (`app.css`, `plan.css`) = app CSS →
 *   `'app'` — even when the selector targets `.sk-*`, because an `app.css`
 *   rule hitting `.sk-badge` is precisely the custom override to surface.
 * - Source is inline/unknown → the selector's `.sk-` class token decides.
 */
export function classifyRule(rule: { selector: string; source: string }): RuleOrigin {
  const file = cleanSourceName(rule.source);
  if (file === INLINE_SOURCE) {
    return SK_CLASS_TOKEN_RE.test(rule.selector) ? 'hyperkit' : 'app';
  }
  return /^[A-Z]/.test(file) ? 'hyperkit' : 'app';
}
