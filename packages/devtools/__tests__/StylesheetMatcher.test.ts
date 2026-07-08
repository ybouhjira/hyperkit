import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { calculateSpecificity, findMatchingRules, getRawStyles } from '../src/engine/StylesheetMatcher';

describe('StylesheetMatcher', () => {
  describe('calculateSpecificity', () => {
    it('calculates element selector', () => {
      expect(calculateSpecificity('div')).toEqual([0, 0, 1]);
    });

    it('calculates class selector', () => {
      expect(calculateSpecificity('.my-class')).toEqual([0, 1, 0]);
    });

    it('calculates id selector', () => {
      expect(calculateSpecificity('#my-id')).toEqual([1, 0, 0]);
    });

    it('calculates compound selector', () => {
      expect(calculateSpecificity('div.my-class')).toEqual([0, 1, 1]);
    });

    it('calculates multi-class selector', () => {
      expect(calculateSpecificity('.a.b.c')).toEqual([0, 3, 0]);
    });

    it('calculates id + class + element', () => {
      expect(calculateSpecificity('#id .class div')).toEqual([1, 1, 1]);
    });

    it('handles attribute selectors', () => {
      expect(calculateSpecificity('[type="text"]')).toEqual([0, 1, 0]);
    });

    it('handles comma-separated selectors (uses first)', () => {
      expect(calculateSpecificity('.a, .b.c')).toEqual([0, 1, 0]);
    });
  });

  describe('findMatchingRules', () => {
    let style: HTMLStyleElement;
    let testEl: HTMLElement;

    beforeEach(() => {
      style = document.createElement('style');
      style.textContent = `
        .sk-btn { background: var(--sk-accent); color: white; }
        .sk-btn--primary { background: var(--sk-btn-primary-bg, var(--sk-accent)); }
        .sk-btn--md { padding: var(--sk-space-sm) var(--sk-space-md); }
        .unrelated { color: red; }
      `;
      document.head.appendChild(style);

      testEl = document.createElement('button');
      testEl.className = 'sk-btn sk-btn--primary sk-btn--md';
      document.body.appendChild(testEl);
    });

    afterEach(() => {
      document.head.removeChild(style);
      document.body.removeChild(testEl);
    });

    it('finds matching rules for a SolidKit button', () => {
      const rules = findMatchingRules(testEl);
      expect(rules.length).toBe(3);

      const selectors = rules.map(r => r.selector);
      expect(selectors).toContain('.sk-btn');
      expect(selectors).toContain('.sk-btn--primary');
      expect(selectors).toContain('.sk-btn--md');
      expect(selectors).not.toContain('.unrelated');
    });

    it('preserves raw var() values in properties', () => {
      const rules = findMatchingRules(testEl);
      const btnRule = rules.find(r => r.selector === '.sk-btn--primary');
      expect(btnRule).toBeDefined();
      expect(btnRule!.properties['background']).toContain('var(');
    });

    it('sorts by specificity (highest first)', () => {
      const rules = findMatchingRules(testEl);
      for (let i = 0; i < rules.length - 1; i++) {
        const a = rules[i]!.specificity;
        const b = rules[i + 1]!.specificity;
        const cmp = a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
        expect(cmp).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('getRawStyles', () => {
    let style: HTMLStyleElement;
    let testEl: HTMLElement;

    beforeEach(() => {
      style = document.createElement('style');
      style.textContent = `.test-el { color: var(--sk-text-primary); font-size: 14px; }`;
      document.head.appendChild(style);

      testEl = document.createElement('div');
      testEl.className = 'test-el';
      testEl.style.setProperty('color', 'red');
      document.body.appendChild(testEl);
    });

    afterEach(() => {
      document.head.removeChild(style);
      document.body.removeChild(testEl);
    });

    it('includes both stylesheet and inline styles', () => {
      const styles = getRawStyles(testEl);
      expect(styles.has('color')).toBe(true);
      expect(styles.has('font-size')).toBe(true);
    });

    it('inline styles override stylesheet', () => {
      const styles = getRawStyles(testEl);
      const color = styles.get('color');
      expect(color).toBeDefined();
      expect(color!.source).toBe('inline');
      expect(color!.value).toBe('red');
    });
  });
});
