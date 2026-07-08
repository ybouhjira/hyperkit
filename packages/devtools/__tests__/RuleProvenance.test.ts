import { describe, it, expect } from 'vitest';
import { cleanSourceName, classifyRule, INLINE_SOURCE } from '../src/engine/RuleProvenance';

describe('RuleProvenance', () => {
  describe('cleanSourceName', () => {
    it('strips the Vite content hash from a full https URL', () => {
      expect(cleanSourceName('https://example.com/assets/Card-CyVyeno4.css')).toBe('Card.css');
    });

    it('strips the hash from another component sheet', () => {
      expect(cleanSourceName('https://example.com/assets/Badge-DcubNvAl.css')).toBe('Badge.css');
    });

    it('strips the hash from a lowercase app sheet', () => {
      expect(cleanSourceName('https://example.com/assets/app-Bq3kV9Lm.css')).toBe('app.css');
    });

    it('takes the basename of a path without protocol', () => {
      expect(cleanSourceName('/assets/EmptyState-aB3xYz9_.css')).toBe('EmptyState.css');
    });

    it('handles a bare filename with no path', () => {
      expect(cleanSourceName('StatusDot-Xk29fmQa.css')).toBe('StatusDot.css');
    });

    it('passes through a filename without a hash', () => {
      expect(cleanSourceName('https://example.com/styles.css')).toBe('styles.css');
    });

    it('keeps kebab-case names whose last segment is shorter than 6 chars', () => {
      expect(cleanSourceName('/assets/data-table.css')).toBe('data-table.css');
    });

    it('strips a hash of exactly 6 chars', () => {
      expect(cleanSourceName('/assets/plan-abc123.css')).toBe('plan.css');
    });

    it('strips underscore-containing hashes', () => {
      expect(cleanSourceName('/assets/Card-_aB3xY_9.css')).toBe('Card.css');
    });

    it('only strips the trailing hash, not earlier segments', () => {
      expect(cleanSourceName('/assets/Card-CyVyeno4-Dk38fmQa.css')).toBe('Card-CyVyeno4.css');
    });

    it('drops a query string before processing', () => {
      expect(cleanSourceName('https://example.com/assets/app-Bq3kV9Lm.css?v=123')).toBe('app.css');
    });

    it('drops a URL fragment before processing', () => {
      expect(cleanSourceName('https://example.com/assets/plan-Xk29fmQa.css#section')).toBe('plan.css');
    });

    it('returns inline for the literal "inline" source', () => {
      expect(cleanSourceName('inline')).toBe(INLINE_SOURCE);
    });

    it('returns inline for <style> tag text content snippets', () => {
      expect(cleanSourceName('.sk-btn { background: var(--sk-accent); color: w')).toBe(
        INLINE_SOURCE,
      );
    });

    it('returns inline for an empty string', () => {
      expect(cleanSourceName('')).toBe(INLINE_SOURCE);
    });

    it('returns inline for a URL that does not end in .css', () => {
      expect(cleanSourceName('https://example.com/assets/Card-CyVyeno4.js')).toBe(INLINE_SOURCE);
    });
  });

  describe('classifyRule', () => {
    it('classifies a .sk- rule from a PascalCase component sheet as hyperkit', () => {
      expect(
        classifyRule({
          selector: '.sk-card',
          source: 'https://example.com/assets/Card-CyVyeno4.css',
        }),
      ).toBe('hyperkit');
    });

    it('classifies a non-sk rule from a PascalCase component sheet as hyperkit', () => {
      expect(
        classifyRule({
          selector: 'div[data-state="open"]',
          source: '/assets/EmptyState-aB3xYz9_.css',
        }),
      ).toBe('hyperkit');
    });

    it('classifies an app BEM rule from a lowercase sheet as app', () => {
      expect(
        classifyRule({
          selector: '.plan__board',
          source: 'https://example.com/assets/plan-Xk29fmQa.css',
        }),
      ).toBe('app');
    });

    it('classifies an app.css rule overriding a .sk- component as app (the override case)', () => {
      expect(
        classifyRule({
          selector: '.sk-badge',
          source: 'https://example.com/assets/app-Bq3kV9Lm.css',
        }),
      ).toBe('app');
    });

    it('classifies a descendant .sk- override from a lowercase sheet as app', () => {
      expect(
        classifyRule({
          selector: '.plan .sk-badge--success',
          source: '/assets/plan-Xk29fmQa.css',
        }),
      ).toBe('app');
    });

    it('classifies an inline rule with a .sk- class token as hyperkit', () => {
      expect(classifyRule({ selector: '.sk-btn--primary:hover', source: 'inline' })).toBe(
        'hyperkit',
      );
    });

    it('classifies an inline rule without a .sk- class token as app', () => {
      expect(classifyRule({ selector: '.custom-thing', source: 'inline' })).toBe('app');
    });

    it('does not treat ".risk-" as a .sk- token', () => {
      expect(classifyRule({ selector: '.risk-card', source: 'inline' })).toBe('app');
    });

    it('uses the selector signal for <style> tag text-content sources', () => {
      expect(
        classifyRule({
          selector: '.sk-devtools__panel',
          source: '.sk-devtools__panel { position: fixed; }',
        }),
      ).toBe('hyperkit');
    });

    it('classifies a StatusDot.css rule as hyperkit', () => {
      expect(
        classifyRule({ selector: '.sk-status-dot', source: '/assets/StatusDot-Xk29fmQa.css' }),
      ).toBe('hyperkit');
    });
  });
});
