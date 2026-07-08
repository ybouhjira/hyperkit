import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { traceVarChain, traceElementStyles, describeTrace } from '../src/engine/CssVariableTracer';

describe('CssVariableTracer', () => {
  let style: HTMLStyleElement;
  let testEl: HTMLElement;

  beforeEach(() => {
    // Component styles
    style = document.createElement('style');
    style.textContent = `
      .sk-btn {
        background: var(--sk-accent);
        color: var(--sk-text-primary);
        padding: var(--sk-space-sm) var(--sk-space-md);
      }
      .sk-btn--primary {
        background: var(--sk-btn-primary-bg, var(--sk-accent));
      }
    `;
    document.head.appendChild(style);

    testEl = document.createElement('button');
    testEl.className = 'sk-btn sk-btn--primary';
    document.body.appendChild(testEl);

    // jsdom doesn't support CSS custom property inheritance from :root.
    // Set properties directly on the element to simulate resolved tokens.
    testEl.style.setProperty('--sk-accent', '#5b9cf5');
    testEl.style.setProperty('--sk-text-primary', '#e0e0e0');
    testEl.style.setProperty('--sk-bg-primary', '#1e1e1e');
    testEl.style.setProperty('--sk-space-sm', '8px');
    testEl.style.setProperty('--sk-space-md', '16px');
  });

  afterEach(() => {
    document.head.removeChild(style);
    document.body.removeChild(testEl);
  });

  describe('traceVarChain', () => {
    it('traces a simple theme variable', () => {
      const traces = traceVarChain(testEl, 'var(--sk-accent)', 'Test Theme');
      expect(traces).toHaveLength(1);
      expect(traces[0]!.variable).toBe('--sk-accent');
      expect(traces[0]!.isSet).toBe(true);
      expect(traces[0]!.value).toBe('#5b9cf5');
      expect(traces[0]!.source).toEqual({
        type: 'theme',
        group: 'Colors',
        key: 'colors.accent',
        themeName: 'Test Theme',
      });
    });

    it('traces nested var() with fallback', () => {
      const traces = traceVarChain(
        testEl,
        'var(--sk-btn-primary-bg, var(--sk-accent))',
        'Test Theme',
      );
      expect(traces).toHaveLength(2);

      // First var: --sk-btn-primary-bg (not set, it's a component override)
      expect(traces[0]!.variable).toBe('--sk-btn-primary-bg');
      expect(traces[0]!.isSet).toBe(false);

      // Second var: --sk-accent (the fallback, is set via element style)
      expect(traces[1]!.variable).toBe('--sk-accent');
      expect(traces[1]!.isSet).toBe(true);
      expect(traces[1]!.value).toBe('#5b9cf5');
    });

    it('traces multiple var() in one value', () => {
      const traces = traceVarChain(
        testEl,
        'var(--sk-space-sm) var(--sk-space-md)',
        'Test Theme',
      );
      expect(traces).toHaveLength(2);
      expect(traces[0]!.variable).toBe('--sk-space-sm');
      expect(traces[0]!.value).toBe('8px');
      expect(traces[1]!.variable).toBe('--sk-space-md');
      expect(traces[1]!.value).toBe('16px');
    });

    it('marks unset variables', () => {
      const traces = traceVarChain(testEl, 'var(--nonexistent)', 'Test Theme');
      expect(traces).toHaveLength(1);
      expect(traces[0]!.isSet).toBe(false);
      expect(traces[0]!.value).toBeNull();
      expect(traces[0]!.source.type).toBe('unset');
    });
  });

  describe('traceElementStyles', () => {
    it('returns traced properties for a styled element', () => {
      const properties = traceElementStyles(testEl, 'Test Theme');
      expect(properties.length).toBeGreaterThan(0);

      const bgProp = properties.find(p => p.name === 'background');
      if (bgProp) {
        expect(bgProp.rawValue).toContain('var(');
        expect(bgProp.traces.length).toBeGreaterThan(0);
      }
    });
  });

  describe('describeTrace', () => {
    it('describes a simple resolved trace', () => {
      const traces = traceVarChain(testEl, 'var(--sk-accent)', 'Zed Dark');
      const desc = describeTrace(traces[0]!);
      expect(desc).toContain('--sk-accent');
      expect(desc).toContain('#5b9cf5');
      expect(desc).toContain('colors.accent');
      expect(desc).toContain('Zed Dark');
    });

    it('describes an unset variable', () => {
      const traces = traceVarChain(testEl, 'var(--nonexistent)', 'Zed Dark');
      const desc = describeTrace(traces[0]!);
      expect(desc).toContain('--nonexistent');
      expect(desc).toContain('not set');
    });
  });
});
